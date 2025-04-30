// normalizeRecipeFlags.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // adjust path as needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addRecipeFlags() {
  const recipesSnap = await db.collection('Recipes').get();
  console.log(`Found ${recipesSnap.size} recipe documents.`);

  for (const doc of recipesSnap.docs) {
    const data = doc.data();
    const updates = {};

    if (data.isSeasonal === undefined) {
      updates.isSeasonal = false;
    }
    if (data.isRecommended === undefined) {
      updates.isRecommended = false;
    }
    if (data.isApproved === undefined) {
      updates.isApproved = false;
    }

    if (Object.keys(updates).length > 0) {
      await doc.ref.update(updates);
      console.log(`Updated ${doc.id}: set ${Object.keys(updates).join(', ')}`);
    }
  }

  console.log('✅ All recipes have been normalized with the new flags.');
}

addRecipeFlags()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
