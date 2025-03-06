const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Fetch all valid user IDs from the "Users" collection
async function getAllUserIds() {
  console.log("🔍 Fetching all valid user IDs from Users collection...");
  const usersSnapshot = await db.collection('Users').get();
  const userIds = usersSnapshot.docs.map(doc => doc.id);
  
  if (userIds.length === 0) {
    console.error("❌ No valid users found! The Users collection is empty.");
    process.exit(1);
  }

  console.log(`✅ Found ${userIds.length} valid user IDs.`);
  return userIds;
}

// Validate and update user_id fields in a collection
async function fixCollectionUserReferences(collectionName, userIdField, validUserIds) {
  console.log(`🔍 Checking ${collectionName} for incorrectly formatted '${userIdField}' references...`);
  
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  const batch = db.batch();
  let changes = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    let currentUserId = data[userIdField];

    // If the field is missing or null, set a new valid user
    if (!currentUserId) {
      console.log(`❌ Missing '${userIdField}' in ${collectionName}/${doc.id}. Assigning a new user...`);

      // Pick a random valid user_id
      const newUserId = validUserIds[Math.floor(Math.random() * validUserIds.length)];
      const formattedUserRef = db.doc(`/Users/${newUserId}`); // Firestore Reference

      batch.update(doc.ref, {
        [userIdField]: formattedUserRef
      });

      console.log(`🔄 Assigned new user: /Users/${newUserId} to ${collectionName}/${doc.id}`);
      changes++;
      continue;
    }

    // If currentUserId is a string and formatted incorrectly, fix it
    if (typeof currentUserId === "string") {
      if (currentUserId.startsWith("/Users/")) {
        const extractedUserId = currentUserId.replace("/Users/", "");

        if (!validUserIds.includes(extractedUserId)) {
          console.log(`❌ Invalid user_id in ${collectionName}/${doc.id}: ${currentUserId}`);

          // Pick a new valid user
          const newUserId = validUserIds[Math.floor(Math.random() * validUserIds.length)];
          const formattedUserRef = db.doc(`/Users/${newUserId}`);

          batch.update(doc.ref, {
            [userIdField]: formattedUserRef
          });

          console.log(`🔄 Replaced with: /Users/${newUserId}`);
          changes++;
        } else {
          // Convert string to Firestore Reference
          const formattedUserRef = db.doc(`/Users/${extractedUserId}`);
          batch.update(doc.ref, {
            [userIdField]: formattedUserRef
          });

          console.log(`🔄 Corrected format in ${collectionName}/${doc.id} → '${userIdField}': /Users/${extractedUserId}`);
          changes++;
        }
      } else if (validUserIds.includes(currentUserId)) {
        // Convert plain user_id string to Firestore Reference
        const formattedUserRef = db.doc(`/Users/${currentUserId}`);
        batch.update(doc.ref, {
          [userIdField]: formattedUserRef
        });

        console.log(`🔄 Converted plain user ID to reference in ${collectionName}/${doc.id}: /Users/${currentUserId}`);
        changes++;
      } else {
        console.log(`❌ Completely invalid user_id in ${collectionName}/${doc.id}: ${currentUserId}`);

        // Assign a random valid user
        const newUserId = validUserIds[Math.floor(Math.random() * validUserIds.length)];
        const formattedUserRef = db.doc(`/Users/${newUserId}`);

        batch.update(doc.ref, {
          [userIdField]: formattedUserRef
        });

        console.log(`🔄 Replaced invalid user_id with: /Users/${newUserId}`);
        changes++;
      }
    }
  }

  if (changes > 0) {
    await batch.commit();
    console.log(`✅ Fixed ${changes} '${userIdField}' references in '${collectionName}'.`);
  } else {
    console.log(`✅ No incorrectly formatted '${userIdField}' references found in '${collectionName}'.`);
  }
}

// Function to validate and correct all user_id references in the database
async function fixAllUserReferences() {
  console.log("🚀 Starting validation of all user_id references...");

  const validUserIds = await getAllUserIds();

  // Collections and their respective user_id fields
  const collectionsToCheck = [
    { name: 'Posts', userIdField: 'user_id' },
    { name: 'Comments', userIdField: 'user_id' },
    { name: 'Recipes', userIdField: 'author' },
    { name: 'Ratings', userIdField: 'user_id' },
    { name: 'Fridges', userIdField: 'user_id' }
  ];

  for (const collection of collectionsToCheck) {
    await fixCollectionUserReferences(collection.name, collection.userIdField, validUserIds);
  }

  console.log("🎉 All incorrectly formatted user_id references have been fixed!");
}

// Run the script
fixAllUserReferences();

