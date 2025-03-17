import {
    useQuery,
        useMutation,
        useQueryClient,
        useInfiniteQuery,
} from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import {
    createRecipe,
    createUserAccount,
    getRecentRecipes,
    signInAccount,
    signOutAccount,
    getRecipeById,
    getCurrentUser,
    searchRecipes,
    updateRecipe,
    deleteRecipe,
    likeRecipe,
    saveRecipe,
    deleteSavedRecipe,
    getUsers,
    getUserById,
    updateUser,
    getUserRecipes, createFridge,
} from "@/lib/firebase/api";
import { INewRecipe, INewUser, IUpdateRecipe, IUpdateUser } from "@/types";
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

export const useCreateFridge = () => {
    return useMutation({
        mutationFn: (userID: string) => createFridge(userID),
    });
}

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

export const useGetUserRecipes = (userId?: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_RECIPES, userId || "guest"], // ✅ Ensure queryKey is always defined
        queryFn: () => {
            if (!userId) {
                console.error("useGetUserRecipes called with an undefined userId!");
                return [];
            }
            return getUserRecipes(userId);
        },
        enabled: !!userId, // ✅ Only run query if userId is defined
    });
};


// Query for fetching recent recipes
export const useGetRecentRecipes = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_RECIPES],
        queryFn: getRecentRecipes,
    });
};

// Query for fetching recipes for infinite scrolling
export const useGetRecipes = () => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_INFINITE_RECIPES],
        queryFn: getUserRecipes, // Adjusted function
        getNextPageParam: (lastPage: any) => {
            if (!lastPage || lastPage.length === 0) return null; // No more pages
            const lastId = lastPage[lastPage.length - 1].id;
            return lastId;
        },
    });
};

// Query for searching recipes
export const useSearchRecipes = (searchTerm: string) => {
    return useQuery({
        queryKey: ["searchRecipes", searchTerm],
        queryFn: async () => {
            if (!searchTerm) return [];

            // ✅ Convert search term to lowercase for case-insensitive search
            const lowercaseSearchTerm = searchTerm.toLowerCase();

            const recipesRef = collection(database, "Recipes");
            const snapshot = await getDocs(recipesRef);

            // ✅ Filter results manually since Firestore doesn't natively support case-insensitive search
            const filteredRecipes = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                .filter((recipe) =>
                    recipe.title?.toLowerCase().includes(lowercaseSearchTerm) // ✅ Case-insensitive match
                );

            return filteredRecipes;
        },
        enabled: !!searchTerm, // ✅ Only fetch when searchTerm exists
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

// Mutation for updating a recipe
export const useUpdateRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (recipe: IUpdateRecipe) => updateRecipe(recipe),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECIPE_BY_ID, variables.recipeId],
            });
        },
    });
};

// Mutation for deleting a recipe
export const useDeleteRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ recipeId, imageId }: { recipeId?: string; imageId: string }) =>
            deleteRecipe(recipeId, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_RECIPES],
            });
        },
    });
};

// Mutation for liking a recipe
export const useLikeRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
                         recipeId,
                         likesArray,
                     }: {
            recipeId: string;
            likesArray: string[];
        }) => likeRecipe(recipeId, likesArray),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECIPE_BY_ID, variables.recipeId],
            });
        },
    });
};

// Mutation for saving a recipe
export const useSaveRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, recipeId }: { userId: string; recipeId: string }) =>
            saveRecipe(userId, recipeId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};

// Mutation for deleting a saved recipe
export const useDeleteSavedRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (savedRecordId: string) => deleteSavedRecipe(savedRecordId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
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

