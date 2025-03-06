import {z} from "zod"

export const SignupValidation = z.object({
    first_name: z.string().min(2,{message: 'Too short'}),
    last_name: z.string().min(2, {message: 'Too short'}),
    username: z.string().min(2, {message:'Too short'}).max(50, {message:'Too long'}),
    email: z.string().email(),
    password: z.string().min(6, {message: 'Too short'}),
})

export const SigninValidation = z.object({
    email: z.string().email(),
    password: z.string().min(6, {message: 'Too short'}),
})

export const RecipeValidation = z.object({

        /*items: z.array(z.string()).refine((value) => value.some((item) => item), {
            message: "You have to select at least one ingredient.",
        }),*/
        dish: z.string()
            .nonempty({
            message: "Dish name is required.",
        })
            .max(100 , {message: 'Too long'}),
        description: z.string()
            .nonempty({
            message: "Description is required.",
        })
            .min(2,{message:'Too short'})
            .max(2200, {message: 'Too long'}),
        instructions: z.string()
            .nonempty({
            message: "Instructions are required.",
        })
            .min(2,{message:'Too short'})
            .max(2200, {message: 'Too long'}),
        cookTime: z.string()
            .nonempty({
                message:"Required Field"
                })
            .min(1, {
            message: "Cook time must be at least 1.",
        }),
        prepTime: z.string()
            .nonempty({
                message:"Required Field"
                })
            .min(1, {
                message: "Prep time must be at least 1.",
            }),
        serving: z.string()
            .nonempty({
                message:"Required Field"
                })
            .min(1, {
                message: "Serving size must be at least 1.",
            }),
        tags: z.string()
            .nonempty({
                message: 'Tags are required.'
            }),
    file: z.custom<File[]>()
})

export const ProfileValidation = z.object({
    file: z.custom<File[]>(),
    last_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    first_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    username: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email(),
    bio: z.string(),
});
