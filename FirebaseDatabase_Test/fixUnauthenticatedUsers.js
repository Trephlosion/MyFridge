const admin = require('firebase-admin');
const bcrypt = require("bcrypt"); // To hash passwords if missing
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Default values for missing fields
const DEFAULT_AUTH_PROVIDER = "email"; // Change to "google" if needed
const DEFAULT_PASSWORD = "SecurePass123!";
const DEFAULT_PROFILE_PICTURE = "/assets/images/default-pfp.png"; // Default pfp
const DEFAULT_BIO = "Hello! I'm using MyKitchen.";
const DEFAULT_USERNAME_PREFIX = "user";
const DEFAULT_IS_ADMIN = false;
const DEFAULT_IS_PRIVATE = false;
const DEFAULT_IS_VERIFIED = false;

async function fixUnauthenticatedUsers() {
  console.log("🔍 Scanning Users collection for unauthenticated or incorrectly formatted users...");

  const usersRef = db.collection("Users");
  const snapshot = await usersRef.get();
  const batch = db.batch();
  let changes = 0;

  for (const doc of snapshot.docs) {
    const user = doc.data();
    let needsUpdate = false;
    
    // Default structure for an authenticated user
    let updatedUser = { ...user };

    // ✅ Ensure email is valid
    if (!user.email || typeof user.email !== "string" || !user.email.includes("@")) {
      updatedUser.email = `${DEFAULT_USERNAME_PREFIX}${doc.id}@example.com`;
      needsUpdate = true;
    }

    // ✅ Ensure necessary arrays exist
    updatedUser.comments = Array.isArray(user.comments) ? user.comments : [];
    updatedUser.following = Array.isArray(user.following) ? user.following : [];
    updatedUser.followers = Array.isArray(user.followers) ? user.followers : [];
    updatedUser.posts = Array.isArray(user.posts) ? user.posts : [];
    updatedUser.recipes = Array.isArray(user.recipes) ? user.recipes : [];
    needsUpdate = true;

    // ✅ Ensure timestamps exist and are Firestore Timestamps
    if (!user.createdAt || !(user.createdAt instanceof admin.firestore.Timestamp)) {
      updatedUser.createdAt = admin.firestore.Timestamp.now();
      needsUpdate = true;
    }
    if (!user.updatedAt || !(user.updatedAt instanceof admin.firestore.Timestamp)) {
      updatedUser.updatedAt = admin.firestore.Timestamp.now();
      needsUpdate = true;
    }

    // ✅ Ensure boolean fields exist
    updatedUser.isAdministrator = typeof user.isAdministrator === "boolean" ? user.isAdministrator : DEFAULT_IS_ADMIN;
    updatedUser.isPrivate = typeof user.isPrivate === "boolean" ? user.isPrivate : DEFAULT_IS_PRIVATE;
    updatedUser.isVerified = typeof user.isVerified === "boolean" ? user.isVerified : DEFAULT_IS_VERIFIED;
    needsUpdate = true;

    // ✅ Ensure bio exists
    updatedUser.bio = typeof user.bio === "string" ? user.bio : DEFAULT_BIO;

    // ✅ Ensure profile picture (pfp) exists
    updatedUser.pfp = typeof user.pfp === "string" ? user.pfp : DEFAULT_PROFILE_PICTURE;

    // ✅ Ensure username exists
    updatedUser.username = typeof user.username === "string" ? user.username : `${DEFAULT_USERNAME_PREFIX}${doc.id}`;

    // ✅ Ensure myFridge is a Firestore reference
    if (!user.myFridge || typeof user.myFridge !== "object") {
      updatedUser.myFridge = db.doc(`/Fridges/${doc.id}`);
      needsUpdate = true;
    }

    // ✅ Ensure authentication fields exist
    if (!user.authProvider) {
      updatedUser.authProvider = DEFAULT_AUTH_PROVIDER;
      needsUpdate = true;
    }

    if (DEFAULT_AUTH_PROVIDER === "email" && !user.passwordHash) {
      const salt = await bcrypt.genSalt(10);
      updatedUser.passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, salt);
      needsUpdate = true;
    }

    // ✅ Mark as authenticated
    updatedUser.authenticated = true;

    // Update Firestore if changes were made
    if (needsUpdate) {
      batch.update(doc.ref, updatedUser);
      console.log(`✅ Updated user ${doc.id} with missing fields.`);
      changes++;
    }
  }

  if (changes > 0) {
    await batch.commit();
    console.log(`🎉 Successfully authenticated and formatted ${changes} users.`);
  } else {
    console.log("✅ All users are already correctly formatted. No changes needed.");
  }
}

// Run the script
fixUnauthenticatedUsers();
