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

// Helper function: Gets the top image URL for a recipe title using Google Custom Search API.
const getTopImageForRecipe = async (title: string): Promise<string> => {
    const googleApiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
    const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
    if (!googleApiKey || !searchEngineId) {
        console.error("Google API key or search engine ID not found.");
        return "/assets/icons/recipe-placeholder.svg";
    }
    try {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
            title
        )}&searchType=image&key=${googleApiKey}&cx=${searchEngineId}`;
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch from Google Custom Search API");
        }
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].link;
        }
        return "/assets/icons/recipe-placeholder.svg";
    } catch (error) {
        console.error("Error fetching top image for recipe:", error);
        return "/assets/icons/recipe-placeholder.svg";
    }
};

// Function to generate AI recipes via OpenAI's GPT API.
// It returns recipes with title, description, instructions, and (later) mediaUrl.
const generateAiRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OpenAI API key not found.");
    }

    const prompt = `
You are an innovative chef. Generate between 3 and 4 unique recipes that only use the following ingredients: ${ingredients.join(
        ", "
    )}.
For each recipe, provide:
  - A title.
  - A brief description.
  - A list of ingredients (including the ones provided).
  - Cooking time.
  - Prep time.
  - Servings size.
  - Detailed step-by-step instructions.
ONLY return the result, no extra text at the beginning or end of your response.
Return the result as a JSON array where each object has the keys "title", "description", "ingredients", "cookTime", "prepTime", "servings", and "instructions".
  `;

    const payload = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content:
                    "You are a creative and helpful chef who generates innovative recipes.",
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
    let text = data.choices[0].message.content;
    // Sanitize the text by removing markdown code block markers (if present)
    text = text.trim().replace(/^```(json)?\s*/, "").replace(/\s*```$/, "");

    try {
        const recipesData = JSON.parse(text);
        let recipes: Recipe[] = recipesData.map((item: any, index: number) => ({
            id: `ai-${Date.now()}-${index}`,
            title: item.title,
            description: item.description,
            instructions: item.instructions,
            ingredients: item.ingredients,
            prepTime: item.prepTime,
            cookTime: item.cookTime,
            servings: item.servings,
            mediaUrl: "/assets/icons/recipe-placeholder.svg", // initial placeholder
            createdAt: new Date(),
            likes: [],
            username: "AI Chef",
            pfp: "/assets/icons/ai-bot-icon.svg",

            tags: ["AI", "Auto-generated"],
        }));
        // For each generated recipe, fetch the top image from Google and update the mediaUrl.
        recipes = await Promise.all(
            recipes.map(async (recipe) => {
                const imageUrl = await getTopImageForRecipe(recipe.title);
                return { ...recipe, mediaUrl: imageUrl };
            })
        );
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
