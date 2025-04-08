import {z} from "zod"

export const SignupValidation = z.object({
    username: z.string().min(2, {message:'Too short'}).max(50, {message:'Too long'}),
    email: z.string().email(),
    password: z.string().min(6, {message: 'Too short'}),
})

export const SigninValidation = z.object({
    email: z.string().email(),
    password: z.string().min(6, {message: 'Too short'}),
})

export const RecipeValidation = z.object({
    title: z.string()
        .nonempty({ message: "Title is required." })
        .max(100, { message: 'Too long' }),
    description: z.string()
        .nonempty({ message: "Description is required." })
        .min(2, { message: 'Too short' })
        .max(2200, { message: 'Too long' }),
    instructions: z.string()
        .nonempty({ message: "Instructions are required." })
        .min(2, { message: 'Too short' })
        .max(2200, { message: 'Too long' }),
    ingredients: z.string()
        .nonempty({ message: "Ingredients are required." })
        .min(2, { message: 'Too short' })
        .max(2200, { message: 'Too long' }),
    cookTime: z.string()
        .nonempty({ message: "Required Field" })
        .min(1, { message: "Cook time must be at least 1." }),
    prepTime: z.string()
        .nonempty({ message: "Required Field" })
        .min(1, { message: "Prep time must be at least 1." }),
    servings: z.string()
        .nonempty({ message: "Required Field" })
        .min(1, { message: "Serving size must be at least 1." }),
    tags: z.string()
        .nonempty({ message: 'Tags are required.' }),
    file: z.custom<File[]>(),
});

export const ProfileValidation = z.object({
    username: z.string().nonempty({message: 'Username is required'}).min(2, { message: "Name must be at least 2 characters." }),
    bio: z.string(),
});

export const FridgeValidation = z.object({
   ingredient_name: z.string().nonempty({message: 'Ingredient name is required'}),

});

export const ShoppingListValidation = z.object({
    ingredient_name: z.string().nonempty({message: 'Ingredient name is required'}),

});
