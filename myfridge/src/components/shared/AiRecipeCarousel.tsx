// AiRecipeCarousel.tsx
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
import {RecipeSkeleton} from "@/components/cards";
import { useGenerateAiRecipes } from "@/lib/react-query/queriesAndMutations";





const AiRecipeCarousel = () => {
    const { user } = useUserContext();
    const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasIngredients, setHasIngredients] = useState(true);
    const [ingredients, setIngredients] = useState<string[]>([]);
    const { generateAiRecipes } = useGenerateAiRecipes();

    useEffect(() => {
        let unsubscribe = () => {};
        if (user.myFridge) {
            const fridgeRef =
                typeof user.myFridge === "string"
                    ? doc(database, "Fridges", user.myFridge)
                    : user.myFridge;

            unsubscribe = onSnapshot(fridgeRef, async (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const fridgeIngredients: string[] = data.ingredients || [];
                    setIngredients(fridgeIngredients);
                    if (fridgeIngredients.length === 0) {
                        setHasIngredients(false);
                        setAiRecipes([]);
                    } else {
                        setHasIngredients(true);
                        setLoading(true);
                        try {
                            const generated = await generateAiRecipes(fridgeIngredients);
                            setAiRecipes(generated);
                        } catch (error) {
                            console.error("Error generating AI recipes:", error);
                        } finally {
                            setLoading(false);
                        }
                    }
                } else {
                    setHasIngredients(false);
                    setIngredients([]);
                }
            });
        } else {
            setHasIngredients(false);
        }
        return () => {
            unsubscribe();
        };
    }, [user.myFridge]);

    if (!hasIngredients) {
        return <p>Please add ingredients to your fridge first.</p>;
    }

    if (loading) {
        return (

            <>
                <p>Generating AI recipes...</p>
                <Carousel opts={{ align: "start" }} className="w-full max-w-sm">
                    <CarouselContent>
                        <CarouselItem className="w-full">
                            <RecipeSkeleton/>
                        </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>

            </>
        );
    }

    return (
        <Carousel opts={{ align: "start" }} className="w-full max-w-sm">
            <CarouselContent>
                {aiRecipes.map((recipe) => (
                    <CarouselItem key={recipe.id} className="w-full h-fit">
                        <div className="p-1">
                            <RecipeCard recipe={recipe} />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
};

export default AiRecipeCarousel;
