// normalizeRecipeTimesAndServings.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // adjust path as needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function normalizeTimesAndServings() {
  const recipesSnap = await db.collection('Recipes').get();
  console.log(`Found ${recipesSnap.size} recipes to check.`);

  for (const doc of recipesSnap.docs) {
    const data = doc.data();
    const updates = {};

    // prepTime → number
    if (data.prepTime !== undefined && typeof data.prepTime === 'string') {
      const parsed = parseFloat(data.prepTime);
      if (!isNaN(parsed)) {
        updates.prepTime = parsed;
      } else {
        console.warn(`Recipe ${doc.id}: could not parse prepTime "${data.prepTime}"`);
      }
    }

    // cookTime → number
    if (data.cookTime !== undefined && typeof data.cookTime === 'string') {
      const parsed = parseFloat(data.cookTime);
      if (!isNaN(parsed)) {
        updates.cookTime = parsed;
      } else {
        console.warn(`Recipe ${doc.id}: could not parse cookTime "${data.cookTime}"`);
      }
    }

    // servings → number
    if (data.servings !== undefined && typeof data.servings === 'string') {
      const parsed = parseInt(data.servings, 10);
      if (!isNaN(parsed)) {
        updates.servings = parsed;
      } else {
        console.warn(`Recipe ${doc.id}: could not parse servings "${data.servings}"`);
      }
    }

    if (Object.keys(updates).length > 0) {
      await doc.ref.update(updates);
      console.log(`Updated ${doc.id}: set ${Object.keys(updates).join(', ')}`);
    }
  }

  console.log('✅ All recipes have been normalized for prepTime, cookTime, and servings.');
}

normalizeTimesAndServings()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
