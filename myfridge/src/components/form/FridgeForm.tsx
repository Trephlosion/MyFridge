"use client"

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { useUserContext } from "@/context/AuthContext";
import type { DocumentReference } from "firebase/firestore";
import {
    useGetFridgeById,
    useAddIngredientToFridge,
    useRemoveIngredientFromFridge,
} from "@/lib/react-query/queriesAndMutations";

// validation schema
const fridgeSchema = z.object({
    ingredientName: z.string().min(1, "Enter at least 1 character"),
});
type FridgeFormValues = z.infer<typeof fridgeSchema>;

// Google Custom Search API config (set in .env)
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
const GOOGLE_CSE_ID = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

async function fetchIngredientImage(query: string): Promise<string | null> {
    try {
        const res = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&searchType=image&q=${encodeURIComponent(
                query
            )}&num=1`
        );
        const data = await res.json();
        return data.items?.[0]?.link ?? null;
    } catch {
        return null;
    }
}

export default function FridgeForm() {
    const { user } = useUserContext();
    const fridgeRef = user?.myFridge as DocumentReference | undefined;
    if (!fridgeRef) return <p>No fridge linked to your account.</p>;

    const {
        data: fridge,
        isLoading: fridgeLoading,
        isError: fridgeError,
    } = useGetFridgeById(fridgeRef);

    const addMutation = useAddIngredientToFridge();
    const removeMutation = useRemoveIngredientFromFridge();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FridgeFormValues>({
        resolver: zodResolver(fridgeSchema),
    });

    // image state
    const [images, setImages] = React.useState<Record<string, string | null>>({});
    const [loadingImages, setLoadingImages] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        fridge?.ingredients.forEach((name) => {
            if (images[name] !== undefined) return;
            setLoadingImages((prev) => ({ ...prev, [name]: true }));
            fetchIngredientImage(name)
                .then((url) => setImages((prev) => ({ ...prev, [name]: url })))
                .finally(() => setLoadingImages((prev) => ({ ...prev, [name]: false })));
        });
    }, [fridge?.ingredients]);

    if (fridgeLoading) return <p>Loading your fridge…</p>;
    if (fridgeError) return <p className="text-red-600">Failed to load fridge.</p>;

    const onSubmit = async (values: FridgeFormValues) => {
        await addMutation.mutateAsync({
            fridgeId: fridgeRef.id,
            ingredientName: values.ingredientName,
        });
        reset();
    };

    return (
        <div className="space-y-6">
            {/* Add form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
                <Input className={"bg-dark-2 rounded"} placeholder="New ingredient" {...register("ingredientName")} />
                <Button type="submit" disabled={isSubmitting || addMutation.isPending} className={"bg-green-500 hover:bg-green-600 transition-all rounded"}>
                    Add
                </Button>
            </form>
            {errors.ingredientName && (
                <p className="text-red-600">{errors.ingredientName.message}</p>
            )}

            {/* Ingredient Cards */}
            <div className="space-y-4">
                {fridge.ingredients.map((name) => (
                    <Card key={name} className="recipe-card w-full">
                        <CardHeader>
                            <CardTitle>{name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingImages[name] ? (
                                <p>Loading image…</p>
                            ) : images[name] ? (
                                <img
                                    src={images[name] as string}
                                    alt={name}
                                    className="w-full h-1/3 h-max-[200px] object-cover rounded-md"
                                />
                            ) : (
                                <p>No image found.</p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                    removeMutation.mutate({
                                        fridgeId: fridgeRef.id,
                                        ingredientName: name,
                                    })
                                }
                                disabled={removeMutation.isPending}
                                className={"hover:bg-red transition-all rounded"}
                            >
                                Remove
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {(addMutation.isError || removeMutation.isError) && (
                <p className="text-red-600">An error occurred. Please try again.</p>
            )}
        </div>
    );
}
