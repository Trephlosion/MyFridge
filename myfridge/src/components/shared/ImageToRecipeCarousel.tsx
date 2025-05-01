import React, { useState } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";
import RecipeCard from "@/components/cards/RecipeCard";
import RecipeSkeleton from "@/components/cards/RecipeSkeleton";
import FileUploader from "@/components/shared/FileUploader";
import { useGenerateImageAiRecipes } from "@/lib/react-query/queriesAndMutations";
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";

const COOLDOWN_MS = 60_000;

const ImageToRecipeCarousel: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastRun, setLastRun] = useState<number>(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const mutation = useGenerateImageAiRecipes();

    const handleFileChange = (accepted: File[]) => {
        setFiles(accepted);
        setRecipes([]);
        setErrorMsg(null);
    };

    const handleGenerate = async () => {
        const now = Date.now();
        // Cooldown check
        if (now - lastRun < COOLDOWN_MS) {
            const remaining = Math.ceil((COOLDOWN_MS - (now - lastRun)) / 1000);
            setErrorMsg(`Please wait ${remaining}s before retrying.`);
            return;
        }

        if (files.length === 0) {
            setErrorMsg("Please upload an image first.");
            return;
        }

        setLastRun(now);
        setLoading(true);
        setErrorMsg(null);

        try {
            const data = await mutation.mutateAsync(files);
            setRecipes(data);
        } catch (err: any) {
            console.error("Image → AI recipes failed", err);
            // Detect rate-limit from our API helper
            if (err.message.toLowerCase().includes("rate limit")) {
                setErrorMsg("Rate limit exceeded. Try again later.");
            } else {
                setErrorMsg("Failed to generate recipes. Please try again.");
            }
        } finally {
            setLoading(false);
            setFiles([]); // discard the image
        }
    };

    return (
        <div className="w-full mx-auto">
            <FileUploader fieldChange={handleFileChange} />

            <div className="flex justify-center mt-4">
                <Button
                    onClick={handleGenerate}
                    disabled={loading || files.length === 0 || Date.now() - lastRun < COOLDOWN_MS}
                >
                    {loading
                        ? "Generating…"
                        : Date.now() - lastRun < COOLDOWN_MS
                            ? `Wait ${Math.ceil((COOLDOWN_MS - (Date.now() - lastRun)) / 1000)}s`
                            : "Generate Recipes from Image"}
                </Button>
            </div>

            {errorMsg && (
                <p className="text-center text-red-500 mt-2">{errorMsg}</p>
            )}

            {loading && (
                <>
                    <p className="text-center mb-4">Analyzing image…</p>
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
            )}

            {!loading && recipes.length > 0 && (
                <Carousel opts={{ align: "start" }} className="w-full mt-6">
                    <CarouselContent className="grid grid-cols-3 gap-4">
                        {recipes.map((r) => (
                            <CarouselItem key={r.id} className="w-full p-1">
                                <RecipeCard recipe={r} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            )}
        </div>
    );
};

export default ImageToRecipeCarousel;
