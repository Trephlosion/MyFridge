var admin = require("firebase-admin");
var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/ 3. A different user (or a user in a different role) lists/browses posts.
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

// Main function to run all sample queries.
async function runSampleQueries() {
    try {
      await differentUserListsPosts();
      console.log("\nAll sample queries executed.");
    } catch (error) {
      console.error("Error running sample queries:", error);
    }
  }
  
  runSampleQueries();
  