// normalizeFridges.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Adjust the path to your service account key

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function normalizeFridges() {
  // STEP 1: Gather valid fridge document IDs from the Users collection.
  // These valid references come from the "myFridge" field on each user.
  const validFridgeIds = new Set();
  const usersSnapshot = await db.collection('Users').get();
  usersSnapshot.forEach(userDoc => {
    const userData = userDoc.data();
    let myFridge = userData.myFridge;
    if (myFridge) {
      // If myFridge is stored as a string, convert it into a DocumentReference.
      if (typeof myFridge === 'string') {
        myFridge = db.collection('Fridges').doc(myFridge);
      }
      validFridgeIds.add(myFridge.id);
    }
  });

  // STEP 2: Process all documents in the Fridges collection.
  // We will group documents by the normalized user (from userid or user_id).
  const fridgesSnapshot = await db.collection('Fridges').get();
  const fridgeGroups = {}; // key: user ID, value: array of { docRef, isValid, normalizedData }

  for (const doc of fridgesSnapshot.docs) {
    const data = doc.data();

    // STEP 2a: Delete the document if its ingredients field is an array that contains any map (object) values.
    if (
      Array.isArray(data.ingredients) &&
      data.ingredients.some(item => typeof item === 'object' && !Array.isArray(item))
    ) {
      console.log(`Deleting fridge ${doc.id} because ingredients contains map objects.`);
      await doc.ref.delete();
      continue;
    }

    // STEP 2b: Normalize user identifier fields.
    // Try to use "userid" first; if not present, check "user_id".
    let userRef = null;
    if (data.userid) {
      userRef = (typeof data.userid === 'string')
        ? db.collection('Users').doc(data.userid)
        : data.userid;
    }
    if (!userRef && data.user_id) {
      userRef = (typeof data.user_id === 'string')
        ? db.collection('Users').doc(data.user_id)
        : data.user_id;
    }
    // If no valid user reference is found, delete the document.
    if (!userRef) {
      console.log(`Deleting fridge ${doc.id} due to missing user reference.`);
      await doc.ref.delete();
      continue;
    }

    // STEP 2c: Build the normalized document using only the allowed fields.
    const normalizedData = {
      // Ensure ingredients is an array of strings; if missing, default to an empty array.
      ingredients: Array.isArray(data.ingredients)
        ? data.ingredients.filter(item => typeof item === 'string')
        : [],
      // Ensure shoppingList is an array of strings; default to an empty array if missing.
      shoppingList: Array.isArray(data.shoppingList)
        ? data.shoppingList.filter(item => typeof item === 'string')
        : [],
      // Use the existing updatedAt value if present; otherwise, use a server timestamp.
      updatedAt: data.updatedAt ? data.updatedAt : admin.firestore.FieldValue.serverTimestamp(),
      // Save the normalized user reference (as userid).
      userid: userRef,
    };

    const userIdKey = userRef.id;
    // Determine if this fridge document is valid (referenced by the user's myFridge field).
    const isValid = validFridgeIds.has(doc.id);

    if (!fridgeGroups[userIdKey]) {
      fridgeGroups[userIdKey] = [];
    }
    fridgeGroups[userIdKey].push({
      docRef: doc.ref,
      isValid,
      normalizedData,
    });
  }

  // STEP 3: Remove duplicates grouped by user.
  // For each group, if more than one document exists, keep the one that is marked as valid (i.e. referenced by myFridge).
  // If none are marked as valid, keep the first document and delete the rest.
  for (const userId in fridgeGroups) {
    const group = fridgeGroups[userId];
    let docToKeep = group.find(item => item.isValid) || group[0];
    for (const item of group) {
      if (item.docRef.id !== docToKeep.docRef.id) {
        console.log(`Deleting duplicate fridge ${item.docRef.id} for user ${userId}`);
        await item.docRef.delete();
      }
    }
    // STEP 4: Update the kept document with the normalized data.
    console.log(`Updating fridge ${docToKeep.docRef.id} for user ${userId}`);
    await docToKeep.docRef.set(docToKeep.normalizedData, { merge: false });
  }

  console.log("Fridges normalization completed.");
}

normalizeFridges()
  .then(() => {
    console.log("Migration completed successfully.");
    process.exit(0);
  })
  .catch(err => {
    console.error("An error occurred during migration:", err);
    process.exit(1);
  });
