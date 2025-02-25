var admin = require("firebase-admin");
var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 2. A user adds something (a new post in this example).
async function userAddsPost() {
  console.log("\n=== User Adding a New Post ===");
  // Find the user who is adding the post.
  const userQuery = await db.collection('Users')
    .where('email', '==', 'testuser@example.com')
    .limit(1)
    .get();

  if (userQuery.empty) {
    console.log("User not found, cannot add post.");
    return;
  }
  const userDoc = userQuery.docs[0];
  const newPostData = {
    user_id: userDoc.ref, // Reference to the user document.
    title: "User's New Post",
    description: "This is a new post added by the user.",
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    comments: [] // No comments yet.
  };

  const postRef = await db.collection('Posts').add(newPostData);
  console.log("New post created with ID:", postRef.id);
}

// Main function to run all sample queries.
async function runSampleQueries() {
    try {
      await userAddsPost();
      console.log("\nAll sample queries executed.");
    } catch (error) {
      console.error("Error running sample queries:", error);
    }
  }
  
  runSampleQueries();
  