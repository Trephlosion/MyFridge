import {
    createUserWithEmailAndPassword, onAuthStateChanged,
    signInWithEmailAndPassword, User,
} from "firebase/auth";
import { addDoc, startAfter, DocumentSnapshot, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, database, storage } from "@/lib/firebase/config.ts";
import { INewRecipe, IRecipeMetadata, IUpdateRecipe, IUpdateUser, IUser } from "@/types";

// Create a new user and save details in Firestore
export const createUserAccount = async (userData: any) => {
    const { email, password, first_name, last_name, username } = userData;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDocRef = doc(database, "User", user.uid);
        await setDoc(userDocRef, {
            id: user.uid,
            email,
            first_name,
            last_name,
            username,
            bio: "",
            pfp: "",
            isPrivate: false,
            isVerified: false,
            isAdministrator: false,
            followers: [],
            following: [],
            recipes:  [],
            myFridge: [{ ingredientId: null, }],
        });

        return user;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

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

// Get current user
export async function getCurrentUser(): Promise<IUser | Error> {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("No user is currently signed in");

        const userDocSnap = await getDoc(doc(database, "User", currentUser.uid));
        if (!userDocSnap.exists()) throw new Error("User document not found in Firestore");

        const userData = userDocSnap.data();
        return {
            id: currentUser.uid, first_name: userData.first_name || "", last_name: userData.last_name || "",
            username: userData.username || "", email: userData.email || "", pfp: userData.pfp || "", bio: userData.bio || "",
            isPrivate: userData.isPrivate ?? false, isVerified: userData.isVerified ?? false, isAdministrator: userData.isAdministrator ?? false,
            followers: userData.followers || [], following: userData.following || [], likedRecipes: userData.likedRecipes || [] , recipes: userData.recipes || [] , myFridge: userData.myFridge || [], pfpid: userData.pfpid || ""
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
                    const userDocRef = doc(database, "User", firebaseUser.uid);
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

        const file = recipe.file[0]; // Access the first file safely

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
        const newRecipeRef = doc(collection(database, "Recipe"));
        const newRecipe = {
            userId: recipe.userId,
            description: recipe.description,
            pfp: fileUrl,
            title: recipe.dish,
            instructions: recipe.instructions,
            cookTime: recipe.cookTime,
            prepTime: recipe.prepTime,
            servings: recipe.serving,
            tags: tags,
            likes: 0,
            likedBy: [],
            comments: [],
            createdAt: new Date(),
            ratings: [{ userId: null, rating: 0 }],
            ratingAvg: 0,
            pfpId: fileRef.fullPath,
        };

        await setDoc(newRecipeRef, newRecipe);

        console.log("Recipe created successfully!");
        return newRecipeRef.id; // Return the ID of the new recipe
    } catch (error) {
        console.error("Error creating recipe:", error);
        throw error;
    }
}

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

// Get recipes by search term
export async function searchRecipe(searchTerm: string) {
    try {
        const recipeQuery = query(collection(database, "Recipe"), where("tags", "array-contains-any", searchTerm));
        const querySnapshot = await getDocs(recipeQuery);

        const recipe = querySnapshot.docs.map(doc => doc.data());
        return recipe;
    } catch (error) {
        console.log(error);
    }
}

// Get recipe by ID
export async function getRecipeById(recipeId?: string) {
    if (!recipeId) throw Error;

    try {
        const recipeDoc = await getDoc(doc(database, "Recipes", recipeId));
        if (!recipeDoc.exists()) throw Error;

        return recipeDoc.data();
    } catch (error) {
        console.log(error);
    }
}

// Update recipe
export async function updateRecipe(recipe: IUpdateRecipe) {
    const hasFileToUpdate = recipe.file.length > 0;

    try {
        let image = {
            imageUrl: recipe.imageUrl,
            imageId: recipe.imageId,
        };

        if (hasFileToUpdate) {
            const fileRef = ref(storage, `recipe/${recipe.file[0].name}`);
            await uploadBytes(fileRef, recipe.file[0]);
            const fileUrl = await getDownloadURL(fileRef);

            image = { ...image, imageUrl: fileUrl, imageId: fileRef.fullPath };
        }

        // Normalize tags: ensure it's always an array
        const tags = Array.isArray(recipe.tags)
            ? recipe.tags.map((tag: string) => tag.trim())
            : recipe.tags?.toString().split(",").map((tag: string) => tag.trim()) || [];

        await updateDoc(doc(database, "Recipe", recipe.recipeId), {
            description: recipe.description,
            title: recipe.dish,
            instructions: recipe.instructions,
            cookTime: recipe.cookTime,
            prepTime: recipe.prepTime,
            servings: recipe.serving,
            tags: tags,
            likes: 0,
            likedBy: [],
            comments: [],
            updatedAt: new Date(),
            ratings: [{ userId: null, rating: 0 }],
            ratingAvg: 0,
        });

        if (hasFileToUpdate) {
            const oldFileRef = ref(storage, recipe.imageId);
            await deleteObject(oldFileRef);
        }

        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

// Delete recipe
export async function deleteRecipe(recipeId?: string, imageId?: string) {
    if (!recipeId || !imageId) return;

    try {
        await deleteDoc(doc(database, "Recipe", recipeId));
        const fileRef = ref(storage, imageId);
        await deleteObject(fileRef);

        return { status: "Ok" };
    } catch (error) {
        console.log(error);
    }
}

// Like recipe
export async function likeRecipe(recipeId: string, likesArray: string[]) {
    try {
        await updateDoc(doc(database, "Recipe", recipeId), {
            likes: likesArray,
        });

        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

// Save recipe
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




// Get users
export async function getUsers(limit?: number) {
    const queries: any[] = [orderBy("createdAt", "desc")];

    if (limit) {
        queries.push(limit(limit));
    }

    try {
        const usersQuery = query(collection(database, "User"), ...queries);
        const querySnapshot = await getDocs(usersQuery);

        const users = querySnapshot.docs.map(doc => doc.data());
        return users;
    } catch (error) {
        console.log(error);
    }
}



// Get user by ID
export async function getUserById(userId: string): Promise<IUser | null> {
    try {
        const userDoc = await getDoc(doc(database, "User", userId));
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
            collection(database, "Recipe"),
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
        let image = { imageUrl: user.pfp, imageId: user.pfpid };

        if (hasFileToUpdate) {
            const fileRef = ref(storage, `user/${user.file[0].name}`);
            await uploadBytes(fileRef, user.file[0]);
            const fileUrl = await getDownloadURL(fileRef);
            image = { imageUrl: fileUrl, imageId: fileRef.fullPath };

            // Delete old profile picture if exists
            if (user.pfpid) {
                const oldFileRef = ref(storage, user.pfpid);
                await deleteObject(oldFileRef);
            }
        }

        await updateDoc(doc(database, "User", user.id), {
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            bio: user.bio,
            pfp: image.imageUrl,
            pfpid: image.imageId,
            isPrivate: user.isPrivate,
        });

        return { status: "ok" };
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
}

// Fetch recent recipes
export const getRecentRecipes = async (): Promise<IRecipeMetadata[]> => {
    try {
        const recipesRef = collection(database, "Recipe");
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

// Search Recipes by Caption
export async function searchRecipes(searchTerm: string): Promise<IRecipeMetadata[]> {
    try {
        const recipesRef = collection(database, "Recipe");

        // Search for matching "caption" field using Firestore `where` clause
        const recipesQuery = query(
            recipesRef,
            where("description", ">=", searchTerm), // Searches for string prefix match
            where("description", "<=", searchTerm + "\uf8ff") // Ensures range ends correctly
        );

        const querySnapshot = await getDocs(recipesQuery);

        // Map Firestore data to IRecipeMetadata
        const recipes = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as IRecipeMetadata[];

        return recipes;
    } catch (error) {
        console.error("Error searching recipes:", error);
        return [];
    }
}

// Get Recipes with Pagination (Infinite Scrolling)
export async function getInfiniteRecipes({
                                             pageParam,
                                         }: {
    pageParam?: DocumentSnapshot;
}): Promise<{ recipes: IRecipeMetadata[]; lastDoc: DocumentSnapshot | null }> {
    try {
        const recipesRef = collection(database, "Recipe");

        // Start the query
        let recipesQuery = query(
            recipesRef,
            orderBy("createdAt", "desc"), // Sort by "createdAt" descending
            limit(9) // Limit to 9 recipes per page
        );

        // If pageParam exists, use it as a cursor for pagination
        if (pageParam) {
            recipesQuery = query(
                recipesRef,
                orderBy("createdAt", "desc"),
                startAfter(pageParam),
                limit(9)
            );
        }

        const querySnapshot = await getDocs(recipesQuery);

        // Get recipes data
        const recipes = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as IRecipeMetadata[];

        // Get the last document for the cursor
        const lastDoc = querySnapshot.docs.length > 0
            ? querySnapshot.docs[querySnapshot.docs.length - 1]
            : null;

        return { recipes, lastDoc };
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return { recipes: [], lastDoc: null };
    }
}
