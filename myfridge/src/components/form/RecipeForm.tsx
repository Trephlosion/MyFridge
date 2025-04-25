import {useLocation, useNavigate, useParams} from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea.tsx";
import FileUploader from "@/components/shared/FileUploader.tsx";
import { RecipeValidation } from "@/lib/validation";
import {
    useCreateRecipe,

    useDeleteRecipe,
    useGetRecipeById
} from "@/lib/react-query/queriesAndMutations.ts";
import { useUserContext } from "@/context/AuthContext.tsx";
import { useToast } from "@/hooks/use-toast.ts";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {firebaseConfig} from "@/lib/firebase/config.ts";
import {useState} from "react";
import {Loader} from "@/components/shared";


type RecipeFormProps = {
    recipe?: {
        id?: string;
        title: string;            // Changed from dish
        description: string;
        instructions: string[];   // Stored as an array in Firestore
        ingredients: string[];    // Changed from ingredients
        cookTime: number;
        prepTime: number;
        servings: number;         // Changed from serving
        mediaUrl: string;         // Changed from imageUrl in the old form
        tags: string[];
    }
};

import { Recipe } from "@/types";

const RecipeForm = ({ recipe }: RecipeFormProps  ) => {
    const { id: routeId } = useParams();

    const { mutateAsync: createRecipe, isPending: isLoadingCreate } = useCreateRecipe();

    const { user } = useUserContext();
    const { toast } = useToast();
    const navigate = useNavigate();


    const { mutateAsync: deleteRecipeMutation } = useDeleteRecipe();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        console.log("handleDelete fired");
        console.log("check recipe", recipe);
        console.log("check routeId", routeId);
        if (!recipe && !routeId) return;


        const recipeId = recipe?.id || routeId;

        console.log("recipeId", recipeId);

        let mediaId: string | undefined = undefined;

        console.log("recipe?.mediaUrl", recipe?.mediaUrl);

        if (recipe?.mediaUrl) {
            try {
                const urlParts = recipe.mediaUrl.split("/o/");
                const pathEncoded = urlParts[1]?.split("?")[0];
                mediaId = decodeURIComponent(pathEncoded);
            } catch (err) {
                console.warn("⚠️ Failed to extract media path:", err);
            }
        }

        setIsDeleting(true);
        console.log("delete starting");
        console.log("Entering try catch");
        try {

            console.log("Trying to delete:", recipe, recipeId, mediaId,);
            await deleteRecipeMutation({
                id: recipeId,
                mediaUrl: recipe?.mediaUrl,
            } as any); // If you're enforcing type safety strictly, define a wrapper Recipe type here

            toast({
                title: "Recipe Deleted",
                description: "Recipe and associated content were successfully deleted.",
            });

            navigate("/");
        } catch (error) {
            console.error("Delete failed:", error);
            toast({
                title: "Deletion Failed",
                description: "Something went wrong while deleting the recipe.",
            });
        } finally {
            setIsDeleting(false);
        }
    };


    const form = useForm<z.infer<typeof RecipeValidation>>({
        resolver: zodResolver(RecipeValidation),
        defaultValues: {
            title: recipe ? recipe.title : "",
            description: recipe ? recipe.description : "",
            // Join instructions array into a string for the textarea
            instructions: recipe ? recipe.instructions.join('\n') : "",
            ingredients: recipe ? recipe.ingredients.join(',') : "",
            cookTime: recipe ? recipe.cookTime : 0,
            prepTime: recipe ? recipe.prepTime : 0,
            servings: recipe ? recipe.servings : 0,
            file: [],
            tags: recipe ? recipe.tags.join(',') : '',
        },
    });

    async function onSubmit(values: z.infer<typeof RecipeValidation>) {
        // If you need to store instructions as an array, split them here
        const recipe = await createRecipe({
            ...values,
            author: user.id,
            // Convert comma separated tags to array and instructions to an array (split on newline)
            tags: values.tags.split(',').map(tag => tag.trim()),
            instructions: values.instructions.split('\n').map(step => step.trim()),
            ingredients: values.ingredients.split(',').map(ingredient => ingredient.trim()),
            updatedAt: new Date(),
            createdAt:  new Date(),
        });
        if (!recipe) {
            toast({
                title: "Recipe Creation Failed",
                description: "Please try again",
                duration: 5000,
            });
        }
        console.log(values);
        navigate('/');
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Recipe Title</FormLabel>
                            <FormControl>
                                <Input type="text" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form-label">Recipe Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Put a recipe description" {...field} className="shad-textarea custom-scrollbar" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form-label">
                                Recipe Instructions (each step on a new line)
                            </FormLabel>
                            <FormControl>
                                <Textarea placeholder="Write the recipe instructions here" {...field} className="shad-textarea custom-scrollbar" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="ingredients"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form-label">
                                Recipe Ingredients (separated by commas ",")
                            </FormLabel>
                            <FormControl>
                                <Textarea placeholder="Write the recipe ingredients here" {...field} className="shad-textarea custom-scrollbar" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="cookTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cook Time in minutes</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Enter the cook time in minutes" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="prepTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prep Time in minutes</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Enter the prep time in minutes" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="servings"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Serving Size – serves _ people</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Enter the average serving size" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form-label">Add Photos or Videos of Your Dish</FormLabel>
                            <FormControl>
                                <FileUploader fieldChange={field.onChange} mediaUrl={recipe?.mediaUrl} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ingredient Tags (separated by commas ",")</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Carrot, Cake, Meat" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4 items-center justify-end">
                    <Button type="submit" className="shad-button_primary whitespace-nowrap" disabled={isLoadingCreate}>
                        {isLoadingCreate ? "Submitting..." : "Submit"}
                    </Button>
                    <Button type="button" className="shad-button_dark_4">Cancel</Button>

                    {recipe! && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" className="bg-red text-white" disabled={isDeleting}>
                                    {isDeleting ? <Loader /> : "Delete"}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will delete your recipe, media, ratings, and comments permanently.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className={"bg-red text-white"}>
                                        {isDeleting ? <Loader /> : "Delete Recipe"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </form>
        </Form>
    );
};

export default RecipeForm;
