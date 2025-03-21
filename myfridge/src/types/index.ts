
export type ExpandedUser = {
    id: string; // User's unique identifier
    username: string; // Username
    email: string; // Email address
    pfp: string; // Profile picture URL
    bio: string; // Bio of the user

    isPrivate: boolean; // Privacy setting
    isVerified: boolean; // Verification status
    isAdministrator: boolean; // Admin status

    followers: string[]; // Array of follower IDs
    following: string[]; // Array of following IDs
    likedRecipes:  string[]; // Array of liked recipe IDs

    recipes: string[]; // Array of uploaded recipe IDs
    posts: string[]; // Array of uploaded post IDs
    comments: string[]; // Array of comment IDs

    myFridge: string; // Fridge ID

    createdAt: Date; // Date created
    updatedAt: Date; // Date updated
}


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
export type IUpdateUser = {
    id: string; // User's unique identifier
    username: string; // Username
    email: string; // Email address
    pfp: string; // Profile picture URL
    bio: string; // Bio of the user

    isPrivate: boolean; // Privacy setting
    isVerified: boolean; // Verification status
    isAdministrator: boolean; // Admin status

    followers: string[]; // Array of follower IDs
    following: string[]; // Array of following IDs
    likedRecipes:  string[]; // Array of liked recipe IDs

    recipes: string[]; // Array of uploaded recipe IDs
    posts: string[]; // Array of uploaded post IDs
    comments: string[]; // Array of comment IDs

    myFridge: string; // Fridge ID

    createdAt: Date; // Date created
    updatedAt: Date; // Date updated

    file: File[]; // Array of File objects
};

// User Type
export type IUser = {
    id: string; // User's unique identifier
    username: string; // Username
    email: string; // Email address
    pfp: string; // Profile picture URL
    bio: string; // Bio of the user

    isPrivate: boolean; // Privacy setting
    isVerified: boolean; // Verification status
    isAdministrator: boolean; // Admin status

    followers: string[]; // Array of follower IDs
    following: string[]; // Array of following IDs
    likedRecipes:  string[]; // Array of liked recipe IDs

    recipes: string[]; // Array of uploaded recipe IDs
    posts: string[]; // Array of uploaded post IDs
    comments: string[]; // Array of comment IDs

    myFridge: string; // Fridge ID

    createdAt: Date; // Date created
    updatedAt: Date; // Date updated
};

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
    id: string; // Firestore document ID
    title: string; // Recipe title (formerly "dish")
    description?: string;
    cookTime?: string;
    prepTime?: string;
    servings?: number;
    createdAt?: Date;
    updatedAt?: Date;
    mediaUrl: string; // Image URL (formerly "pfp")
    userId: string;
    tags?: string[];
    instructions: string[]; // Array of instruction steps
    likes: string[]; // Array of user IDs who liked the recipe
    comments: string[]; // Array of comment IDs
};

export interface IRecipeMetadata {
    id: string; // Firestore document ID
    title: string;
    description: string;
    cookTime: string;
    prepTime: string;
    servings?: number;
    createdAt?: Date;
    updatedAt?: Date;
    tags?: string[];
    instructions: string[]; // Array of instructions
    mediaUrl?: string; // Updated from "imageUrl" or "pfp"
    userId?: string;
    likes?: string[];
    comments?: string[];
    file?: File[];
}

// New Recipe Post Type
export type INewRecipe = {
    userId: string;
    file: File[]; // Array of uploaded files
    title: string; // Changed from "dish" to "title"
    description: string;
    instructions: string; // Accept a single string (to be split into an array)
    cookTime: string;
    prepTime: string;
    servings: string; // Changed from "serving" to "servings"
    tags: string[];
};

// Update Recipe Type
export type IUpdateRecipe = {
    postId: string;
    mediaUrl: string; // Updated field name (formerly "imageUrl" or "pfp")
    mediaId: string;  // Added storage path (formerly "pfpId")
    file: File[]; // Array of uploaded files
    title: string; // Changed from "dish" to "title"
    description: string;
    instructions: string; // Accept a single string (to be split into an array)
    cookTime: string;
    prepTime: string;
    servings: string; // Changed from "serving" to "servings"
    tags: string[];
    recipeId: string;
};
