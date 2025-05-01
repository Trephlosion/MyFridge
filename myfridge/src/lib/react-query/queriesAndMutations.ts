import {
    useQuery,
    useMutation,
    useQueryClient, useInfiniteQuery, UseMutationResult,

} from "@tanstack/react-query";
import {collection, DocumentReference, getDocs,} from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import {
    generateAiRecipes,
    createRecipe,
    createUserAccount,
    signInAccount,
    signOutAccount,
    getRecipeById,
    getCurrentUser,
    deleteRecipe,
    likeRecipe,
    unlikeRecipe,
    getUsers,
    getUserById,
    updateUser,
    getUserRecipes,
    followUser,
    getAllFridgeIngredients,
    addIngredientToFridge,
    getAllIngredients,
    removeIngredientFromFridge,
    addIngredientToShoppingList,
    likeWorkshop,
    saveWorkshop,
    createWorkshop,
    deleteWorkshop, getFollowedUsersRecipes, generateAiRecipesFromImage,

} from "@/lib/firebase/api";
import {
    INewRecipe,
    INewUser,
    IUpdateUser,
    INewWorkshop,
    Workshop,
    Recipe
} from "@/types";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";

// Mutation for creating a new user
export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (userData: INewUser) => createUserAccount(userData),
    });
};

// Mutation for signing in a user
export const useSignInAccount = () => {
    return useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            signInAccount({ email, password }),
    });
};

export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: signOutAccount,
    });
};

export const useCreateRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (recipeData: INewRecipe) => createRecipe(recipeData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_RECIPES],
            });
        },
    });
};

export const useGetUserRecipes = (recipeRefs?: DocumentReference<Recipe>[]) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_RECIPES, recipeRefs?.length],
        queryFn: () => {
            if (!recipeRefs || recipeRefs.length === 0) {
                console.warn("useGetUserRecipes: recipeRefs undefined or empty");
                return [];
            }
            return getUserRecipes(recipeRefs);
        },
        enabled: !!recipeRefs && recipeRefs.length > 0,
    });
};

// Query for searching recipes
export const useSearchRecipes = (searchTerm: string) => {
    return useQuery({
        queryKey: ["searchRecipes", searchTerm],
        queryFn: async () => {
            if (!searchTerm) return [];

            // Convert search term to lowercase for case-insensitive search
            const lowercaseSearchTerm = searchTerm.toLowerCase();

            const recipesRef = collection(database, "Recipes");
            const snapshot = await getDocs(recipesRef);

            // Filter results manually since Firestore doesn't natively support case-insensitive search
            const filteredRecipes = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                .filter((recipe) =>
                    recipe.title?.toLowerCase().includes(lowercaseSearchTerm)
                );

            return filteredRecipes;
        },
        enabled: !!searchTerm,
    });
};

// Query for getting recipe by ID
export const useGetRecipeById = (recipeId?: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECIPE_BY_ID, recipeId],
        queryFn: () => getRecipeById(recipeId),
        enabled: !!recipeId,
    });
};

// Mutation for deleting a recipe
export const useDeleteRecipe = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (recipe: any) => {
            if (!recipe.id) throw new Error("Invalid recipe: Missing ID");

            let mediaId: string;

            if (recipe.mediaUrl) {
                try {
                    const urlParts = recipe.mediaUrl.split("/o/");
                    const pathEncoded = urlParts[1]?.split("?")[0];
                    mediaId = decodeURIComponent(pathEncoded); // e.g., "images/myphoto.jpg"
                } catch {
                    console.warn("⚠️ Failed to extract media path, skipping media deletion");
                }
            }

            return deleteRecipe(recipe.id, mediaId); // mediaId may be undefined
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_RECIPES],
            });
        },
    });
};


// Hook for liking a recipe
export const useLikeRecipe = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ recipeId, userId }: { recipeId: string; userId: string }) =>
            likeRecipe(recipeId, userId),
        onSuccess: (_data, { recipeId }) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_RECIPE_BY_ID, recipeId] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CURRENT_USER] });
        },
    });
};

export const useUnlikeRecipe = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ recipeId, userId }: { recipeId: string; userId: string }) =>
            unlikeRecipe(recipeId, userId),
        onSuccess: (_data, { recipeId }) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_RECIPE_BY_ID, recipeId] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CURRENT_USER] });
        },
    });
};



// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser,
    });
};

export const useGetUsers = (limit?: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USERS],
        queryFn: () => getUsers(limit),
    });
};

export const useGetUserById = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId,
    });
};



// Mutation for updating user data
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: IUpdateUser) => updateUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};

// Mutation for Workshops
export const useCreateWorkshop = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (workshopData: INewWorkshop) => createWorkshop(workshopData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_WORKSHOPS],
            });
        },
    });
};





// Query for searching workshops
export const useSearchWorkshops = (searchTerm: string) => {
    return useQuery<Workshop[]>({
        queryKey: [QUERY_KEYS.SEARCH_WORKSHOPS, searchTerm],
        queryFn: async () => {
            if (!searchTerm) return [];

            const lowercaseSearchTerm = searchTerm.toLowerCase();
            const snapshot = await getDocs(collection(database, "Workshops"));
            return snapshot.docs
                .map(doc => doc.data() as Workshop)
                .filter(workshop =>
                    workshop.title?.toLowerCase().includes(lowercaseSearchTerm)
                );
        },
        enabled: !!searchTerm, // Prevents query from running when searchTerm is empty
    });
};

// Mutation for deleting a workshop
export const useDeleteWorkshop = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (workshopId: string) => deleteWorkshop(workshopId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_WORKSHOPS],
            });
        },
    });
};

// Mutation for liking a workshop
export const useLikeWorkshop = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
                         workshopId,
                         likesArray,
                     }: {
            workshopId: string;
            likesArray: string[];
        }) => likeWorkshop(workshopId, likesArray),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_WORKSHOP_BY_ID, variables.workshopId],
            });
        },
    });
};

// Mutation for saving a workshop
export const useSaveWorkshop = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, workshopId }: { userId: string; workshopId: string }) =>
            saveWorkshop(userId, workshopId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};

export const useFollowUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ currentUserId, profileUserId, isFollowing }: { currentUserId: string; profileUserId: string; isFollowing: boolean }) => {
            await followUser(currentUserId, profileUserId, isFollowing);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CURRENT_USER] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_BY_ID] });
        },
    });
};


// Query for getting all fridge ingredients
export const useGetAllFridgeIngredients = (fridgeId: any) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_ALL_FRIDGE_INGREDIENTS, fridgeId],
        queryFn: () => getAllFridgeIngredients(fridgeId),
        enabled: !!fridgeId,
    });
};




// Mutation for adding an ingredient to the fridge
export const useAddIngredient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ fridgeId, ingredient }: { fridgeId: string; ingredient: string }) => addIngredientToFridge(fridgeId, ingredient),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_ALL_FRIDGE_INGREDIENTS, variables.fridgeId],
            });
        },
    });
};

// Query for getting all ingredients
export const useGetAllIngredients = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_ALL_INGREDIENTS],
        queryFn: getAllIngredients,
    });
};




// Mutation for removing an ingredient from the fridge
export const useRemoveIngredientFromFridge = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ fridgeId, ingredient }: { fridgeId: any; ingredient: string }) => removeIngredientFromFridge(fridgeId, ingredient),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_ALL_FRIDGE_INGREDIENTS, variables.fridgeId],
            });
        },
    });
};

// Mutation for adding an ingredient to the shopping list
export const useAddIngredientToShoppingList = () => {
    return useMutation({
        mutationFn: ({ userId, ingredient }: { userId: string; ingredient: string }) =>
            addIngredientToShoppingList(userId, ingredient),
    });
};


export const useGenerateAiRecipes = () =>
    useMutation<Recipe[], Error, string[], unknown>({
        mutationFn: generateAiRecipes,
    });

/** Hook to generate recipes from uploaded image */
export const useGenerateImageAiRecipes = ():
    UseMutationResult<Recipe[], Error, File[]> =>
    useMutation<Recipe[], Error, File[]>({
        mutationFn: (files) => generateAiRecipesFromImage(files),
    });

export const useGetInfiniteFeed = (userId: string) =>
    useInfiniteQuery({
        queryKey: ["infiniteFeed", userId],
        queryFn: async ({ pageParam = 1 }) =>
            await getFollowedUsersRecipes(userId, pageParam),
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length < 20 ? undefined : allPages.length + 1,
    });
