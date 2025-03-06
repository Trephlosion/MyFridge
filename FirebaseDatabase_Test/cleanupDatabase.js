const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper function to remove duplicates from an array of document IDs
function removeDuplicates(array) {
  return [...new Set(array)];
}

// Helper function to ensure references are valid (if not, update them)
async function validateReference(collectionName, docId) {
  const docRef = db.collection(collectionName).doc(docId);
  const doc = await docRef.get();
  if (doc.exists) {
    return docRef; // Return reference if document exists
  } else {
    // Handle the case when reference doesn't exist (e.g., setting to a valid default document)
    console.log(`Invalid reference: ${docId} in ${collectionName}, updating reference.`);
    return null; // In this case, return null for invalid reference, or handle accordingly
  }
}

// Function to update the 'comments' collection ensuring valid references
async function fixComments() {
  const commentsRef = db.collection('comments');
  const snapshot = await commentsRef.get();

  snapshot.forEach(async (doc) => {
    const comment = doc.data();

    // Validate references for recipe_id and post_id
    if (comment.recipe_id) {
      const recipeRef = await validateReference('recipes', comment.recipe_id);
      if (recipeRef) {
        await commentsRef.doc(doc.id).update({
          recipe_id: recipeRef
        });
      } else {
        await commentsRef.doc(doc.id).update({
          recipe_id: null
        });
      }
    }

    if (comment.post_id) {
      const postRef = await validateReference('posts', comment.post_id);
      if (postRef) {
        await commentsRef.doc(doc.id).update({
          post_id: postRef
        });
      } else {
        await commentsRef.doc(doc.id).update({
          post_id: null
        });
      }
    }
  });
}

// Function to update the user, recipe, and post collections to remove duplicates
async function removeDuplicateReferences() {
  const usersRef = db.collection('users');
  const recipesRef = db.collection('recipes');
  const postsRef = db.collection('posts');

  const usersSnapshot = await usersRef.get();
  usersSnapshot.forEach(async (userDoc) => {
    const user = userDoc.data();

    // Remove duplicates from posts and recipes arrays
    const uniquePosts = removeDuplicates(user.posts);
    const uniqueRecipes = removeDuplicates(user.recipes);

    await usersRef.doc(userDoc.id).update({
      posts: uniquePosts,
      recipes: uniqueRecipes
    });
  });

  const recipesSnapshot = await recipesRef.get();
  recipesSnapshot.forEach(async (recipeDoc) => {
    const recipe = recipeDoc.data();

    // Remove duplicates from comments array
    const uniqueComments = removeDuplicates(recipe.comments);

    await recipesRef.doc(recipeDoc.id).update({
      comments: uniqueComments
    });
  });

  const postsSnapshot = await postsRef.get();
  postsSnapshot.forEach(async (postDoc) => {
    const post = postDoc.data();

    // Remove duplicates from comments array
    const uniqueComments = removeDuplicates(post.comments);

    await postsRef.doc(postDoc.id).update({
      comments: uniqueComments
    });
  });
}

// Function to ensure all references are valid across collections
async function fixReferences() {
  const allCollections = ['posts', 'recipes', 'comments', 'users', 'fridges'];
  for (let collection of allCollections) {
    const collectionRef = db.collection(collection);
    const snapshot = await collectionRef.get();

    snapshot.forEach(async (doc) => {
      const data = doc.data();
      for (let key in data) {
        if (Array.isArray(data[key])) {
          for (let index = 0; index < data[key].length; index++) {
            if (typeof data[key][index] === 'string') {
              // Check if it's a reference and validate
              const validReference = await validateReference(collection, data[key][index]);
              if (validReference) {
                data[key][index] = validReference;
              } else {
                data[key][index] = null; // Update to a valid reference (null or default document)
              }
            }
          }
          // Update the document with validated references
          await collectionRef.doc(doc.id).update({ [key]: data[key] });
        }
      }
    });
  }
}

// Main function to clean up the data
async function cleanupDatabase() {
  try {
    // Start fixing comments, removing duplicates, and ensuring references
    console.log('Starting to fix comments...');
    await fixComments();
    console.log('Comments fixed.');

    console.log('Removing duplicate references...');
    await removeDuplicateReferences();
    console.log('Duplicate references removed.');

    console.log('Fixing references across all collections...');
    await fixReferences();
    console.log('References fixed.');

    console.log('Database cleanup completed successfully!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupDatabase();
