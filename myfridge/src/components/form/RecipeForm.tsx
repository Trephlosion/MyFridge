import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea.tsx";
import FileUploader from "@/components/shared/FileUploader.tsx";
import { RecipeValidation } from "@/lib/validation";
import { useCreateRecipe } from "@/lib/react-query/queriesAndMutations.ts";
import { useUserContext } from "@/context/AuthContext.tsx";
import { useToast } from "@/hooks/use-toast.ts";

type RecipeFormProps = {
    recipe?: {
        id?: string;
        dish: string;
        description: string;
        instructions: string;
        cookTime: number;
        prepTime: number;
        serving: number;
        imageUrl: string;
        tags: string[];
    }
}

const RecipeForm = ({ recipe }: RecipeFormProps) => {
    const { mutateAsync: createRecipe, isPending: isLoadingCreate } = useCreateRecipe();
    const { user } = useUserContext();
    const { toast } = useToast();
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof RecipeValidation>>({
        resolver: zodResolver(RecipeValidation),
        defaultValues: {
            dish: recipe ? recipe?.dish : "",
            description: recipe ? recipe?.description : "",
            instructions: recipe ? recipe?.instructions : "",
            cookTime: recipe ? recipe?.cookTime.toString() : "0",
            prepTime: recipe ? recipe?.prepTime.toString() : "0",
            serving: recipe ? recipe?.serving.toString() : "0",
            file: [],
            tags: recipe ? recipe?.tags.join(',') : '',
        },
    })

    async function onSubmit(values: z.infer<typeof RecipeValidation>) {
        const newRecipe = await createRecipe({
            ...values,
            userId: user.id,
            tags: values.tags.split(',').map(tag => tag.trim()),
        })

        if (!newRecipe) {
            toast({
                title: "Recipe Creation Failed",
                description: "Please try again",
                duration: 5000,
            })
        }

        console.log(values)
        navigate('/');
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
                <FormField
                    control={form.control}
                    name="dish"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dish Name</FormLabel>
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
                            <FormLabel className={"shad-form-label"}>Recipe Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Put a recipe Description" {...field} className={"shad-textarea custom-scrollbar"} />
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
                            <FormLabel className={"shad-form-label"}>Recipe Instructions</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Write the recipe Instructions in here" {...field} className={"shad-textarea custom-scrollbar"} />
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
                                <Input type="text" placeholder="Enter the cook time in minutes" className="shad-input" {...field} />
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
                                <Input type="text" placeholder="Enter the prep time in minutes" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="serving"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Serving Size - serves _ people</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter the average serving size" className="shad-input" {...field} />
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
                            <FormLabel className={"shad-form-label"}>Add Photos or Videos Of Your Dish</FormLabel>
                            <FormControl>
                                <FileUploader
                                    fieldChange={field.onChange}
                                    mediaUrl={recipe?.imageUrl}
                                />
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
                            <FormLabel>Ingredient Tags (separated by comma ",")</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Carrot, Cake, Meat" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className={"flex gap-4 items-center justify-end"}>
                    <Button type="submit" className={"shad-button_primary whitespace-nowrap"}>Submit</Button>
                    <Button type={"button"} className={"shad-button_dark_4"}>Cancel</Button>
                </div>
            </form>
        </Form>
    )
}
export default RecipeForm
