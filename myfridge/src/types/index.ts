
export type ExpandedUser = {
    id: string; // User's unique identifier
    first_name: string; // First name
    last_name: string; // Last name
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

    myFridge: {
        ingredientId: string | null; // Ingredient ID
    }[];
    pfpid: string; // Profile picture ID
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
    first_name: string; // First name
    last_name: string; // Last name
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

    myFridge: {
        ingredientId: string | null; // Ingredient ID
    }[];
    pfpid: string; // Profile picture ID
    file: File[]; // Array of File objects
};

// New Post Type
export type INewRecipe = {
    userId: string;
    file: File[]; // Array of uploaded files
    dish: string;
    description: string;
    instructions: string;
    cookTime: string;
    prepTime: string;
    serving:  string;
    tags: string[];

};

// Update Post Type
export type IUpdateRecipe = {
    postId: string;
    imageId: string;
    imageUrl: string; // URL with a string fallback
    file: File[]; // Array of uploaded files
    dish: string;
    description: string;
    instructions: string;
    cookTime: string;
    prepTime: string;
    serving:  string;
    tags: string[];
    recipeId: string;
};

// User Type
export type IUser = {
    id: string; // User's unique identifier
    first_name: string; // First name
    last_name: string; // Last name
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

    myFridge: {
        ingredientId: string | null; // Ingredient ID
    }[];
    pfpid: string; // Profile picture ID
};

// New User Interface
export interface INewUser {
    email: string; // Required email address
    password: string; // Password
    first_name: string; // Optional full name
    last_name: string; // Optional full name
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
    dish: string; // Title of the recipe
    description?: string; // Optional description
    cookTime?: string; // Cooking time
    prepTime?: string; // Preparation time
    servings?: number; // Number of servings
    createdAt?: Date; // Date created
    pfpId: string; // Optional image URL
    userId: string; //
    tags?: string[]; // Array of tags
    instructions: string; // Recipe instructions
    imageId: string; // Profile picture ID
    likes: string[]; // Array of user IDs who liked the recipe
    comments: string[]; // Array of comment IDs



};



export interface IRecipeMetadata {
    id: string; // Firestore document ID
    dish: string;
    description: string;
    cookTime: string;
    prepTime: string;
    servings?: number;
    createdAt?: Date;
    updatedAt?: Date;
    tags?: string[];
    instructions: string;
    imageUrl?: string;
    userId?: string;
    likes?: string[];
    comments?: string[];
    file?: File[];
}
