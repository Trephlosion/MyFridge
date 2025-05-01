
// Define the types for the context
import {DocumentReference, Timestamp} from "firebase/firestore";

export interface AuthContextType {
    user: IUser;
    isAuthenticated: boolean;
    isLoading: boolean;
    checkAuthUser: () => Promise<boolean>;
    setUserContext: (object :{isAuthenticated: boolean, user: IUser}) => void;
}

// Navigation Link Type
export type INavLink = {
    imgURL: string;
    route: string;
    label: string;
};

export interface AnalyticsResponse {
    averageRating: number;
    totalReviews: number;
    ratingCounts: Record<1|2|3|4|5, number>;
    mostRecentReviewDate: string;
    overview: string;
    title: string;
}

export interface UnlikeRecipeArgs {
    recipeId: string;
    userId: string;
}


// User Update Type
// Normalized User
export interface IUser {
    id: string;
    username: string;
    email: string;
    pfp: string;
    bio: string;

    isPrivate: boolean;
    isVerified: boolean;
    isAdministrator: boolean;
    isDeactivated: boolean;
    isBanned: boolean;
    isCurator: boolean;

    followers: DocumentReference<IUser>[];     // User refs
    following: DocumentReference<IUser>[];
    likedRecipes: DocumentReference<Recipe>[]; // Recipe refs
    recipes: DocumentReference<Recipe>[];      // Recipe refs
    workshops: DocumentReference<Workshop>[];  // Workshop refs
    comments: DocumentReference<any>[];        // Comment refs
    challenges: DocumentReference<any>[];      // Challenge refs
    myFridge: DocumentReference<any> | null;   // Fridge ref

    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface IUpdateUser extends Omit<IUser, "createdAt" | "updatedAt"> {
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
    id: string;
    title: string;
    description?: string;
    cookTime?: number;
    prepTime?: number;
    servings?: number;

    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    isRecommended?: boolean;
    isApproved?: boolean;
    isSeasonal?: boolean;

    mediaUrl: string;
    author?: DocumentReference<IUser>;
    userId?: DocumentReference<IUser>;

    username?: string;
    pfp?: string;

    tags: string[];
    instructions: string[];
    ingredients: string[];

    likes?: DocumentReference<IUser>[];
    comments?: DocumentReference<any>[];

    file?: File[];
    avgRating?: number;

    usageCount?: number;
    dietaryComplianceReview?: any;
};

export interface IRecipeMetadata extends Recipe {}

// types/workshop.ts
export type Workshop = {
    id: string;
    title: string;
    description: string;
    date: Timestamp;
    location: string;
    maxParticipants: number;

    media_url?: string;
    likes?: string[];
    participants: DocumentReference<IUser>[];

    userId: DocumentReference<IUser>;

    creatorUsername: string;
    creatorPfp: string;
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

export interface INotification {
    id: string;
    userId: string;
    message: string;
    recipeId?: string;
    type: "new_comment" | "new_recipe";
    isRead: boolean;
    createdAt: Timestamp;
}

export type FridgeData = {
    ingredients: string[];
    shoppingList: string[];
    updatedAt: Timestamp;
    userid: DocumentReference<IUser>;
};

export type Fridge = {
    id: string;
    ingredients: string[];
    updatedAt: any;
    userid: DocumentReference;
};

export type RemoveIngredientParams = {
    fridgeId: DocumentReference<any>;
    ingredientName: string;
};

export type IRate = {
    recipeId: DocumentReference<Recipe>;
    userId: DocumentReference<IUser>;
    comment: string;
    stars: number;
    createdAt: Timestamp;
};

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

export type Challenge = {
    id: string;
    title: string;
    description: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;

    deadline: Timestamp;
    creatorId: DocumentReference<any>; // ref to Users collection
    creatorData?: {
        username: string;
        pfp: string;
    };

    submissions: DocumentReference<Recipe>[]; // references to Recipes
    winners: DocumentReference<Recipe>[];     // optional winner recipes
};
