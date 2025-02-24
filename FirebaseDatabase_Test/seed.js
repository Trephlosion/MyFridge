var admin = require("firebase-admin");

var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// if (process.env.FIRESTORE_EMULATOR_HOST) {
//     admin.firestore().settings({
//       host: process.env.FIRESTORE_EMULATOR_HOST,
//       ssl: false
//     });
//   }

  // Assume firebase (or the Firebase Admin SDK) has already been initialized
const db = admin.firestore();

// USERS collection
db.collection('users').doc('user_001').set({
  user_id: 'user_001',
  email: 'testuser@example.com',
  username: 'testuser',
  bio: 'Hello, I am a test user.',
  password: 'hashed_password_here',
  pfp: 'https://example.com/profile.jpg',
  // For references, we use document references (here we reference the same user for illustration)
  followers: [ db.collection('users').doc('user_001') ],
  following: [ db.collection('users').doc('user_001') ],
  created_at: admin.firestore.Timestamp.now(),
  posts: [ db.collection('posts').doc('post_001') ],
  recipes: [ db.collection('recipes').doc('recipe_001') ]
});

// RECIPES collection
db.collection('recipes').doc('recipe_001').set({
  recipe_id: 'recipe_001',
  // Reference to the user document as the author
  author: db.collection('users').doc('user_001'),
  title: 'Delicious Vegan Salad',
  media_url: 'https://example.com/recipe.jpg',
  ratings: 4.5,
  isRecommended: true,
  // Reference ingredients used in the recipe
  ingredients: [ db.collection('ingredients').doc('ingredient_001') ],
  instructions: [
    'Wash all vegetables thoroughly.',
    'Chop vegetables and mix them in a bowl.',
    'Drizzle with olive oil and lemon juice.'
  ],
  tags: ['vegan', 'salad', 'healthy'],
  comments: [ db.collection('comments').doc('comment_001') ],
  created_at: admin.firestore.Timestamp.now()
});

// INGREDIENTS collection
db.collection('ingredients').doc('ingredient_001').set({
  ingredient_id: 'ingredient_001',
  name: 'Tomato'
});

// FRIDGES collection
db.collection('fridges').doc('fridge_001').set({
  fridge_id: 'fridge_001',
  // Reference to the user who owns this fridge
  user_id: db.collection('users').doc('user_001'),
  // Each ingredient object can include additional info like quantity
  ingredients: [
    { ingredient: db.collection('ingredients').doc('ingredient_001'), quantity: 5 }
  ],
  shopping_list: ['Onion', 'Garlic'],
  updated_at: admin.firestore.Timestamp.now()
});

// POSTS collection
db.collection('posts').doc('post_001').set({
  post_id: 'post_001',
  user_id: db.collection('users').doc('user_001'),
  title: 'My First Food Post',
  description: 'Sharing my experience with a new recipe!',
  created_at: admin.firestore.Timestamp.now(),
  comments: [ db.collection('comments').doc('comment_001') ]
});

// COMMENTS collection
db.collection('comments').doc('comment_001').set({
  comment_id: 'comment_001',
  // For this example, we assume the comment is on a recipe
  recipe_id: db.collection('recipes').doc('recipe_001'),
  user_id: db.collection('users').doc('user_001'),
  post_id: null,  // Not applicable when commenting on a recipe
  content: 'Looks delicious!',
  created_at: admin.firestore.Timestamp.now()
});

// RATINGS collection
db.collection('ratings').doc('rating_001').set({
  rating_id: 'rating_001',
  recipe_id: db.collection('recipes').doc('recipe_001'),
  user_id: db.collection('users').doc('user_001'),
  rating: 5,
  created_at: admin.firestore.Timestamp.now()
});

// Optional: SHOPPING LISTS collection (if you need a separate list document)
db.collection('shoppingLists').doc('list_001').set({
  list_id: 'list_001',
  user_id: db.collection('users').doc('user_001'),
  items: ['Cheese', 'Basil'],
  created_at: admin.firestore.Timestamp.now()
});

// Optional: FOLLOWS collection (to represent follow relationships)
db.collection('follows').doc('follow_001').set({
  follow_id: 'follow_001',
  follower_id: db.collection('users').doc('user_001'),
  followed_id: db.collection('users').doc('user_001'),
  created_at: admin.firestore.Timestamp.now()
});
