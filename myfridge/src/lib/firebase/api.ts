import {
    createUserWithEmailAndPassword, onAuthStateChanged,
    signInWithEmailAndPassword, User,
} from "firebase/auth";
import { addDoc, startAfter, DocumentSnapshot, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, getDocs, runTransaction, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, database, storage,} from "@/lib/firebase/config.ts";
import { INewRecipe, IRecipeMetadata, IUpdateRecipe, IUpdateUser, IUser } from "@/types";
import firebase from "firebase/compat/app";
import DocumentReference = firebase.firestore.DocumentReference;
import { INewWorkshop, IUpdateWorkshop } from "@/types";
import { getFunctions, httpsCallable } from "firebase/functions";



const functions = getFunctions();
// const toggleUserActivation = httpsCallable(functions, 'toggleUserActivation');


// AUTHENTICATION FUNCTIONS

// Sign in user
export const signInAccount = async ({ email, password }: { email: string; password: string }) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
};

// Sign out user
export const signOutAccount = async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};



// USER FUNCTIONS

 // assuming createFridge is exported elsewhere

export const createUserAccount = async (userData: any) => {
  const { email, password, username } = userData;
  const isAdministrator = userData.isAdministrator ?? false;
  const isVerified = userData.isVerified ?? false;
  const isCurator = userData.isCurator ?? false;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const myFridgeId = await createFridge(user.uid);

    const userDocRef = doc(database, "Users", user.uid);
    await setDoc(userDocRef, {
      email,
      username,
      bio: "Hey I'm new here!",
      pfp: "",
      isPrivate: false,
      isVerified: isVerified,
      isAdministrator: isAdministrator,
      isDeactivated: false,
      isBanned: false,
      isCurator: isCurator,
      followers: [],
      following: [],
      recipes: [],
      posts: [],
      comments: [],
      myFridge: doc(database, "Fridges", myFridgeId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Get current user
export async function getCurrentUser(): Promise<IUser | Error> {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("No user is currently signed in");

        const userDocSnap = await getDoc(doc(database, "Users", currentUser.uid));
        if (!userDocSnap.exists()) throw new Error("User document not found in Firestore");

        const userData = userDocSnap.data();

        return {
            id: currentUser.uid,
            username: userData.username || "",
            email: userData.email || "",
            pfp: userData.pfp || "",
            bio: userData.bio || "",
            isPrivate: userData.isPrivate ?? false,
            isVerified: userData.isVerified ?? false,
            isAdministrator: userData.isAdministrator ?? false,
            isDeactivated: userData.isDeactivated ?? false,
            isBanned: userData.isBanned ?? false,
            isCurator: userData.isCurator ?? false,
            followers: userData.followers || [],
            following: userData.following || [],
            likedRecipes: userData.likedRecipes || [],
            recipes: userData.recipes || [],
            posts: userData.posts || [],
            comments: userData.comments || [],
            myFridge: userData.myFridge,
            createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
        };
    } catch (error: unknown) {
        return error instanceof Error ? new Error(error.message) : new Error("An unknown error occurred");
    }
}


// Check if a user is authenticated and retrieve their Firestore document
export const checkAuthUser = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
                try {
                    const userDocRef = doc(database, "Users", firebaseUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        resolve({ id: firebaseUser.uid, ...userData });
                    } else {
                        console.error("User document not found");
                        resolve(null);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    reject(error);
                }
            } else {
                resolve(null);
            }
        });
    });
};

// Get users
export async function getUsers(limitCount?: number): Promise<IUser[]> {
    const queries: any[] = [orderBy("createdAt", "desc")];

    if (limitCount) {
        queries.push(limit(limitCount));
    }

    try {
        const usersQuery = query(collection(database, "Users"), ...queries);
        const querySnapshot = await getDocs(usersQuery);

        const users: IUser[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as IUser[];

        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

// Get user by ID
export async function getUserById(userId: string): Promise<IUser | null> {
    try {
        const userDoc = await getDoc(doc(database, "Users", userId));
        if (!userDoc.exists()) throw new Error("User not found");

        return { id: userId, ...userDoc.data() } as IUser;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

// Get user's recipes
export async function getUserRecipes(userId: string): Promise<IRecipeMetadata[]> {
    if (!userId) throw new Error("User ID is required to fetch recipes.");

    try {
        const recipesQuery = query(
            collection(database, "Recipes"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(recipesQuery);

        return querySnapshot.docs.map((doc) => ({
            id: doc.id, // Include Firestore document ID
            ...doc.data(),
        })) as IRecipeMetadata[];
    } catch (error) {
        console.error("Error fetching user recipes:", error);
        return [];
    }
}

// Update user
export async function updateUser(user: IUpdateUser) {
    const hasFileToUpdate = user.file && user.file.length > 0;

    try {
        let image = { imageUrl: user.pfp, imageId: user.pfp };

        if (hasFileToUpdate) {
            const fileRef = ref(storage, `user/${user.file[0].name}`);
            await uploadBytes(fileRef, user.file[0]);
            const fileUrl = await getDownloadURL(fileRef);
            image = { imageUrl: fileUrl, imageId: fileRef.fullPath };

            if (user.pfp) {
                const oldFileRef = ref(storage, user.pfp);
                await deleteObject(oldFileRef);
            }
        }

        // Update user document
        await updateDoc(doc(database, "Users", user.id), {
            username: user.username,
            email: user.email,
            pfp: image.imageUrl,
            bio: user.bio,
            isPrivate: user.isPrivate,
            isVerified: user.isVerified,
            isAdministrator: user.isAdministrator,
            isDeactivated: user.isDeactivated, // New field
            isBanned: user.isBanned, // New field
            isCurator: user.isCurator, // New field
            recipes: user.recipes.map(recipeId => doc(database, "Recipes", recipeId)), // Ensure these are references
            posts: user.posts.map(postId => doc(database, "Posts", postId)), // Ensure these are references
            comments: user.comments.map(commentId => doc(database, "Comments", commentId)), // Ensure these are references
            myFridge: doc(database, "Fridges", user.myFridge), // Ensure this is a reference
            updatedAt: new Date(),
        });

        // Update followers and following using followUser function
        for (const followerId of user.followers) {
            await followUser(followerId, user.id, false);
        }

        for (const followingId of user.following) {
            await followUser(user.id, followingId, false);
        }

        return { status: "ok" };
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
}
// Follow/unfollow user
export async function followUser(currentUserId: string, profileUserId: string, isFollowing: boolean) {
    const currentUserRef = doc(database, "Users", currentUserId);
    const profileUserRef = doc(database, "Users", profileUserId);

    await runTransaction(database, async (transaction) => {
        const currentUserDoc = await transaction.get(currentUserRef);
        const profileUserDoc = await transaction.get(profileUserRef);

        if (!currentUserDoc.exists() || !profileUserDoc.exists()) {
            throw new Error("User does not exist!");
        }

        if (isFollowing) {
            // Unfollow
            transaction.update(currentUserRef, {
                following: arrayRemove(profileUserId),
            });
            transaction.update(profileUserRef, {
                followers: arrayRemove(currentUserId),
            });
        } else {
            // Follow
            transaction.update(currentUserRef, {
                following: arrayUnion(profileUserId),
            });
            transaction.update(profileUserRef, {
                followers: arrayUnion(currentUserId),
            });
        }
    });
}


// RECIPE FUNCTIONS

// Create a new recipe
export async function createRecipe(recipe: INewRecipe) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error("No user is currently signed in");
            return;
        }

        // Validate file input
        if (!recipe.file || !Array.isArray(recipe.file) || !recipe.file[0]) {
            throw new Error("No file provided for the recipe.");
        }
        const file = recipe.file[0]; // Safely access the first file

        // Upload image to Firebase Storage
        const fileRef = ref(storage, `users/${currentUser.uid}/${file.name}`);
        await uploadBytes(fileRef, file);
        const fileUrl = await getDownloadURL(fileRef);
        if (!fileUrl) {
            await deleteObject(fileRef); // Clean up failed uploads
            throw new Error("File upload failed.");
        }

        // Normalize tags: ensure it's always an array
        // const tags: string = Array.isArray(recipe.tags)
        //     ? recipe.tags.map((tag: string) => tag.trim())
        //     : recipe.tags?.toString().split(",").map((tag: string) => tag.trim()) || [];

        // Save recipe to Firestore
        const newRecipeRef = doc(collection(database, "Recipes"));
        const newRecipe = {
            userId: doc(database, "Users", recipe?.userId),
            description: recipe.description,
            mediaUrl: fileUrl, // Updated field name
            title: recipe.title, // Updated from "dish"
            // Convert instructions string to an array of steps
            instructions: recipe.instructions,
            cookTime: recipe.cookTime,
            prepTime: recipe.prepTime,
            servings: recipe.servings, // Updated from "serving"
            tags: recipe.tags,
            likes: [], // Updated to be an empty array
            comments: [],
            createdAt: new Date(),
            // Optional rating fields can be added here if needed
            mediaId: fileRef.fullPath, // Updated field name from "pfpId"
        };

        await setDoc(newRecipeRef, newRecipe);

        // add new recipe to the user's recipe array
        const userRef = doc(database, "Users", recipe.userId);
        await updateDoc(userRef, {
            recipes: arrayUnion(newRecipeRef),
        });

        console.log("Recipe created successfully!");
        return newRecipeRef.id; // Return the new recipe's ID
    } catch (error) {
        console.error("Error creating recipe:", error);
        throw error;
    }
}

// Get recipes by search term (searching within tags)
export async function searchRecipe(searchTerm: string) {
    try {
        const recipeQuery = query(
            collection(database, "Recipes"),
            where("tags", "array-contains-any", [searchTerm])
        );
        const querySnapshot = await getDocs(recipeQuery);
        const recipes = querySnapshot.docs.map((doc) => doc.data());
        return recipes;
    } catch (error) {
        console.log(error);
    }
}

// Get recipe by ID
export async function getRecipeById(recipeId?: string) {
    if (!recipeId) throw new Error("Recipe ID is required");
    try {
        const recipeDoc = await getDoc(doc(database, "Recipes", recipeId));
        if (!recipeDoc.exists()) throw new Error("Recipe does not exist");
        return recipeDoc.data();
    } catch (error) {
        console.log(error);
    }
}

// Update recipe
export async function updateRecipe(recipe: IUpdateRecipe) {
    const hasFileToUpdate = recipe.file.length > 0;
    try {
        // Initialize media object with current values
        let media = {
            mediaUrl: recipe.mediaUrl,
            mediaId: recipe.mediaId,
        };

        // Update media if a new file is provided
        if (hasFileToUpdate) {
            const fileRef = ref(storage, `recipe/${recipe.file[0].name}`);
            await uploadBytes(fileRef, recipe.file[0]);
            const fileUrl = await getDownloadURL(fileRef);
            media = { mediaUrl: fileUrl, mediaId: fileRef.fullPath };
        }

        // Normalize tags: ensure it's always an array
        const tags = Array.isArray(recipe.tags)
            ? recipe.tags.map((tag: string) => tag.trim())
            : recipe.tags?.toString().split(",").map((tag: string) => tag.trim()) || [];

        await updateDoc(doc(database, "Recipes", recipe.recipeId), {
            description: recipe.description,
            title: recipe.title, // Updated from "dish"
            // Convert instructions string to an array
            instructions: recipe.instructions.split("\n").map((step: string) => step.trim()),
            cookTime: recipe.cookTime,
            prepTime: recipe.prepTime,
            servings: recipe.servings, // Updated from "serving"
            tags: tags,
            likes: [], // Reset likes array if needed
            comments: [],
            updatedAt: new Date(),
            // Optional: Remove or update rating fields as needed
            mediaUrl: media.mediaUrl,
            mediaId: media.mediaId,
        });

        // Delete the old media file if a new file was uploaded
        if (hasFileToUpdate && recipe.mediaId) {
            const oldFileRef = ref(storage, recipe.mediaId);
            await deleteObject(oldFileRef);
        }
        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}
// Delete recipe
export async function deleteRecipe(recipeId?: string, mediaId?: string) {
    if (!recipeId || !mediaId) return;
    try {
        await deleteDoc(doc(database, "Recipes", recipeId));
        const fileRef = ref(storage, mediaId);
        await deleteObject(fileRef);
        return { status: "Ok" };
    } catch (error) {
        console.log(error);
    }
}
// Like recipe
export async function likeRecipe(recipeId: string, likesArray: string[]) {
    try {
        await updateDoc(doc(database, "Recipes", recipeId), {
            likes: likesArray,
        });
        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

// Save (bookmark) recipe
export async function saveRecipe(userId: string, recipeId: string) {
    try {
        const savedRecipe = await addDoc(collection(database, "Bookmarks"), {
            user: userId,
            recipe: recipeId,
        });
        return savedRecipe;
    } catch (error) {
        console.log(error);
    }
}

// Delete saved recipe
export async function deleteSavedRecipe(savedRecordId: string) {
    try {
        await deleteDoc(doc(database, "Bookmarks", savedRecordId));
        return { status: "Ok" };
    } catch (error) {
        console.log(error);
    }
}

// Fetch recent recipes
export const getRecentRecipes = async (): Promise<IRecipeMetadata[]> => {
    try {
        const recipesRef = collection(database, "Recipes");
        const recipesQuery = query(recipesRef, orderBy("createdAt", "desc"), limit(20));
        const snapshot = await getDocs(recipesQuery);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as IRecipeMetadata[];
    } catch (error) {
        console.error("Error fetching recent recipes:", error);
        return [];
    }
};

// Search recipes by description (caption)
export async function searchRecipes(searchTerm: string): Promise<IRecipeMetadata[]> {
    try {
        const recipesRef = collection(database, "Recipes");
        const recipesQuery = query(
            recipesRef,
            where("description", ">=", searchTerm),
            where("description", "<=", searchTerm + "\uf8ff")
        );
        const querySnapshot = await getDocs(recipesQuery);
        const recipes = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as IRecipeMetadata[];
        return recipes;
    } catch (error) {
        console.error("Error searching recipes:", error);
        return [];
    }
};

// Get recipes with pagination (infinite scrolling)
export async function getInfiniteRecipes({
                                             pageParam,
                                         }: {
    pageParam?: DocumentSnapshot;
}): Promise<{ recipes: IRecipeMetadata[]; lastDoc: DocumentSnapshot | null }> {
    try {
        const recipesRef = collection(database, "Recipes");
        let recipesQuery = query(recipesRef, orderBy("createdAt", "desc"), limit(9));
        if (pageParam) {
            recipesQuery = query(recipesRef, orderBy("createdAt", "desc"), startAfter(pageParam), limit(9));
        }
        const querySnapshot = await getDocs(recipesQuery);
        const recipes = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as IRecipeMetadata[];
        const lastDoc =
            querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;
        return { recipes, lastDoc };
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return { recipes: [], lastDoc: null };
    }
}


// FILE FUNCTIONS
export async function uploadFile(file: File) {
    try {
        const uploadedFile = await uploadBytes(ref(storage, `uploads/${file.name}`), file);

        return uploadedFile;
    } catch (error) {
        console.log(error);
    }
}

export async function deleteFile(fileId: string) {
    try {
        const fileRef = ref(storage, fileId);
        await deleteObject(fileRef);
        return { status: "SUCC" };
    } catch (error) {
        console.log(error);
    }
}
//WORKSHOP FUNCTIONS
export const createWorkshop = async (workshopData: INewWorkshop) => {
    const workshopRef = doc(collection(database, "Workshops"));
    await setDoc(workshopRef, workshopData);
    return workshopRef.id;
};
export const getWorkshops = async (pageParam = 0) => {
    const response = await fetch(`/api/workshops?page=${pageParam}`);
    return response.json();
};
export const getWorkshopById = async (workshopId: string) => {
    const workshopRef = doc(database, "Workshops", workshopId);
    const docSnap = await getDoc(workshopRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        return null;
    }
};
export const updateWorkshop = async (workshop: IUpdateWorkshop) => {
    const workshopRef = doc(database, "Workshops", workshop.id);
    await setDoc(workshopRef, workshop, { merge: true });
};
export const deleteWorkshop = async (workshopId: string) => {
    const workshopRef = doc(database, "Workshops", workshopId);
    await deleteDoc(workshopRef);
};
export const likeWorkshop = async (workshopId: string, likesArray: string[]) => {
    const workshopRef = doc(database, "Workshops", workshopId);
    await updateDoc(workshopRef, { likes: likesArray });
};

export const saveWorkshop = async (userId: string, workshopId: string) => {
    const userRef = doc(database, "Users", userId);
    await updateDoc(userRef, { savedWorkshops: arrayUnion(workshopId) });
};

// Search workshops based on a search term (e.g., by name or description)
export const searchWorkshops = async (searchTerm: string) => {
    const workshopsRef = collection(database, "Workshops");

    // Perform the search using a query
    const querySnapshot = await getDocs(
        query(
            workshopsRef,
            where("name", "==", searchTerm),  // Adjust field and condition based on search needs
        )
    );

    const workshops = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));

    return workshops;
};



// MYFRIDGE FUNCTIONS

export async function createFridge(userid: string) {
    try {
        const fridgeRef = doc(collection(database, "Fridges"));
        const fridge = {
            userid,
            ingredients: [],
            shoppingList: [],
            updatedAt: new Date(),
        };

        await setDoc(fridgeRef, fridge);

        return fridgeRef.id;
    } catch (error) {
        console.error("Error creating fridge:", error);
        throw error;
    }
}

export async function getFridgeIDByUser(userid: string) {
    try {
        const fridgeQuery = query(collection(database, "Fridges"), where("userid", "==", userid));
        const querySnapshot = await getDocs(fridgeQuery);

        if (querySnapshot.empty) {
            throw new Error("Fridge not found");
        }

        const fridgeDoc = querySnapshot.docs[0];
        return fridgeDoc.id;
    } catch (error) {
        console.error("Error fetching fridge:", error);
        return null;
    }
}

export async function getFridgeById(fridgeId: string) {
    try {
        const fridgeDoc = await getDoc(doc(database, "Fridges", fridgeId));
        if (!fridgeDoc.exists()) throw new Error("Fridge not found");
        return fridgeDoc.data();
    } catch (error) {
        console.log(error);
    }
}

export async function updateFridge(fridgeId: string, fridgeData: any) {
    try {
        const ingredients = fridgeData.ingredients.map((ingredientId: string) => ({
            ingredientId: doc(database, "Ingredients", ingredientId),
        }));
        const shoppingList = fridgeData.shoppingList.map((ingredientId: string) => ({
            ingredientId: doc(database, "Ingredients", ingredientId),
        }));

        await updateDoc(doc(database, "Fridges", fridgeId), {
            ingredients,
            shoppingList,
            updatedAt: new Date(),
        });
        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

export async function getAllFridgeIngredients(userid: string) {
    try {


        const fridgeQuery = query(collection(database, "Fridges"), where("userid", "==", userid));
        const querySnapshot = await getDocs(fridgeQuery);

        if (querySnapshot.empty) {
            throw new Error("Fridge not found");
        }

        const fridgeDoc = querySnapshot.docs[0];
        // incrementing the index of the ingredients array
        const ingredientData = fridgeDoc.data().ingredients;
        // const ingredientData = [getIngredientNameById(fridgeDoc.data().ingredients[0].ingredientId.id)];
        return ingredientData;




    } catch (error) {
        console.error("Error fetching fridge:", error);
        return null;
    }
}

export async function addIngredientToFridge(fridgeId: string, ingredientId: string) {
    try {
        const fridgeDoc = doc(database, "Fridges", fridgeId);
        await updateDoc(fridgeDoc, {
            ingredients: arrayUnion({ ingredientId: doc(database, "Ingredients", ingredientId) }),
        });
        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

export async function removeIngredientFromFridge(fridgeId: string, ingredientId: string) {
    try {
        const fridgeDoc = doc(database, "Fridges", fridgeId);
        await updateDoc(fridgeDoc, {
            ingredients: arrayRemove({ ingredientId: doc(database, "Ingredients", ingredientId) }),
        });
        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

export async function addIngredientToShoppingList(fridgeId: string, ingredientId: string)
{
    try {
        const fridgeDoc = doc(database, "Fridges", fridgeId);
        await updateDoc(fridgeDoc, {
            shoppingList: arrayUnion({ ingredientId: doc(database, "Ingredients", ingredientId) }),
        });
        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

export async function addNewIngredient(fridgeRef: DocumentReference, ingredientName: string) {
    try {
        const ingredientRef = doc(database, "Ingredients", ingredientName);
        await setDoc(ingredientRef, { name: ingredientName });
        await updateDoc(fridgeRef, {
            ingredients: arrayUnion(ingredientName),
        });
        return { status: ok };
    } catch (error) {
        console.log(error);
    }
}

// INGREDIENT FUNCTIONS

export async function getAllIngredients() {
    try {
        const ingredientsRef = collection(database, "Ingredients");
        const querySnapshot = await getDocs(ingredientsRef);
        const ingredients = querySnapshot.docs.map((doc) => doc.data());
        return ingredients;
    } catch (error) {
        console.log(error);
    }
}

export async function getIngredientNameById(name: string) {
    try {
        const ingredientDoc = await getDoc(doc(database, "Ingredients", name));
        if (!ingredientDoc.exists()) throw new Error("Ingredient not found");
        return ingredientDoc.data();
    } catch (error) {
        console.log(error);
    }

}

export async function getIngredientByName(ingredient: string) {
    try {
        const ingredientsRef = collection(database, "Ingredients");
        const querySnapshot = await getDocs(ingredientsRef);
        const ingredients = querySnapshot.docs.map((doc) => doc.data());
        return ingredients;
    } catch (error) {
        console.log(error);
    }
}

export async function getIngredientById(ingredientId: string) {
    try {
        const ingredientDoc = await getDoc(doc(database, "Ingredients", ingredientId));
        if (!ingredientDoc.exists()) throw new Error("Ingredient not found");
        return ingredientDoc.data();
    } catch (error) {
        console.log(error);
    }
}

export async function createNewIngredient(ingredient: string) {
    // Check if ingredient already exists
    const ingredients = await getAllIngredients();
    const existingIngredient = ingredients.find((item: any) => item.name === ingredient);
    if (existingIngredient) {
        throw new Error("Ingredient already exists");
    } else {
        try {
            await addDoc(collection(database, "Ingredients"), {
                name: ingredient,
            });
            return { status: "ok" };
        } catch (error) {
            console.log(error);
        }
    }
}

/*toggleUserActivation({ uid: "USER_ID_HERE" })
    .then((result) => {
        console.log("New disabled state:", result.data.disabled);
    })
    .catch((error) => {
        console.error("Error calling function:", error);
    });*/

export async function toggleUserActivation(userId: string): Promise<void> {
    try {
        const userRef = doc(database, "Users", userId);
        await updateDoc(userRef, { isDeactivated: true });
        // Optionally, sign the user out or restrict app functionality here.
    } catch (error) {
        console.error("Error updating user disabled state:", error);
    }
}
//
