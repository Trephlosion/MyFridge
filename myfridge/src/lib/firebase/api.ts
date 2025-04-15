import {
    createUserWithEmailAndPassword, onAuthStateChanged,
    signInWithEmailAndPassword, User,
} from "firebase/auth";
import { addDoc, startAfter, DocumentSnapshot, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, getDocs, runTransaction, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, database, storage,} from "@/lib/firebase/config.ts";
import { INewRecipe, IRecipeMetadata, IUpdateRecipe, IUpdateUser, IUser,  INewWorkshop, IUpdateWorkshop, FridgeData } from "@/types";
import firebase from "firebase/compat/app";
import DocumentReference = firebase.firestore.DocumentReference;

import { getFunctions, httpsCallable } from "firebase/functions";

import {useToast} from "@/hooks/use-toast";
import {useUserContext} from "@/context/AuthContext.tsx";
import {useNavigate} from "react-router-dom";



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

        //update the user's Fridge


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
        const tags: string = Array.isArray(recipe.tags) ? recipe.tags : String(recipe.tags).split(",").map(t => t.trim()).filter(Boolean);


        const { toast } = useToast();

        // Save recipe to Firestore
        const newRecipeRef = doc(collection(database, "Recipes"));
        const newRecipe = {
            author: doc(database, "Users", recipe?.userId),
            description: recipe.description,
            mediaUrl: fileUrl,
            title: recipe.title,
            instructions: recipe.instructions,
            ingredients: recipe.ingredients,
            cookTime: recipe.cookTime,
            prepTime: recipe.prepTime,
            servings: recipe.servings,
            tags: tags,
            likes: [],
            comments: [],
            createdAt: new Date(),
            mediaId: fileRef.fullPath,
        };

        await setDoc(newRecipeRef, newRecipe);

        // add new recipe to the user's recipe array
        const userRef = doc(database, "Users", recipe.userId);
        await updateDoc(userRef, {
            recipes: arrayUnion(newRecipeRef),
        });
        toast({ title: "Recipe created successfully!" });

        setTimeout(() => {
            window.location.reload(); // ✅ Refresh page after submission
        }, 1000);


        return newRecipeRef.id; // Return the new recipe's ID
    } catch (error) {
        const { toast } = useToast();
        console.error("Error creating recipe:", error);
        toast({ title: "Failed to create recipe. Please try again." });


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
    };

    // Update media if a new file is provided
    if (hasFileToUpdate) {
      const fileRef = ref(storage, `recipe/${recipe.file[0].name}`);
      await uploadBytes(fileRef, recipe.file[0]);
      const fileUrl = await getDownloadURL(fileRef);
      media = { mediaUrl: fileUrl, mediaId: fileRef.fullPath };
    }

    // Normalize tags to always be an array
    const tags: string[] = Array.isArray(recipe.tags)
      ? recipe.tags
      : String(recipe.tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

    await updateDoc(doc(database, "Recipes", recipe.recipeId), {
      description: recipe.description,
      title: recipe.title,
      instructions: recipe.instructions.split("\n").map((step: string) => step.trim()),
      cookTime: recipe.cookTime,
      prepTime: recipe.prepTime,
      servings: recipe.servings,
      tags: tags,
      likes: [],
      comments: [],
      updatedAt: new Date(),
      mediaUrl: media.mediaUrl,

    });

    // Delete the old media file if a new file was uploaded and previous mediaId exists
    if (hasFileToUpdate && (recipe as IUpdateRecipe & { mediaId?: string }).mediaId) {
      const oldFileRef = ref(storage, (recipe as IUpdateRecipe & { mediaId?: string }).mediaId!);
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
export async function likeRecipe(recipeId: string, userRef: any) {
    try {
        const recipeDoc = doc(database, "Recipes", recipeId);
        const userDoc = userRef; // expected to be a DocumentReference

        await updateDoc(recipeDoc, {
            likes: arrayUnion(userDoc),
        });

        await updateDoc(userDoc, {
            likedRecipes: arrayUnion(recipeDoc),
        });

        return { status: "ok" };
    } catch (error) {
        console.error("Error liking recipe:", error);
    }
}

// Unlike recipe
export async function unlikeRecipe(recipeId: string, userRef: any) {
    try {
        const recipeDoc = doc(database, "Recipes", recipeId);
        const userDoc = userRef;

        await updateDoc(recipeDoc, {
            likes: arrayRemove(userDoc),
        });

        await updateDoc(userDoc, {
            likedRecipes: arrayRemove(recipeDoc),
        });

        return { status: "ok" };
    } catch (error) {
        console.error("Error unliking recipe:", error);
    }
}

// Save (bookmark) recipe
export async function saveRecipe(userRef: any, recipeRef: any) {
    try {
        await updateDoc(userRef, {
            likedRecipes: arrayUnion(recipeRef),
        });

        return { status: "ok" };
    } catch (error) {
        console.error("Error saving recipe:", error);
    }
}

// Delete saved recipe
export async function deleteSavedRecipe(userRef: any, recipeRef: any) {
    try {
        await updateDoc(userRef, {
            likedRecipes: arrayRemove(recipeRef),
        });

        return { status: "ok" };
    } catch (error) {
        console.error("Error unsaving recipe:", error);
    }
}
// Get recipes by user
export async function getRecipesByUser(userRef: any) {
    try {
        const recipesRef = collection(database, "Recipes");
        const q = query(recipesRef, where("author", "==", userRef));
        const querySnapshot = await getDocs(q);

        const recipes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return recipes;
    } catch (error) {
        console.error("Error fetching recipes by user:", error);
        return [];
    }
}

// Get recipes created by the users followed by the current user
export async function getRecipesFromFollowedUsers(followingRefs: any[]) {
    try {
        if (followingRefs.length === 0) return [];

        const recipesRef = collection(database, "Recipes");

        // Firestore allows max 10 elements in an 'in' query
        const chunks = [];
        for (let i = 0; i < followingRefs.length; i += 10) {
            chunks.push(followingRefs.slice(i, i + 10));
        }

        const results: any[] = [];
        for (const chunk of chunks) {
            const q = query(recipesRef, where("author", "in", chunk));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
        }

        return results;
    } catch (error) {
        console.error("Error fetching followed users' recipes:", error);
        return [];
    }
}

// get user's saved recipes
export async function getSavedRecipes(userRef: any) {
    try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) throw new Error("User not found");

        const userData: any = userSnap.data();
        const savedRecipeRefs: any[] = userData.likedRecipes || [];

        const recipes: any[] = [];
        for (const recipeRef of savedRecipeRefs) {
            const recipeSnap = await getDoc(recipeRef);
            if (recipeSnap.exists()) {
                recipes.push({ id: recipeSnap.id, ...recipeSnap.data() });
            }
        }

        return recipes;
    } catch (error) {
        console.error("Error fetching saved recipes:", error);
        return [];
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

//Update fridge
export async function updateFridge(fridgeRef: DocumentReference, fridgeData: any) {
    try {
        const { ingredients, shoppingList } = fridgeData;

        await updateDoc(fridgeRef, {
            ingredients,
            shoppingList,
            updatedAt: new Date(),
        });

        return { status: "ok" };
    } catch (error) {
        console.error("Error updating fridge:", error);
    }
}

// Get all fridge ingredients
export async function getAllFridgeIngredients(fridgeid: any) {
    try {
        const fridgeDocRef = fridgeid; // Assuming fridgeid is a DocumentReference
        // If fridgeid is a string, create a document reference
        // const fridgeDocRef = doc(database, "Fridges", fridgeid);
        const fridgeDocSnap = await getDoc(fridgeDocRef);

        if (fridgeDocSnap.exists()) {
            const fridgeData = fridgeDocSnap.data() as FridgeData;
            const ingredientData = Array.isArray(fridgeData.ingredients) ? fridgeData.ingredients : [];
            return ingredientData;
        } else {
            console.warn(`Fridge document with id ${fridgeid} does not exist.`);
        }
    } catch (error) {
        console.error("Error fetching fridge:", error);
    }

    return []; // always return an array
}

// add new ingredient to fridge
export async function addIngredientToFridge(fridgeId: any, ingredientId: string) {
    try {
        const fridgeDoc = doc(database, "Fridges", fridgeId);
        await updateDoc(fridgeDoc, {
            ingredients: arrayUnion({ ingredientId }),
        });
        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

// remove ingredient from fridge
export async function removeIngredientFromFridge(fridgeId: any, ingredientName: string) {
    try {
        // Get DocumentReference if fridgeId is a string
        const fridgeRef = typeof fridgeId === "string"
            ? doc(database, "Fridges", fridgeId)
            : fridgeId;

        const fridgeSnap = await getDoc(fridgeRef);

        if (!fridgeSnap.exists()) {
            throw new Error("Fridge not found");
        }

        const fridgeData: any = fridgeSnap.data();

        // Filter out the ingredient by name (exact string match)
        const updatedIngredients = (Array.isArray(fridgeData.ingredients) ? fridgeData.ingredients : [])
            .filter((item: string) => item !== ingredientName);

        await updateFridge(fridgeRef, {
            ...fridgeData,
            ingredients: updatedIngredients,
        });

        console.log("Removed Ingredient:", ingredientName);
        return { status: "ok" };
    } catch (error) {
        console.error("Error removing ingredient:", error);
    }
}


export async function addIngredientToShoppingList(fridgeId: string, ingredientId: string) {
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

// add new ingredient
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


// Toggle user deactivation
export async function toggleUserActivation(userId: string): Promise<void> {
    try {
        const userRef = doc(database, "Users", userId);
        const userSnap = await getDoc(userRef);
        const currentStatus = userSnap.data()?.isDeactivated;
        await updateDoc(userRef, { isDeactivated: !currentStatus });
    } catch (error) {
        console.error("Error toggling user disabled state:", error);
    }
}

// Toggle admin status
export async function toggleUserAdmin(userId: string): Promise<void> {
    try {
        const userRef = doc(database, "Users", userId);
        const userSnap = await getDoc(userRef);
        const currentStatus = userSnap.data()?.isAdministrator;
        await updateDoc(userRef, { isAdministrator: !currentStatus });
    } catch (error) {
        console.error("Error toggling user admin state:", error);
    }
}

// Toggle creator status
export async function toggleUserCreator(userId: string): Promise<void> {
    try {
        const userRef = doc(database, "Users", userId);
        const userSnap = await getDoc(userRef);
        const currentStatus = userSnap.data()?.isVerified;
        await updateDoc(userRef, { isVerified: !currentStatus });
    } catch (error) {
        console.error("Error toggling user verified state:", error);
    }
}

// Toggle curator status
export async function toggleUserCurator(userId: string): Promise<void> {
    try {
        const userRef = doc(database, "Users", userId);
        const userSnap = await getDoc(userRef);
        const currentStatus = userSnap.data()?.isCurator;
        await updateDoc(userRef, { isCurator: !currentStatus });
    } catch (error) {
        console.error("Error toggling user curator state:", error);
    }
}

// Toggle ban status
export async function toggleUserBan(userId: string): Promise<void> {
    try {
        const userRef = doc(database, "Users", userId);
        const userSnap = await getDoc(userRef);
        const currentStatus = userSnap.data()?.isBanned;
        await updateDoc(userRef, { isBanned: !currentStatus });
    } catch (error) {
        console.error("Error toggling user banned state:", error);
    }
}

/* ---------------------------- New Functions ------------------- */

// Message Functions

// Send a message This function will send a message to the user

// Create Message Document

// AI Functions

// Reccomend A Recipe Based off Current User's Current Fridge Items
// This Function is called on the Home Page
// This function will create 3-5 generated recipes using OpenAI.

export const getTopImageForRecipe = async (title: string): Promise<string> => {
    const googleApiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
    const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
    if (!googleApiKey || !searchEngineId) {
        console.error("Google API key or search engine ID not found.");
        return "/assets/icons/recipe-placeholder.svg";
    }
    try {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
            title
        )}&searchType=image&key=${googleApiKey}&cx=${searchEngineId}`;
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch from Google Custom Search API");
        }
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].link;
        }
        return "/assets/icons/recipe-placeholder.svg";
    } catch (error) {
        console.error("Error fetching top image for recipe:", error);
        return "/assets/icons/recipe-placeholder.svg";
    }
};

export const generateAiRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OpenAI API key not found.");
    }
    const prompt = `
You are an innovative chef. Generate between 3 and 4 unique recipes that only use the following ingredients: ${ingredients.join(
        ", "
    )}.
For each recipe, provide:
  - A title.
  - A brief description.
  - A list of ingredients (including the ones provided).
  - Cooking time.
  - Prep time.
  - Servings size.
  - Detailed step-by-step instructions.
ONLY return the result, no extra text.
Return the result as a JSON array where each object has the keys "title", "description", "ingredients", "cookTime", "prepTime", "servings", and "instructions".
  `;
    const payload = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content:
                    "You are a creative and helpful chef who generates innovative recipes.",
            },
            { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API call failed: ${errorText}`);
    }

    const data = await response.json();
    let text = data.choices[0].message.content;
    text = text.trim().replace(/^```(json)?\s*/, "").replace(/\s*```$/, "");

    try {
        const recipesData = JSON.parse(text);
        let recipes: Recipe[] = recipesData.map((item: any, index: number) => ({
            id: `ai-${Date.now()}-${index}`,
            title: item.title,
            description: item.description,
            instructions: item.instructions,
            ingredients: item.ingredients,
            prepTime: item.prepTime,
            cookTime: item.cookTime,
            servings: item.servings,
            mediaUrl: "/assets/icons/recipe-placeholder.svg",
            createdAt: new Date(),
            likes: [],
            username: "AI Chef",
            pfp: "/assets/icons/ai-bot-icon.svg",
            tags: ["AI", "Auto-generated"],
        }));
        recipes = await Promise.all(
            recipes.map(async (recipe) => {
                const imageUrl = await getTopImageForRecipe(recipe.title);
                return { ...recipe, mediaUrl: imageUrl };
            })
        );
        return recipes;
    } catch (error) {
        console.error("Failed to parse OpenAI response:", error);
        throw new Error("Failed to parse OpenAI response.");
    }
};

// Then using a Recipe Card, it will display the generated recipes inside a Carousel Element.
