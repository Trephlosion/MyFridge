var admin = require("firebase-admin");
var serviceAccount = require('./serviceAccountKey.json');
const readline = require('readline');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

function promptEmail() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question("Enter the email to search for: ", async (email) => {
    await adminSearchUser(email);
    rl.close();
  });
}

// Modified function that accepts an email parameter.
async function adminSearchUser(email) {
  console.log("=== Admin Searching for User ===");
  const querySnapshot = await db.collection('Users')
    .where('email', '==', email)
    .get();

  if (querySnapshot.empty) {
    console.log("No user found with that email.");
    return;
  }
  
  querySnapshot.forEach(doc => {
    console.log("Found user:", doc.id, "=>", doc.data());
  });
}

async function runSampleQueries() {
  try {
    promptEmail();
  } catch (error) {
    console.error("Error running sample queries:", error);
  }
}

runSampleQueries();
