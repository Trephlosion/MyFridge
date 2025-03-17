import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

type RecipeFormProps = {
    onSubmit: (data: any) => void;
};

const RecipeForm = ({ onSubmit }: RecipeFormProps) => {
    const form = useForm<z.infer<typeof RecipeValidation>>({
        resolver: zodResolver(RecipeValidation),
        defaultValues: {
            dish: "",
            description: "",
            instructions: "",
            cookTime: "0",
            prepTime: "0",
            serving: "0",
            file: [],
            tags: "",
        },
    });

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
                            <FormLabel>Recipe Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Put a recipe Description" {...field} className="shad-textarea custom-scrollbar" />
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
                            <FormLabel>Recipe Instructions</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Write the recipe Instructions here" {...field} className="shad-textarea custom-scrollbar" />
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
                            <FormLabel>Cook Time (minutes)</FormLabel>
                            <FormControl>
                                <Input type="text" className="shad-input" {...field} />
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
                            <FormLabel>Prep Time (minutes)</FormLabel>
                            <FormControl>
                                <Input type="text" className="shad-input" {...field} />
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
                            <FormLabel>Serving Size</FormLabel>
                            <FormControl>
                                <Input type="text" className="shad-input" {...field} />
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
                            <FormLabel>Upload Dish Image</FormLabel>
                            <FormControl>
                                <FileUploader fieldChange={field.onChange} />
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
                            <FormLabel>Tags (separate with commas)</FormLabel>
                            <FormControl>
                                <Input type="text" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-4 items-center justify-end">
                    <Button type="submit" className="shad-button_primary">Submit</Button>
                </div>
            </form>
        </Form>
    );
};

export default RecipeForm;

