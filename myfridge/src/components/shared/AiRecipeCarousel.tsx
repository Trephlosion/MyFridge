// AiRecipeCarousel.tsx
import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useUserContext } from "@/context/AuthContext";
import { Carousel } from "@/components/ui/carousel";
import RecipeCard from "@/components/cards/RecipeCard";
import { database } from "@/lib/firebase/config";
import { Recipe } from "@/types";
import Loader from "@/components/shared/Loader.tsx";
import {RecipeSkeleton} from "@/components/cards";

// This function calls OpenAI's GPT API to generate recipes using the provided ingredients.
// IMPORTANT: In a real application, do not expose your API key on the client.
// Instead, implement this call on your backend and proxy the request securely.
const generateAiRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY; // Use Vite's env variables
    if (!apiKey) {
        throw new Error("OpenAI API key not found.");
    }

    // Construct a prompt that instructs the AI to generate recipes.
    const prompt = `
You are an innovative chef. Generate between 3 and 5 unique recipes that only use the following ingredients: ${ingredients.join(
        ", "
    )}.
For each recipe, provide:
  - A title.
  - A brief description.
  - Step-by-step instructions.
Return the result as a JSON array where each object has the keys "title", "description", and "instructions".
  `;

    const payload = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You are a creative and helpful chef who generates innovative recipes.",
            },
            { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API call failed: ${errorText}`);
    }

    const data = await response.json();
    // The API returns the generated content in data.choices[0].message.content.
    let text = data.choices[0].message.content;

    // Sanitize the text: remove markdown code block markers if present.
    text = text.trim().replace(/^```(json)?\s*/, "").replace(/\s*```$/, "");

    try {
        const recipesData = JSON.parse(text);
        const recipes: Recipe[] = recipesData.map((item: any, index: number) => ({
            id: `ai-${Date.now()}-${index}`,
            title: item.title,
            description: item.description,
            instructions: item.instructions,
            mediaUrl: "/assets/icons/recipe-placeholder.svg",
            createdAt: new Date(),
            likes: [],
            author: {
                id: "ai",
                username: "AI Chef",
            },
            tags: ["AI", "Auto-generated"],
        }));
        return recipes;
    } catch (error) {
        console.error("Failed to parse OpenAI response:", error);
        throw new Error("Failed to parse OpenAI response.");
    }
};

const AiRecipeCarousel = () => {
    const { user } = useUserContext();
    const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasIngredients, setHasIngredients] = useState(true);
    const [ingredients, setIngredients] = useState<string[]>([]);

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
        return(
            <>
            <p>Generating AI recipes...</p>
            <RecipeSkeleton/>
            </>
        );
    }

    return (
        <Carousel>
            {aiRecipes.map((recipe) => (
                <div key={recipe.id}>
                    <RecipeCard recipe={recipe} />
                </div>
            ))}
        </Carousel>
    );
};

export default AiRecipeCarousel;
