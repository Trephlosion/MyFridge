export enum QUERY_KEYS{
    // AUTH KEYS
    CREATE_USER_ACCOUNT = "createUserAccount",

    // USER KEYS
    GET_CURRENT_USER = "getCurrentUser",
    GET_USERS = "getUsers",
    GET_USER_BY_ID = "getUserById",

    // RECIPE KEYS
    GET_RECIPES = "getRecipes",
    GET_INFINITE_RECIPES = "getInfiniteRecipes",
    GET_RECENT_RECIPES = "getRecentRecipes",
    GET_RECIPE_BY_ID = "getRecipeById",
    GET_USER_RECIPES = "getUserRecipes",
    GET_FILE_PREVIEW = "getFilePreview",

    //  SEARCH KEYS
    SEARCH_RECIPES = "getSearchRecipes",

    // FRIDGE KEYS
    GET_ALL_FRIDGE_INGREDIENTS = "getAllFridgeIngredients",
    GET_FRIDGE_ID_BY_USER = "getFridgeIDByUser",
    // INGREDIENT KEYS

    GET_ALL_INGREDIENTS = "getAllIngredients",
    GET_INGREDIENT_BY_NAME = "getIngredientByName",
    GET_INGREDIENT_BY_ID = "getIngredientById",
    GET_INGREDIENTS_BY_USER = "getIngredientsByUser",
    GET_INGREDIENTS_BY_RECIPE = "getIngredientsByRecipe",
    GET_INGREDIENTS_BY_FRIDGE = "getIngredientsByFridge",

}
