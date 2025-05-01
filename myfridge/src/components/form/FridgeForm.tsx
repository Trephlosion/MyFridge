import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserContext } from "@/context/AuthContext";
import type { DocumentReference } from "firebase/firestore";
import {
    useAddIngredientToFridge,
    useRemoveIngredientFromFridge,
    useGetFridgeById,
} from "@/lib/react-query/queriesAndMutations";

// Schema for form validation
const fridgeSchema = z.object({
    ingredientName: z.string().min(1, "Enter at least 1 character"),
});
type FridgeFormValues = z.infer<typeof fridgeSchema>;

export default function FridgeForm() {
    const { user } = useUserContext();

    // Ensure we have a fridge reference
    const fridgeRef = user?.myFridge as DocumentReference | undefined;
    if (!fridgeRef) return <p>No fridge linked to your account.</p>;

    // Fetch the fridge document directly using the reference
    const { data: fridge, isLoading: fridgeLoading } =
        useGetFridgeById(fridgeRef);

    // Setup mutations
    const addMutation = useAddIngredientToFridge();
    const removeMutation = useRemoveIngredientFromFridge();

    // React-Hook-Form setup
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FridgeFormValues>({
        resolver: zodResolver(fridgeSchema),
    });

    // Add ingredient handler
    const onSubmit = async (values: FridgeFormValues) => {
        await addMutation.mutateAsync({
            fridgeId: fridgeRef.id,
            ingredientName: values.ingredientName,
        });
        reset();
    };

    if (fridgeLoading) return <p>Loading your fridge...</p>;

    return (
        <div className="space-y-4">
            {/* Add Ingredient Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
                <Input placeholder="New ingredient" {...register("ingredientName")} />
                <Button type="submit" disabled={isSubmitting || addMutation.isPending}>
                    Add
                </Button>
            </form>
            {errors.ingredientName && (
                <p className="text-red-600">{errors.ingredientName.message}</p>
            )}
            {addMutation.isError && (
                <p className="text-red-600">Failed to add ingredient.</p>
            )}

            {/* List of Ingredients */}
            <ul className="divide-y">
                {fridge?.ingredients?.map((name) => (
                    <li key={name} className="flex items-center justify-between py-2">
                        <span>{name}</span>
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
                        >
                            Remove
                        </Button>
                    </li>
                ))}
            </ul>
            {removeMutation.isError && (
                <p className="text-red-600">Failed to remove ingredient.</p>
            )}
        </div>
    );
}
