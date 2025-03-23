import {
    createUserWithEmailAndPassword, onAuthStateChanged,
    signInWithEmailAndPassword, User,
} from "firebase/auth";
import { addDoc, startAfter, DocumentSnapshot, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, database, storage } from "@/lib/firebase/config.ts";
import { INewRecipe, IRecipeMetadata, IUpdateRecipe, IUpdateUser, IUser } from "@/types";

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

// Create a new user and save details in Firestore
export const createUserAccount = async (userData: any) => {
    const { email, password,  username } = userData;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const myFridge = await createFridge(user.uid);

        const userDocRef = doc(database, "Users", user.uid);
        await setDoc(userDocRef, {
            // id: user.uid,
            email,
            username,
            bio: "Hey I'm new here!",
            pfp: "",
            isPrivate: false,
            isVerified: false,
            isAdministrator: false,
            followers: [],
            following: [],
            recipes:  [],
            posts: [],
            comments: [],
            myFridge ,
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

            // Delete old profile picture if exists
            if (user.pfp) {
                const oldFileRef = ref(storage, user.pfp);
                await deleteObject(oldFileRef);
            }
        }

        await updateDoc(doc(database, "Users", user.id), {
            username: user.username,
            email: user.email,
            pfp: image.imageUrl,
            bio: user.bio,
            isPrivate: user.isPrivate,
            isVerified: user.isVerified,
            isAdministrator: user.isAdministrator,
            followers: user.followers,
            following: user.following,
            likedRecipes: user.likedRecipes,
            recipes: user.recipes,
            posts: user.posts,
            comments: user.comments,
            myFridge: user.myFridge,
            updatedAt: new Date(),
        });

        return { status: "ok" };
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
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
        const tags = Array.isArray(recipe.tags)
            ? recipe.tags.map((tag: string) => tag.trim())
            : recipe.tags?.toString().split(",").map((tag: string) => tag.trim()) || [];

        // Save recipe to Firestore
        const newRecipeRef = doc(collection(database, "Recipes"));
        const newRecipe = {
            userId: recipe.userId,
            description: recipe.description,
            mediaUrl: fileUrl, // Updated field name
            title: recipe.title, // Updated from "dish"
            // Convert instructions string to an array of steps
            instructions: recipe.instructions.split("\n").map((step: string) => step.trim()),
            cookTime: recipe.cookTime,
            prepTime: recipe.prepTime,
            servings: recipe.servings, // Updated from "serving"
            tags: tags,
            likes: [], // Updated to be an empty array
            comments: [],
            createdAt: new Date(),
            // Optional rating fields can be added here if needed
            mediaId: fileRef.fullPath, // Updated field name from "pfpId"
        };

        await setDoc(newRecipeRef, newRecipe);
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


// MYFRIDGE FUNCTIONS

export async function createFridge(userid: string){


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

export async function getFridgeIDByUser(userid: string){
    try {
        const fridgeQuery = query(collection(database, "Fridges"), where("userid", "==", userid));
        const querySnapshot = await getDocs(fridgeQuery);

        const fridge = querySnapshot.docs.map(doc => doc.id);

        return fridge[0];
    } catch (error) {
        console.error("Error fetching fridge:", error);
        return [];
    }
}


// INGREDIENT FUNCTIONS


//
