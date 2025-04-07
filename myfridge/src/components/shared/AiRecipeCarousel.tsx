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
    // Your API key stored securely in an env variable.
    // const apiKey = import.meta.env.REACT_APP_OPENAI_API_KEY;
    // const apiKey = import.meta.env.MY_OPENAI_API_KEY;
    const apiKey = "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";


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

    // Prepare the payload for the chat completion API.
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
    const text = data.choices[0].message.content;

    // Attempt to parse the JSON string returned by the model.
    try {
        const recipesData = JSON.parse(text);
        // Map the response to your Recipe type, adding default values for required fields.
        const recipes: Recipe[] = recipesData.map((item: any, index: number) => ({
            id: `ai-${Date.now()}-${index}`,
            title: item.title,
            description: item.description,
            instructions: item.instructions, // The generated instructions.
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
