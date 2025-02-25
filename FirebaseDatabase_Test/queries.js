var admin = require("firebase-admin");
var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 1. Admin searches for a User by email.
async function adminSearchUser() {
  console.log("=== Admin Searching for User ===");
  const querySnapshot = await db.collection('Users')
    .where('email', '==', 'testuser@example.com')
    .get();

  if (querySnapshot.empty) {
    console.log("No user found with that email.");
    return;
  }
  querySnapshot.forEach(doc => {
    console.log("Found user:", doc.id, "=>", doc.data());
  });
}

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

// 3. A different user (or a user in a different role) lists/browses posts.
async function differentUserListsPosts() {
  console.log("\n=== Different User Listing All Posts ===");
  // Optionally, check for a different user.
  const userQuery = await db.collection('Users')
    .where('email', '==', 'differentUser@example.com')
    .limit(1)
    .get();

  if (userQuery.empty) {
    console.log("Different user not found; listing posts regardless.");
  } else {
    const diffUser = userQuery.docs[0];
    console.log("Different user found:", diffUser.id);
  }
  // List all posts.
  const postsSnapshot = await db.collection('Posts').get();
  postsSnapshot.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
}

// 4a. Ad hoc query 1: List all recipes with ratings greater than 4.0.
async function adHocQuery1() {
  console.log("\n=== Ad Hoc Query 1: Recipes with Rating > 4.0 ===");
  const recipesSnapshot = await db.collection('Recipes')
    .where('ratings', '>', 4.0)
    .get();

  if (recipesSnapshot.empty) {
    console.log("No recipes found with rating > 4.0");
    return;
  }
  recipesSnapshot.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
}

// 4b. Ad hoc query 2: List all fridges updated in the last 24 hours.
async function adHocQuery2() {
  console.log("\n=== Ad Hoc Query 2: Fridges Updated in the Last 24 Hours ===");
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  // Firestore timestamps are comparable with Date objects.
  const fridgesSnapshot = await db.collection('Fridges')
    .where('updated_at', '>=', yesterday)
    .get();

  if (fridgesSnapshot.empty) {
    console.log("No fridges updated in the last 24 hours.");
    return;
  }
  fridgesSnapshot.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
}

// Main function to run all sample queries.
async function runSampleQueries() {
  try {
    await adminSearchUser();
    await userAddsPost();
    await differentUserListsPosts();
    await adHocQuery1();
    await adHocQuery2();
    console.log("\nAll sample queries executed.");
  } catch (error) {
    console.error("Error running sample queries:", error);
  }
}

runSampleQueries();
