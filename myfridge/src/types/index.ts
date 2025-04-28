
// Define the types for the context
export interface AuthContextType {
    user: IUser;
    isAuthenticated: boolean;
    isLoading: boolean;
    checkAuthUser: () => Promise<boolean>;
}

// Navigation Link Type
export type INavLink = {
    imgURL: string;
    route: string;
    label: string;
};

// User Update Type
export interface IUser {
    id: string;
    username: string;
    email: string;
    pfp: string;
    bio: string;
    isPrivate: boolean;
    isVerified: boolean;
    isAdministrator: boolean;
    isDeactivated: boolean; // New field
    isBanned: boolean; // New field
    isCurator: boolean; // New field
    followers: any[];
    following: any[];
    likedRecipes: any[];
    recipes: any[];
    workshops: any[];
    comments: any[];
    myFridge: any;
    createdAt: Date;
    updatedAt: Date;

}

export interface IUpdateUser {
    id: string;
    username: string;
    email: string;
    pfp: string;
    bio: string;
    isPrivate: boolean;
    isVerified: boolean;
    isAdministrator: boolean;
    isDeactivated: boolean; // New field
    isBanned: boolean; // New field
    isCurator: boolean; // New field
    followers: any[];
    following: any[];
    likedRecipes: any[];
    recipes: any[];
    workshops: any[];
    comments: any[];
    myFridge: any;
    file?: File[];
}
// New User Interface
export interface INewUser {
    email: string; // Required email address
    password: string; // Password
    username: string; // Optional username
}

// Utility Types for General Reusability
export type FileOrURL = File[] | URL | string;

// Extended Types (Optional)
export type IFileUpload = {
    file: File[];
    metadata?: Record<string, any>;
};

export type Recipe = {
    usageCount: any;
    dietaryComplianceReview: any;
    id: string; // Firestore document ID
    title: string; // Recipe title (formerly "dish")
    description?: string;
    cookTime?: number;
    prepTime?: number;
    servings?: number;
    createdAt: Date;
    updatedAt?: Date;
    isRecommended: boolean;
    mediaUrl: string; // Image URL (formerly "pfp")
    author: any;
    userId?: any;
    username?: string;
    pfp?: string;
    tags: string[];
    instructions: string[]; // Array of instruction steps
    ingredients: string[]; // Array of ingredients
    likes: any[]; // Array of user IDs who liked the recipe
    comments: any[]; // Array of comment IDs
    file?: File[]; // Array of uploaded files
    avgRating?: number;

};

export interface IRecipeMetadata {
    id: string; // Firestore document ID
    title: string; // Recipe title (formerly "dish")
    description?: string;
    cookTime?: number;
    prepTime?: number;
    servings?: number;
    createdAt: Date;
    updatedAt?: Date;
    isRecommended: boolean;
    mediaUrl: string; // Image URL (formerly "pfp")
    author: any;
    userId?: any;
    username?: string;
    pfp?: string;
    tags: string[];
    instructions: string[]; // Array of instruction steps
    ingredients: string[]; // Array of ingredients
    likes: any[]; // Array of user IDs who liked the recipe
    comments: any[]; // Array of comment IDs
    file?: File[]; // Array of uploaded files
    avgRating?: number;
}
// types/workshop.ts
export type Workshop = {
    id: string;
    date: Date;
    pfpId: string;
    userId: any;
    title: string;
    maxParticipants: number;
    description: string;
    likes: string[];  // Example field
    // Add other fields for the workshop here
};

export interface INewWorkshop {
    title: string;
    description: string;
    date: string;
    location: string;
    instructorId: string;
}

export interface IUpdateWorkshop {
    workshopId: string;
    title?: string;
    description?: string;
    date?: string;
    location?: string;
    instructorId?: string;
}

// New Recipe Post Type
export type INewRecipe = {
    author: any;
    file: File[]; // Array of uploaded files
    title: string; // Changed from "dish" to "title"
    description: string;
    instructions: string[]; // Accept a single string (to be split into an array)
    ingredients: string[]; // Changed from "ingredients" to "ingredients"
    cookTime: number;
    prepTime: number;
    servings: number; // Changed from "serving" to "servings"
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
};

// Update Recipe Type
export type IUpdateRecipe = {
    id?: string; // Firestore document ID
    title: string; // Recipe title (formerly "dish")
    description?: string;
    cookTime?: number;
    prepTime?: number;
    servings?: number;
    createdAt?: Date;
    updatedAt: Date;
    isRecommended?: boolean;
    mediaUrl?: string; // Image URL (formerly "pfp")
    author?: any;
    username?: string;
    pfp?: string;
    tags?: string[];
    instructions?: string[]; // Array of instruction steps
    ingredients?: string[]; // Array of ingredients
    likes?: any[]; // Array of user IDs who liked the recipe
    comments?: any[]; // Array of comment IDs
    file?: File[]; // Array of uploaded files
    avgRating?: number;
};

export type FridgeData = {
    ingredients: string[];
    shoppingList: string[];
    updatedAt: any;
    userid: any;
};

export type RemoveIngredientParams = {
    fridgeId: any;
    ingredientName: string;
};


export type IRate = {
    recipeId: any,
    userId: any,
    comment: string,
    stars: any,
    createdAt: Date,
}

export type RecipeCardProps = {
    recipe: Recipe;
};

export type UserInfo = {
    pfp: string;
    username: string;
    isVerified?: boolean;
    isCurator?: boolean;
    isAdministrator?: boolean;
    id?: string;
};
