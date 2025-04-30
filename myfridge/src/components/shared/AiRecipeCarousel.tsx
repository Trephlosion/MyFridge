import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useUserContext } from "@/context/AuthContext";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";
import RecipeCard from "@/components/cards/RecipeCard";
import { database } from "@/lib/firebase/config";
import { Recipe } from "@/types";
import { RecipeSkeleton } from "@/components/cards";
import { useGenerateAiRecipes } from "@/lib/react-query/queriesAndMutations";
import { Button } from "@/components/ui/button";

const AiRecipeCarousel: React.FC = () => {
    const { user } = useUserContext();
    const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasIngredients, setHasIngredients] = useState(true);
    const [ingredients, setIngredients] = useState<string[]>([]);
    const generateAiRecipesMutation = useGenerateAiRecipes();

    const generateRecipes = async (ing: string[]) => {
        setLoading(true);
        try {
            const generated = await generateAiRecipesMutation.mutateAsync(ing);
            setAiRecipes(generated);
        } catch (error) {
            console.error("Error generating AI recipes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let unsubscribe = () => {};
        if (user.myFridge) {
            const fridgeRef =
                typeof user.myFridge === "string"
                    ? doc(database, "Fridges", user.myFridge)
                    : user.myFridge;

            unsubscribe = onSnapshot(fridgeRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const fridgeIngredients: string[] = data.ingredients || [];
                    setIngredients(fridgeIngredients);
                    if (fridgeIngredients.length === 0) {
                        setHasIngredients(false);
                        setAiRecipes([]);
                    } else {
                        setHasIngredients(true);
                        generateRecipes(fridgeIngredients);
                    }
                } else {
                    setHasIngredients(false);
                }
            });
        } else {
            setHasIngredients(false);
        }
        return () => unsubscribe();
    }, [user.myFridge]);

    if (!hasIngredients) {
        return <p className="text-center mt-4">Please add ingredients to your fridge first.</p>;
    }

    return (
        <div className="w-full mx-auto">
            {loading ? (
                <>
                    <p className="text-center mb-4">Generating AI recipes...</p>
                    <Carousel opts={{ align: "start" }} className="w-full">
                        <CarouselContent className="grid grid-cols-3 gap-4">
                            <CarouselItem className="w-full">
                                <RecipeSkeleton />
                            </CarouselItem>
                            <CarouselItem className="w-full">
                                <RecipeSkeleton />
                            </CarouselItem>
                            <CarouselItem className="w-full">
                                <RecipeSkeleton />
                            </CarouselItem>
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </>
            ) : (
                <Carousel opts={{ align: "start" }} className="w-full">
                    <CarouselContent className="grid grid-cols-3 gap-4">
                        {aiRecipes.map((recipe) => (
                            <CarouselItem key={recipe.id} className="w-full p-1">
                                <RecipeCard recipe={recipe} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            )}

            <div className="flex justify-center mt-4">
                <Button
                    onClick={() => generateRecipes(ingredients)}
                    disabled={loading || ingredients.length === 0}
                    className={"bg-primary-500 hover:bg-primary-600 text-white"}
                >
                    Generate New Recipes
                </Button>
            </div>
        </div>
    );
};

export default AiRecipeCarousel;
