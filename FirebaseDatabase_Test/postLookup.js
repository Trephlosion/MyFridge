var admin = require("firebase-admin");
var serviceAccount = require('./serviceAccountKey.json');
const readline = require('readline');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper function to ask a question and return a promise.
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, answer => {
    rl.close();
    resolve(answer);
  }));
}

// Function to prompt for post data.
async function promptPostData() {
  const userEmail = await askQuestion("Enter your email: ");
  const postTitle = await askQuestion("Enter the post title: ");
  const postDescription = await askQuestion("Enter the post description: ");
  return { userEmail, postTitle, postDescription };
}

// 2. A user adds something (a new post in this example).
async function userAddsPost() {
  console.log("\n=== User Adding a New Post ===");
  
  // Prompt for post data.
  const { userEmail, postTitle, postDescription } = await promptPostData();
  
  // Find the user who is adding the post.
  const userQuery = await db.collection('Users')
    .where('email', '==', userEmail)
    .limit(1)
    .get();

  if (userQuery.empty) {
    console.log("User not found, cannot add post.");
    return;
  }
  const userDoc = userQuery.docs[0];
  
  // Create the new post data.
  const newPostData = {
    user_id: userDoc.ref, // Reference to the user document.
    title: postTitle,
    description: postDescription,
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