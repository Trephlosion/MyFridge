var admin = require("firebase-admin");
var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedFirestore() {
  try {
    // ---------------------------------
    // Create 5 sample Users
    // ---------------------------------
    let userRefs = [];
    for (let i = 0; i < 5; i++) {
      const userData = {
        email: `user${i}@example.com`,
        username: `User${i}`,
        bio: `This is user ${i}'s bio.`,
        pfp: `https://example.com/user${i}.jpg`,
        followers: [],
        following: [],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        posts: [],
        recipes: []
      };
      let userRef = await db.collection('Users').add(userData);
      console.log(`User ${i} created with ID: ${userRef.id}`);
      userRefs.push(userRef);
    }

    // ---------------------------------
    // Create 5 sample Ingredients
    // ---------------------------------
    const ingredientNames = ["Milk", "Bacon", "Lettuce", "Apple", "Jalapeno"];

    let ingredientRefs = [];
    for (let i = 0; i < 5; i++) {
      const ingredientData = {
        name: ingredientNames[i]
      };
      let ingRef = await db.collection('Ingredients').add(ingredientData);
      console.log(`Ingredient created with ID: ${ingRef.id} (${ingredientNames[i]})`);
      ingredientRefs.push(ingRef);
    }

    // ---------------------------------
    // Create 5 sample Recipes
    // ---------------------------------
    let recipeRefs = [];
    for (let i = 0; i < 5; i++) {
      // Select a random user as the author.
      const randomUserRef = userRefs[Math.floor(Math.random() * userRefs.length)];
      // Pick 2 distinct random ingredients.
      let indices = [];
      while (indices.length < 2) {
        let idx = Math.floor(Math.random() * ingredientRefs.length);
        if (!indices.includes(idx)) indices.push(idx);
      }
      let randomIngredients = indices.map(idx => {
        return { ingredient: ingredientRefs[idx], quantity: `${Math.floor(Math.random() * 3) + 1} unit(s)` };
      });
      const recipeData = {
        author: randomUserRef, // reference to a user document
        title: `Sample Recipe ${i}`,
        media_url: `https://example.com/recipe${i}.jpg`,
        ratings: parseFloat((Math.random() * 5).toFixed(1)),
        isRecommended: Math.random() < 0.5,
        ingredients: randomIngredients,
        instructions: [`Step 1 for recipe ${i}`, `Step 2 for recipe ${i}`],
        tags: [`tag${i}`, "sample"],
        comments: [],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };
      let recipeRef = await db.collection('Recipes').add(recipeData);
      console.log(`Recipe ${i} created with ID: ${recipeRef.id}`);
      recipeRefs.push(recipeRef);
    }

    // ---------------------------------
    // Create 5 sample Fridges
    // ---------------------------------
    let fridgeRefs = [];
    for (let i = 0; i < 5; i++) {
      const randomUserRef = userRefs[Math.floor(Math.random() * userRefs.length)];
      // Pick 2 distinct random ingredients for the fridge.
      let indices = [];
      while (indices.length < 2) {
        let idx = Math.floor(Math.random() * ingredientRefs.length);
        if (!indices.includes(idx)) indices.push(idx);
      }
      let fridgeIngredients = indices.map(idx => {
        return { ingredient: ingredientRefs[idx] };
      });
      const fridgeData = {
        user_id: randomUserRef, // reference to a user document
        ingredients: fridgeIngredients,
        shopping_list: ["milk", "eggs", "butter"],
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };
      let fridgeRef = await db.collection('Fridges').add(fridgeData);
      console.log(`Fridge ${i} created with ID: ${fridgeRef.id}`);
      fridgeRefs.push(fridgeRef);
    }

    // ---------------------------------
    // Create 5 sample Posts
    // ---------------------------------
    let postRefs = [];
    for (let i = 0; i < 5; i++) {
      const randomUserRef = userRefs[Math.floor(Math.random() * userRefs.length)];
      const postData = {
        user_id: randomUserRef, // reference to a user document
        title: `Sample Post ${i}`,
        description: `This is sample post number ${i}.`,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        comments: [] // will be updated later with comment references
      };
      let postRef = await db.collection('Posts').add(postData);
      console.log(`Post ${i} created with ID: ${postRef.id}`);
      postRefs.push(postRef);
    }

    // ---------------------------------
    // Create Comments
    // ---------------------------------
    // Create 3 comments on posts (set recipe_id: null)
    for (let i = 0; i < 3; i++) {
      const randomPostRef = postRefs[Math.floor(Math.random() * postRefs.length)];
      const randomUserRef = userRefs[Math.floor(Math.random() * userRefs.length)];
      const commentData = {
        recipe_id: null,  // Comment on a post
        post_id: randomPostRef, // reference to a post document
        user_id: randomUserRef, // reference to a user document
        content: `This is a comment on post number ${i}.`,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      };
      let commentRef = await db.collection('Comments').add(commentData);
      console.log(`Post Comment ${i} created with ID: ${commentRef.id}`);
      // Update the post document to include this comment
      await db.collection('Posts').doc(randomPostRef.id).update({
        comments: admin.firestore.FieldValue.arrayUnion(commentRef)
      });
    }

    // Create 3 comments on recipes (set post_id: null)
    for (let i = 0; i < 3; i++) {
      const randomRecipeRef = recipeRefs[Math.floor(Math.random() * recipeRefs.length)];
      const randomUserRef = userRefs[Math.floor(Math.random() * userRefs.length)];
      const commentData = {
        recipe_id: randomRecipeRef, // reference to a recipe document
        post_id: null,  // Comment on a recipe
        user_id: randomUserRef, // reference to a user document
        content: `This is a comment on recipe number ${i}.`,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      };
      let commentRef = await db.collection('Comments').add(commentData);
      console.log(`Recipe Comment ${i} created with ID: ${commentRef.id}`);
      // Update the recipe document to include this comment
      await db.collection('Recipes').doc(randomRecipeRef.id).update({
        comments: admin.firestore.FieldValue.arrayUnion(commentRef)
      });
    }

    // ---------------------------------
    // Create 5 sample Ratings
    // ---------------------------------
    for (let i = 0; i < 5; i++) {
      const randomRecipeRef = recipeRefs[Math.floor(Math.random() * recipeRefs.length)];
      const randomUserRef = userRefs[Math.floor(Math.random() * userRefs.length)];
      const ratingData = {
        recipe_id: randomRecipeRef, // reference to a recipe document
        raters: [
          {
            user_id: randomUserRef, // reference to a user document
            rating: Math.floor(Math.random() * 5) + 1
          }
        ],
        avg_rating: parseFloat((Math.random() * 5).toFixed(1)),
        created_at: admin.firestore.FieldValue.serverTimestamp()
      };
      let ratingRef = await db.collection('Ratings').add(ratingData);
      console.log(`Rating ${i} created with ID: ${ratingRef.id}`);
    }

    console.log("Firestore seeding complete with additional sample documents.");

  } catch (error) {
    console.error("Error seeding additional sample data:", error);
  }
}

seedFirestore();
