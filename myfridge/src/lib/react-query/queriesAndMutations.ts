import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import {
    generateAiRecipes,
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
    getUserRecipes,
    getInfiniteRecipes, // Updated function for infinite scroll
    createFridge,
    followUser,
    getAllFridgeIngredients,
    addIngredientToFridge,
    getAllIngredients,
    getIngredientByName,
    getIngredientById,
    removeIngredientFromFridge,
    addIngredientToShoppingList,
    likeWorkshop,
    saveWorkshop,
    createWorkshop,
    getWorkshops,
    updateWorkshop,
    deleteWorkshop,
    searchWorkshops,
} from "@/lib/firebase/api";
import {
    INewRecipe,
    INewUser,
    IUpdateRecipe,
    IUpdateUser,
    INewWorkshop,
    IUpdateWorkshop,
    RemoveIngredientParams,
    Recipe
} from "@/types";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import { Workshop } from "@/types";
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

export const useGetUserRecipes = (userRef?: any) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_RECIPES, userRef?.id],
        queryFn: () => {
            if (!userRef) {
                console.error("useGetUserRecipes called with an undefined userRef!");
                return [];
            }
            return getUserRecipes(userRef);
        },
        enabled: !!userRef,
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
        queryFn: ({ pageParam }) => getInfiniteRecipes({ pageParam }),
        getNextPageParam: (lastPage: { recipes: any[]; lastDoc: any }) => lastPage.lastDoc,
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
        mutationFn: ({ recipeId, mediaId }: { recipeId?: string; mediaId: string }) =>
            deleteRecipe(recipeId, mediaId),
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

// Query for fetching workshops
export const useGetWorkshops = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_WORKSHOPS],
        queryFn: async () => {
            const snapshot = await getDocs(collection(database, "Workshops"));
            return snapshot.docs.map(doc => doc.data() as Workshop);  // Ensure data is properly mapped to Workshop type
        },
    });
};

// Query for fetching workshops for infinite scrolling
export const useGetInfiniteWorkshops = () => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_INFINITE_WORKSHOPS],
        queryFn: async ({ pageParam = 0 }) => {
            const pageSize = 10; // Example page size
            const snapshot = await getDocs(
                collection(database, "Workshops")
                    .orderBy("createdAt") // Ensure proper ordering
                    .startAfter(pageParam)
                    .limit(pageSize)
            );
            const workshops = snapshot.docs.map(doc => doc.data() as Workshop);
            const nextPage = snapshot.docs.length < pageSize ? null : snapshot.docs[snapshot.docs.length - 1].id;
            return { workshops, nextPage };  // Return workshops and next page identifier
        },
        getNextPageParam: (lastPage: any) => {
            return lastPage.nextPage || null;  // Return next page or null if no more pages
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

// Mutation for updating a workshop
export const useUpdateWorkshop = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (workshop: IUpdateWorkshop) => updateWorkshop(workshop),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_WORKSHOP_BY_ID, variables.workshopId],
            });
        },
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

// Query for getting ingredient by name
export const useGetIngredientByName = (ingredient: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_INGREDIENT_BY_NAME, ingredient],
        queryFn: () => getIngredientByName(ingredient),
        enabled: !!ingredient,
    });
};

// Query for getting ingredient by ID
export const useGetIngredientById = (ingredientId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_INGREDIENT_BY_ID, ingredientId],
        queryFn: () => getIngredientById(ingredientId),
        enabled: !!ingredientId,
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
