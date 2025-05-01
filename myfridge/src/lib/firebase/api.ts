// Top Imports
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User,
} from "firebase/auth";
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,

    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,

    updateDoc,
    where,
    DocumentReference,
    DocumentData,
    Timestamp,
} from "firebase/firestore";
import {ref as storageRef, uploadBytes, getDownloadURL, deleteObject, ref} from "firebase/storage";
import { auth, database, storage } from "@/lib/firebase/config";
import {
    INewRecipe,
    IRecipeMetadata,
    IUpdateUser,
    IUser,
    INewWorkshop,
    IUpdateWorkshop,
    FridgeData,
    Recipe,
    Workshop,
    Challenge, AnalyticsResponse,
} from "@/types";

// AUTH FUNCTIONS
export const signInAccount = async ({ email, password }: { email: string; password: string }) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const signOutAccount = async () => {
    await signOut(auth);
};

// User Functions

export const createUserAccount = async (userData: any) => {
    const { email, password, username } = userData;
    const isAdministrator = userData.isAdministrator ?? false;
    const isVerified = userData.isVerified ?? false;
    const isCurator = userData.isCurator ?? false;

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
        isVerified,
        isAdministrator,
        isDeactivated: false,
        isBanned: false,
        isCurator,
        followers: [],
        following: [],
        recipes: [],
        workshops: [],
        challenges: [],
        comments: [],
        myFridge: doc(database, "Fridges", myFridgeId),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return user;
};

export async function getCurrentUser(): Promise<IUser> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user is currently signed in");

    const userDocSnap = await getDoc(doc(database, "Users", currentUser.uid));
    if (!userDocSnap.exists()) throw new Error("User document not found");

    const userData = userDocSnap.data();
    return {
        id: currentUser.uid,
        username: userData.username,
        email: userData.email,
        pfp: userData.pfp,
        bio: userData.bio,
        isPrivate: userData.isPrivate,
        isVerified: userData.isVerified,
        isAdministrator: userData.isAdministrator,
        isDeactivated: userData.isDeactivated,
        isBanned: userData.isBanned,
        isCurator: userData.isCurator,
        followers: userData.followers,
        following: userData.following,
        likedRecipes: userData.likedRecipes ?? [],
        recipes: userData.recipes ?? [],
        workshops: userData.workshops ?? [],
        challenges: userData.challenges ?? [],
        comments: userData.comments ?? [],
        myFridge: userData.myFridge,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
    };
}

// Check Authentication
export const checkAuthUser = async (): Promise<IUser | null> => {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
                try {
                    const userDocRef = doc(database, "Users", firebaseUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        resolve({ id: firebaseUser.uid, ...userDocSnap.data() } as IUser);
                    } else {
                        resolve(null);
                    }
                } catch (error) {
                    reject(error);
                }
            } else {
                resolve(null);
            }
        });
    });
};

// Get All Users
export async function getUsers(limitCount?: number): Promise<IUser[]> {
    const queries: any[] = [orderBy("createdAt", "desc")];
    if (limitCount) queries.push(limit(limitCount));

    const usersQuery = query(collection(database, "Users"), ...queries);
    const querySnapshot = await getDocs(usersQuery);

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as IUser[];
}

// Get User By Id
export async function getUserById(userId: string): Promise<IUser | null> {
    const userDoc = await getDoc(doc(database, "Users", userId));
    if (!userDoc.exists()) return null;
    return { id: userId, ...userDoc.data() } as IUser;
}

// Follow or Unfollow User
export async function followUser(currentUserId: string, profileUserId: string, isFollowing: boolean) {
    const currentUserRef = doc(database, "Users", currentUserId);
    const profileUserRef = doc(database, "Users", profileUserId);

    await runTransaction(database, async (transaction) => {
        const [currentUserDoc, profileUserDoc] = await Promise.all([
            transaction.get(currentUserRef),
            transaction.get(profileUserRef),
        ]);

        if (!currentUserDoc.exists() || !profileUserDoc.exists()) {
            throw new Error("One of the users does not exist.");
        }

        if (isFollowing) {
            transaction.update(currentUserRef, { following: arrayRemove(profileUserId) });
            transaction.update(profileUserRef, { followers: arrayRemove(currentUserId) });
        } else {
            transaction.update(currentUserRef, { following: arrayUnion(profileUserId) });
            transaction.update(profileUserRef, { followers: arrayUnion(currentUserId) });
        }
    });
}

// Recipe Functions
// Create Recipe
export async function createRecipe(recipe: INewRecipe) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");

    if (!recipe.file?.[0]) throw new Error("No file uploaded");
    const file = recipe.file[0];

    const fileRef = storageRef(storage, `users/${currentUser.uid}/${file.name}`);
    await uploadBytes(fileRef, file);
    const fileUrl = await getDownloadURL(fileRef);

    const tags = Array.isArray(recipe.tags)
        ? recipe.tags
        : recipe.tags?.split(",").map((tag) => tag.trim()) ?? [];

    const newRecipeRef = doc(collection(database, "Recipes"));
    const newRecipe = {
        author: doc(database, "Users", recipe.author),
        description: recipe.description,
        mediaUrl: fileUrl,
        title: recipe.title,
        instructions: recipe.instructions,
        ingredients: recipe.ingredients,
        cookTime: recipe.cookTime,
        prepTime: recipe.prepTime,
        servings: recipe.servings,
        isRecommended: false,
        isApproved: false,
        isSeasonal: false,
        tags,
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
        mediaId: fileRef.fullPath,
    };

    await setDoc(newRecipeRef, newRecipe);
    await updateDoc(doc(database, "Users", recipe.author), {
        recipes: arrayUnion(newRecipeRef),
    });

    return newRecipeRef.id;
}

// Delete Recipe
export const deleteRecipe = async (recipeId: string, mediaId: string) => {
    const recipeRef = doc(database, "Recipes", recipeId);
    const recipeSnap = await getDoc(recipeRef);
    if (!recipeSnap.exists()) return;

    const data = recipeSnap.data();
    const authorRef = data.author;

    if (mediaId) {
        const mRef = storageRef(storage, mediaId);
        await deleteObject(mRef).catch(() => {});
    }

    const ratingsSnap = await getDocs(collection(recipeRef, "Ratings"));
    await Promise.all(ratingsSnap.docs.map((r) => deleteDoc(r.ref)));

    if (authorRef) {
        await updateDoc(authorRef, {
            recipes: arrayRemove(recipeRef),
        });
    }

    await updateDoc(recipeRef, { comments: [] }).catch(() => {});

    const usersSnap = await getDocs(collection(database, "Users"));
    await Promise.all(
        usersSnap.docs.map((uDoc) =>
            updateDoc(uDoc.ref, { comments: arrayRemove(recipeId) }).catch(() => {})
        )
    );

    await deleteDoc(recipeRef);
};

// Like Recipe
export async function likeRecipe(recipeId: string, userId: string) {
    const recipeRef = doc(database, "Recipes", recipeId);
    const userRef = doc(database, "Users", userId);
    await runTransaction(database, async (tx) => {
        const [recipeSnap, userSnap] = await Promise.all([
            tx.get(recipeRef),
            tx.get(userRef),
        ]);
        if (!recipeSnap.exists() || !userSnap.exists()) throw new Error("Invalid refs");

        tx.update(recipeRef, { likes: arrayUnion(userId) });
        tx.update(userRef, { likedRecipes: arrayUnion(recipeId) });
    });
}

// Unlike Recipe
export async function unlikeRecipe(recipeId: string, userId: string) {
    const recipeRef = doc(database, "Recipes", recipeId);
    const userRef = doc(database, "Users", userId);
    await runTransaction(database, async (tx) => {
        const [recipeSnap, userSnap] = await Promise.all([
            tx.get(recipeRef),
            tx.get(userRef),
        ]);
        if (!recipeSnap.exists() || !userSnap.exists()) throw new Error("Invalid refs");

        tx.update(recipeRef, { likes: arrayRemove(userId) });
        tx.update(userRef, { likedRecipes: arrayRemove(recipeId) });
    });
}

// Get User's Recipes from References
export const getUserRecipes = async (recipeRefs: DocumentReference<Recipe>[]): Promise<Recipe[]> => {
    if (!Array.isArray(recipeRefs)) return [];

    const recipeSnaps = await Promise.all(recipeRefs.map((ref) => getDoc(ref)));
    return recipeSnaps
        .filter((snap) => snap.exists())
        .map((snap) => ({
            id: snap.id,
            ...(snap.data() as Omit<Recipe, "id">),
        }));
};

// Fridge Functions
// Create a new fridge
export async function createFridge(userId: string) {
    const fridgeRef = doc(collection(database, "Fridges"));
    const fridge = {
        userid: userId,
        ingredients: [],
        shoppingList: [],
        updatedAt: serverTimestamp(),
    };
    await setDoc(fridgeRef, fridge);
    return fridgeRef.id;
}

// Get all fridge ingredients
export async function getAllFridgeIngredients(fridgeRef: DocumentReference<DocumentData>) {
    const fridgeSnap = await getDoc(fridgeRef);
    if (!fridgeSnap.exists()) return [];
    const fridgeData = fridgeSnap.data() as FridgeData;
    return Array.isArray(fridgeData.ingredients) ? fridgeData.ingredients : [];
}

// Add new ingredient to fridge
export async function addIngredientToFridge(fridgeId: string, ingredientName: string) {
    const fridgeDoc = doc(database, "Fridges", fridgeId);
    await updateDoc(fridgeDoc, {
        ingredients: arrayUnion(ingredientName),
    });
    return { status: "ok" };
}

// Remove ingredient from fridge
export async function removeIngredientFromFridge(fridgeId: string, ingredientName: string) {
    const fridgeDoc = doc(database, "Fridges", fridgeId);
    const fridgeSnap = await getDoc(fridgeDoc);

    if (!fridgeSnap.exists()) throw new Error("Fridge not found");
    const fridgeData = fridgeSnap.data() as FridgeData;

    const updatedIngredients = (Array.isArray(fridgeData.ingredients) ? fridgeData.ingredients : []).filter((item) => item !== ingredientName);

    await updateDoc(fridgeDoc, {
        ingredients: updatedIngredients,
        updatedAt: serverTimestamp(),
    });

    return { status: "ok" };
}

// Ingredient Functions
// Get all ingredients
export async function getAllIngredients() {
    const ingredientsRef = collection(database, "Ingredients");
    const querySnapshot = await getDocs(ingredientsRef);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Get ingredient by name (search)
export async function getIngredientByName(ingredientName: string) {
    const ingredientsRef = collection(database, "Ingredients");
    const q = query(ingredientsRef, where("name", "==", ingredientName));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Get ingredient by ID
export async function getIngredientById(ingredientId: string) {
    const ingredientDoc = await getDoc(doc(database, "Ingredients", ingredientId));
    if (!ingredientDoc.exists()) return null;
    return { id: ingredientDoc.id, ...ingredientDoc.data() };
}

// Create a new ingredient
export async function createNewIngredient(name: string) {
    const existingIngredients = await getAllIngredients();
    if (existingIngredients.some((item: any) => item.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("Ingredient already exists");
    }

    await addDoc(collection(database, "Ingredients"), { name });
    return { status: "ok" };
}


// WORKSHOP FUNCTIONS
export const createWorkshop = async (workshop: INewWorkshop) => {
    const refDoc = doc(collection(database, "Workshops"));
    await setDoc(refDoc, {
        ...workshop,
        createdAt: serverTimestamp(),
    });
    return refDoc.id;
};

export const getWorkshopById = async (workshopId: string) => {
    const refDoc = doc(database, "Workshops", workshopId);
    const snap = await getDoc(refDoc);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Workshop;
};

export const updateWorkshop = async (workshop: IUpdateWorkshop) => {
    const refDoc = doc(database, "Workshops", workshop.id);
    await setDoc(refDoc, { ...workshop, updatedAt: serverTimestamp() }, { merge: true });
};

export const deleteWorkshop = async (workshopId: string) => {
    const refDoc = doc(database, "Workshops", workshopId);
    await deleteDoc(refDoc);
};

// CHALLENGE FUNCTIONS

export async function createChallenge({ title, description, creatorRef }: { title: string, description: string, creatorRef: DocumentReference }) {
    const newChallenge = {
        title,
        description,
        creator: creatorRef,
        participants: [],
        submissions: [],
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(database, "Challenges"), newChallenge);
    return docRef;
}

export async function getAllChallenges(): Promise<Challenge[]> {
    const querySnapshot = await getDocs(collection(database, "Challenges"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Challenge[];
}


// AI FUNCTIONS

export const getTopImageForRecipe = async (title: string): Promise<string> => {
    const googleApiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
    const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

    if (!googleApiKey || !searchEngineId) return "/assets/icons/recipe-placeholder.svg";

    try {
        const response = await fetch(`https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(title)}&searchType=image&key=${googleApiKey}&cx=${searchEngineId}`);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            return data.items[0].link;
        }

        return "/assets/icons/recipe-placeholder.svg";
    } catch (error) {
        console.error("Error fetching top image:", error);
        return "/assets/icons/recipe-placeholder.svg";
    }
};

export const generateAiRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) throw new Error("Missing OpenAI API Key");

    const prompt = `You are an innovative chef. Generate 5-6 unique recipes using only the following ingredients: ${ingredients.join(",")}\nReturn JSON array with title, description, ingredients, cookTime, prepTime, servings, instructions.`;

    const payload = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: "You are a helpful chef." }, { role: "user", content: prompt }],
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

    const data = await response.json();
    let text = data.choices[0].message.content.trim().replace(/^```json/, "").replace(/```$/, "");

    const recipesData = JSON.parse(text);

    const recipes: Recipe[] = await Promise.all(
        recipesData.map(async (item: any, idx: number) => {
            const img = await getTopImageForRecipe(item.title);
            return {
                id: `ai-${Date.now()}-${idx}`,
                title: item.title,
                description: item.description,
                instructions: item.instructions,
                ingredients: item.ingredients,
                prepTime: item.prepTime,
                cookTime: item.cookTime,
                servings: item.servings,
                mediaUrl: img,
                username: "AI Chef",
                pfp: "/assets/icons/ai-bot-icon.svg",
                tags: ["AI", "Auto-generated"],
            };
        })
    );

    return recipes;
};


/**
 * Generate 4–5 recipes from a user-uploaded image.
 * Uses GPT-4o to “see” the image (encoded as data URL).
 */
export const generateAiRecipesFromImage = async (files: File[]): Promise<Recipe[]> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OpenAI API Key");
    if (!files || files.length === 0) throw new Error("No image file provided");

    // helper: file → data URL
    const toDataURL = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
        });
    const dataUrl = await toDataURL(files[0]);

    const systemPrompt = { role: "system", content: "You are a experienced chef." };
    const userPrompt = {
        role: "user",
        content: `You are an innovative chef. Here is an image: ${dataUrl}
Generate 4–5 unique recipes based on the ingredients you see or the vibe/feeling of the image.
Return a JSON array of objects with these keys:
- title (string)
- description (string)
- ingredients (string[])
- prepTime (number of minutes)
- cookTime (number of minutes)
- servings (number)
- instructions (string[])

Only return raw JSON.`,
    };

    const payload = {
        model: "gpt-4o",
        messages: [systemPrompt, userPrompt],
        temperature: 0.7,
        max_tokens: 800,
    };

    // retry logic
    const maxRetries = 3;
    let response: Response | null = null;
    let json: any = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
        });

        // on rate limit, back off
        if (response.status === 429) {
            const retryAfter = response.headers.get("Retry-After");
            const delayMs = retryAfter
                ? parseInt(retryAfter, 10) * 1000
                : Math.pow(2, attempt) * 1000;
            console.warn(`OpenAI 429 → retrying in ${delayMs}ms (attempt ${attempt + 1})`);
            await new Promise((res) => setTimeout(res, delayMs));
            continue;
        }

        // any other HTTP error
        if (!response.ok) {
            const txt = await response.text().catch(() => "");
            throw new Error(`OpenAI error ${response.status}: ${txt}`);
        }

        // success
        json = await response.json();
        break;
    }

    if (!json) {
        throw new Error("Failed to get a valid response from OpenAI after retries");
    }

    // guard missing choices
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
        console.error("OpenAI raw response:", json);
        throw new Error("OpenAI did not return any content in choices[0]");
    }

    // strip markdown fences, parse JSON
    const cleaned = content.trim().replace(/^```json/, "").replace(/```$/, "");
    let parsed: any[];
    try {
        parsed = JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to JSON.parse OpenAI output:", cleaned);
        throw new Error("Invalid JSON from OpenAI");
    }

    // enrich with images
    const recipes: Recipe[] = await Promise.all(
        parsed.map(async (item, idx) => {
            const img = await getTopImageForRecipe(item.title);
            return {
                id: `ai-img-${Date.now()}-${idx}`,
                title: item.title,
                description: item.description,
                ingredients: item.ingredients,
                prepTime: item.prepTime,
                cookTime: item.cookTime,
                servings: item.servings,
                instructions: item.instructions,
                mediaUrl: img,
                username: "AI Chef",
                pfp: "/assets/icons/ai-bot-icon.svg",
                tags: ["AI", "Image-Based"],
            };
        })
    );

    return recipes;
};


export const generateRecipeAnalytics = async (
    recipeId: string
): Promise<AnalyticsResponse> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OpenAI API Key");

    // 1) fetch all Ratings docs
    const ratingsSnap = await getDocs(
        collection(database, "Recipes", recipeId, "Ratings")
    );
    const ratings = ratingsSnap.docs.map((ds) => {
        const d = ds.data() as {
            stars: number;
            comment: string;
            createdAt: Timestamp;
            recipeId: DocumentReference;
            userId: DocumentReference;
        };
        return {
            stars: d.stars,
            comment: d.comment,
            createdAt: d.createdAt.toDate().toISOString(),
        };
    });

    // 2) build prompt
    const prompt = `
You are a recipe analytics assistant. Given this JSON array of user ratings:
${JSON.stringify(ratings, null, 2)}

Return a single JSON object with:
- title: string
- averageRating: number
- totalReviews: number
- ratingCounts: an object mapping each star (1–5) to its count
- mostRecentReviewDate: ISO 8601 date of the latest rating
- overview: a 2 paragraph summary of the reviews as well as a general analysis of the recipe

Respond **only** with valid JSON.
`.trim();

    // 3) call OpenAI
    const payload = {
        model: "gpt-4o",
        messages: [
            { role: "system", content: "You analyze recipe ratings." },
            { role: "user",   content: prompt }
        ],
        temperature: 0.0,
        max_tokens: 300,
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
    });
    const json = await res.json();
    let content: string = json.choices[0].message.content.trim();

    // strip fences if any
    content = content.replace(/^```json/, "").replace(/```$/g, "").trim();

    // parse and return
    return JSON.parse(content) as AnalyticsResponse;
};



// Update user
export async function updateUser(user: IUpdateUser) {

    try {
        let image = { imageUrl: user.pfp, imageId: user.pfp };
        if (user.file && user.file.length > 0) {
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
            workshops: user.workshops.map(workshopId => doc(database, "Workshops", workshopId)), // Ensure these are references
            challenges: user.challenges.map(challengeId => doc(database, "Challenges", challengeId)), // Ensure these are references
            comments: user.comments.map(commentId => doc(database, "Comments", commentId)), // Ensure these are references
            myFridge: doc(database, "Fridges", user.myFridge), // Ensure this is a reference
            updatedAt: serverTimestamp(),
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

// RECIPE FUNCTIONS


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

//Dietary Compliance Review
export const addDietaryComplianceReview = async ({recipeId, curatorId, curatorUsername, reviewText, usageCount,}: { recipeId: string; curatorId: string; curatorUsername: string; reviewText: string; usageCount: number; }) => {
    try {
        // Reference to the DietaryComplianceReviews collection
        const docRef = await addDoc(collection(database, 'DietaryComplianceReviews'), {
            recipeId,
            curatorId,
            curatorUsername,
            reviewText,
            usageCount,
            createdAt: serverTimestamp(),
        });

        console.log('Dietary Compliance Review added with ID:', docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding Dietary Compliance Review:', error);
        return { success: false, error };
    }
};

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

//WORKSHOP FUNCTIONS

export const likeWorkshop = async (workshopId: string, likesArray: string[]) => {
    const workshopRef = doc(database, "Workshops", workshopId);
    await updateDoc(workshopRef, { likes: likesArray });
};

export const saveWorkshop = async (userId: string, workshopId: string) => {
    const userRef = doc(database, "Users", userId);
    await updateDoc(userRef, { savedWorkshops: arrayUnion(workshopId) });
};

// MYFRIDGE FUNCTIONS


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

// Toggle user deactivation
export async function toggleUserActivation(userId: string): Promise<void> {
    try {
        const userRef = doc(database, "Users", userId);
        const userSnap = await getDoc(userRef);
        const currentStatus = userSnap.data()?.isDeactivated;
        console.log("Current status:", currentStatus);
        console.log("Toggling user deactivation status for userId:", userId);
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

// Reccomend A Recipe Based off Current User's Current Fridge Items
// This Function is called on the Home Page
// This function will create 3-5 generated recipes using OpenAI.

export const getTopUsers = async (limit: number): Promise<IUser[]> => {
    const usersRef = collection(database, "Users");
    const snap = await getDocs(usersRef);
    const users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as IUser[];
    return users
        .filter(u => !u.isBanned && !u.isDeactivated)
        .sort((a, b) => b.followers.length - a.followers.length)
        .slice(0, limit);
};

export const getTopWorkshops = async (limit: number): Promise<Workshop[]> => {
    const workshopsRef = collection(database, "Workshops");
    const snap = await getDocs(workshopsRef);
    const workshops = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Workshop[];
    return workshops
        .filter(w => Array.isArray(w.participants))
        .sort((a, b) => b.participants.length - a.participants.length)
        .slice(0, limit);
};

export const getFollowedUsersRecipes = async (
    userId: string,
    page: number
): Promise<Recipe[]> => {
    const userSnap = await getDoc(doc(database, "Users", userId));
    if (!userSnap.exists()) return [];

    const following: DocumentReference[] = userSnap.data().following.map((id: string) =>
        typeof id === "string" ? doc(database, "Users", id) : id
    );

    const batchSize = 20;
    const start = (page - 1) * batchSize;

    console.log("Following list:", following);


    // Load all followed users in parallel
    const followedUserSnaps = await Promise.all(
        following.map(async (ref) => {
            try {
                const snap = await getDoc(ref);
                return snap.exists() ? snap : null;
            } catch {
                return null;
            }
        })
    );

    // Gather all recipe refs from those users
    const allRecipeRefs: DocumentReference[] = followedUserSnaps
        .filter(Boolean)
        .flatMap((snap) => (snap!.data().recipes || []) as DocumentReference[]);

    // Load all recipe docs in parallel
    const recipeSnaps = await Promise.all(
        allRecipeRefs.map(async (ref) => {
            try {
                const snap = await getDoc(ref);
                return snap.exists() ? snap : null;
            } catch {
                return null;
            }
        })
    );

    const allRecipes: Recipe[] = recipeSnaps
        .filter(Boolean)
        .map((snap) => ({ id: snap!.id, ...snap!.data() } as Recipe));

    // Sort all recipes by newest
    const sorted = allRecipes.sort(
        (a, b) =>
            new Date(b.createdAt?.toDate?.() || 0).getTime() -
            new Date(a.createdAt?.toDate?.() || 0).getTime()
    );

    console.log("Fetched followed users' recipe count:", allRecipes.length);
    console.log("Sample recipe titles:", allRecipes.map(r => r.title));

    // Return the paginated slice
    return sorted.slice(start, start + batchSize);
};

export const getTopChallenges = async (limit: number): Promise<Challenge[]> => {
    const ref = collection(database, "Challenges");
    const snap = await getDocs(ref);
    const challenges = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Challenge[];

    return challenges
        .filter(c => Array.isArray(c.submissions))
        .sort((a, b) => b.submissions.length - a.submissions.length)
        .slice(0, limit);
};

export function ensureUserRef(input: any): DocumentReference {
    if (typeof input === "object" && input.id && input.firestore) {
        // Looks like a fake ref from serialization
        return doc(database, "Users", input.id);
    }

    if (typeof input === "string") {
        return doc(database, "Users", input);
    }

    return input as DocumentReference;
}

export function resolveUserRef(input: any): DocumentReference {
    if (typeof input === "string") {
        return doc(database, "Users", input);
    }

    if (typeof input === "object" && "id" in input && typeof input.id === "string") {
        return doc(database, "Users", input.id); // reconstruct ref from id
    }

    return input as DocumentReference;
}
