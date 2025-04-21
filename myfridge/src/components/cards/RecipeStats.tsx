// RecipeStats.tsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { checkIsLiked } from "@/lib/utils.ts";
import {
    useLikeRecipe,
    useSaveRecipe,
    useDeleteSavedRecipe,
    useGetCurrentUser,
} from "@/lib/react-query/queriesAndMutations.ts";
import { Recipe } from "@/types";

type RecipeStatsProps = {
    recipe: Recipe;
    userId: string;
};

const RecipeStats = ({ recipe, userId }: RecipeStatsProps) => {
    // If the recipe is an AI recipe, don't render like/save buttons.
    if (Array.isArray(recipe.tags) && recipe.tags.includes("AI")) {
        return null;
    }

    const location = useLocation();

    // Initialize likes list from Firestore
    const [likes, setLikes] = useState<string[]>(recipe.likes || []);
    const [isSaved, setIsSaved] = useState(false);

    // React Query hooks for liking and saving recipes
    const { mutate: likeRecipe } = useLikeRecipe();
    const { mutate: saveRecipe } = useSaveRecipe();
    const { mutate: deleteSaveRecipe } = useDeleteSavedRecipe();
    const { data: currentUser } = useGetCurrentUser();

    // Check if the recipe is already saved
    const savedRecipeRecord = currentUser?.likedRecipes?.find(
        (record: { recipeId: string }) => record.recipeId === recipe.id
    );

    useEffect(() => {
        setIsSaved(!!savedRecipeRecord);
    }, [currentUser, savedRecipeRecord]);

    const handleLikeRecipe = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.stopPropagation();

        let likesArray = [...likes];
        if (likesArray.includes(userId)) {
            // Remove like
            likesArray = likesArray.filter((id) => id !== userId);
        } else {
            // Add like
            likesArray.push(userId);
        }
        setLikes(likesArray);

        // Update likes in Firestore
        likeRecipe({ recipeId: recipe.id, likesArray });
    };

    const handleSaveRecipe = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.stopPropagation();

        if (savedRecipeRecord) {
            // Delete saved recipe
            setIsSaved(false);
            deleteSaveRecipe(savedRecipeRecord.id);
        } else {
            // Save recipe
            saveRecipe({ userId: userId, recipeId: recipe.id });
            setIsSaved(true);
        }
    };

    const containerStyles = location.pathname.startsWith("/profile") ? "w-full" : "";

    return (
        <div className={`flex justify-between items-center z-20 ${containerStyles}`}>
            {/* Likes Section */}
            <div className="flex gap-2 mr-5">
                <img
                    src={`${
                        checkIsLiked(likes, userId)
                            ? "/assets/icons/liked.svg"
                            : "/assets/icons/like.svg"
                    }`}
                    alt="like"
                    width={20}
                    height={20}
                    onClick={(e) => handleLikeRecipe(e)}
                    className="cursor-pointer"
                />
                <p className="small-medium lg:base-medium">{likes.length}</p>
            </div>

            {/* Save Section */}
            <div className="flex gap-2">
                <img
                    src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
                    alt="save"
                    width={20}
                    height={20}
                    className="cursor-pointer"
                    onClick={(e) => handleSaveRecipe(e)}
                />
            </div>
        </div>
    );
};

export default RecipeStats;
