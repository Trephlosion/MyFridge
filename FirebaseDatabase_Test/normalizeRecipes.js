const admin = require('firebase-admin'); const serviceAccount = require('./serviceAccountKey.json'); // adjust the path if needed

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();

async function normalizeRecipes() { const recipesSnapshot = await db.collection('Recipes').get();

for (const doc of recipesSnapshot.docs) { const recipeRef = doc.ref; let data = doc.data();


    // STEP 1. Delete the document if its ingredients array contains any map objects.
// We assume ingredients should be an array of strings.
if (Array.isArray(data.ingredients) && data.ingredients.some(item => typeof item === 'object' && !Array.isArray(item))) {
    console.log(`Deleting ${doc.id} – ingredients array contains maps.`);
    await recipeRef.delete();
    continue;
  }
  
  // STEP 2. Ensure an ingredients array exists.
  if (!Array.isArray(data.ingredients)) {
    data.ingredients = [];
  }
  
  // STEP 3. Convert author and userId fields from strings (if present) to document references.
  let authorRef = null;
  if (data.author) {
    if (typeof data.author === 'string') {
      authorRef = db.collection('Users').doc(data.author);
    } else {
      // already a reference? (Assuming it is valid)
      authorRef = data.author;
    }
  }
  
  // If there is a userId field, use that if author is missing
  if (!authorRef && data.userId) {
    if (typeof data.userId === 'string') {
      authorRef = db.collection('Users').doc(data.userId);
    } else {
      authorRef = data.userId;
    }
  }
  
  // STEP 4. Refactor: move any userId field to author (if necessary) and remove userId.
  data.author = authorRef;
  delete data.userId;
  
  // STEP 5. Validate that the author reference exists in the Users collection.
  if (!data.author) {
    console.log(`Deleting ${doc.id} – no author info.`);
    await recipeRef.delete();
    continue;
  }
  try {
    const userSnapshot = await data.author.get();
    if (!userSnapshot.exists) {
      console.log(`Deleting ${doc.id} – author reference is invalid.`);
      await recipeRef.delete();
      continue;
    }
  } catch (err) {
    console.error(`Error verifying author for ${doc.id}: ${err}`);
    await recipeRef.delete();
    continue;
  }
  
  // STEP 6. Build the normalized document using the final layout.
  // Note: Some fields are optional. For dates, we keep the original (or use server timestamps if missing).
  const normalizedRecipe = {
    title: data.title,
    description: data.description || null,
    cookTime: data.cookTime || null,
    prepTime: data.prepTime || null,
    servings: data.servings || null,
    createdAt: data.createdAt ? data.createdAt : admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: data.updatedAt || null,
    mediaUrl: data.mediaUrl,
    author: data.author, // a valid DocumentReference in Users
    // The final layout shows an optional userId but per instructions, we keep only the author field.
    username: data.username || null,
    pfp: data.pfp || null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    instructions: Array.isArray(data.instructions) ? data.instructions : [],
    ingredients: data.ingredients, // confirmed array of strings now
    likes: Array.isArray(data.likes) ? data.likes : [],
    comments: Array.isArray(data.comments) ? data.comments : []
  };
  
  // STEP 7. Update the document with the normalized fields.
  try {
    await recipeRef.set(normalizedRecipe);
    console.log(`Normalized recipe document ${doc.id}`);
  } catch (err) {
    console.error(`Failed to update document ${doc.id}: ${err}`);
  }
} }

normalizeRecipes() .then(() => { console.log('Normalization completed.'); process.exit(0); }) .catch(err => { console.error('Normalization encountered an error:', err); process.exit(1); });  