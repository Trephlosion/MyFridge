// normalizeLikesAndWorkshops.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // adjust path as needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function normalizeLikesAndUserFields() {
  // STEP 1: Initialize likedRecipes array and rename posts → workshops for all users
  const usersSnap = await db.collection('Users').get();
  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data();
    const updates = {};

    // Add likedRecipes if missing
    if (!Array.isArray(data.likedRecipes)) {
      updates.likedRecipes = [];
    }

    // Rename posts → workshops
    if (Array.isArray(data.posts)) {
      updates.workshops = data.posts;
      updates.posts = admin.firestore.FieldValue.delete();
    }

    if (Object.keys(updates).length) {
      await userDoc.ref.update(updates);
      console.log(`User ${userDoc.id}: initialized likedRecipes and renamed posts→workshops`);
    }
  }

  // STEP 2: Fix recipe likes arrays and populate each user's likedRecipes
  const recipesSnap = await db.collection('Recipes').get();
  for (const recipeDoc of recipesSnap.docs) {
    const data = recipeDoc.data();
    const rawLikes = Array.isArray(data.likes) ? data.likes : [];
    const newLikes = [];

    // Convert any string user IDs into DocumentReferences
    for (const likeEntry of rawLikes) {
      if (typeof likeEntry === 'string') {
        newLikes.push(db.collection('Users').doc(likeEntry));
      } else if (
        likeEntry instanceof admin.firestore.DocumentReference
      ) {
        newLikes.push(likeEntry);
      }
      // otherwise ignore invalid entries
    }

    // Update the recipe document if the likes array has changed
    const likesChanged =
      newLikes.length !== rawLikes.length ||
      rawLikes.some((v, i) => !(newLikes[i] instanceof admin.firestore.DocumentReference));

    if (likesChanged) {
      await recipeDoc.ref.update({ likes: newLikes });
      console.log(`Recipe ${recipeDoc.id}: normalized likes array`);
    }

    // STEP 3: For each userRef in likes, add this recipe into their likedRecipes
    for (const userRef of newLikes) {
      try {
        await userRef.update({
          likedRecipes: admin.firestore.FieldValue.arrayUnion(recipeDoc.ref),
        });
        console.log(
          `User ${userRef.id}: added recipe ${recipeDoc.id} to likedRecipes`
        );
      } catch (err) {
        console.error(
          `Failed to update likedRecipes for user ${userRef.id}:`,
          err
        );
      }
    }
  }

  console.log('Normalization of likes and user fields completed.');
}

normalizeLikesAndUserFields()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
  });
