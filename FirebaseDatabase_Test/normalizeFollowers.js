// normalizeFollowersAndFollowing.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // adjust path if needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/**
 * Safely convert a user ID or reference into a DocumentReference<User>, or return null.
 */
function toUserRef(entry) {
  if (typeof entry === 'string' && entry.trim()) {
    return db.collection('Users').doc(entry.trim());
  }
  if (entry instanceof admin.firestore.DocumentReference) {
    return entry;
  }
  return null;
}

async function normalizeFollowersAndFollowing() {
  const usersSnap = await db.collection('Users').get();
  console.log(`Found ${usersSnap.size} user documents.`);

  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data();
    const updates = {};

    // Normalize followers array
    if (Array.isArray(data.followers)) {
      const newFollowers = data.followers
        .map(toUserRef)
        .filter(ref => ref !== null);
      // Only update if changed
      if (
        newFollowers.length !== data.followers.length ||
        newFollowers.some((ref, i) => !(data.followers[i] instanceof admin.firestore.DocumentReference && ref.isEqual(data.followers[i])))
      ) {
        updates.followers = newFollowers;
      }
    }

    // Normalize following array
    if (Array.isArray(data.following)) {
      const newFollowing = data.following
        .map(toUserRef)
        .filter(ref => ref !== null);
      if (
        newFollowing.length !== data.following.length ||
        newFollowing.some((ref, i) => !(data.following[i] instanceof admin.firestore.DocumentReference && ref.isEqual(data.following[i])))
      ) {
        updates.following = newFollowing;
      }
    }

    if (Object.keys(updates).length > 0) {
      await userDoc.ref.update(updates);
      console.log(`Updated ${userDoc.id}: normalized ${Object.keys(updates).join(' & ')}`);
    }
  }

  console.log('✅ All user documents have been normalized for followers and following.');
}

normalizeFollowersAndFollowing()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
