// RecipeStats.tsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    useLikeRecipe,
    useUnlikeRecipe,
    useGetCurrentUser,
} from "@/lib/react-query/queriesAndMutations";
import { Recipe } from "@/types";

type RecipeStatsProps = {
    recipe: Recipe;
    userId: string;
};

export default function RecipeStats({ recipe, userId }: RecipeStatsProps) {
    // AI recipes don’t get like buttons
    if (Array.isArray(recipe.tags) && recipe.tags.includes("AI")) {
        return null;
    }

    const location = useLocation();
    const { data: currentUser } = useGetCurrentUser();
    const { mutate: like }   = useLikeRecipe();
    const { mutate: unlike } = useUnlikeRecipe();

    // Local UI state
    const [isLiked, setIsLiked]       = useState(false);
    const [likesCount, setLikesCount] = useState(
        // if `recipe.likes` is loaded, use its length, otherwise fallback to 0
        Array.isArray(recipe.likes)
            ? recipe.likes.length
            : 0
    );

    // On mount (or whenever recipe.likes or currentUser.likedRecipes changes),
    // figure out whether this user has already liked it.
    useEffect(() => {
        let liked = false;

        if (Array.isArray(recipe.likes)) {
            // if the recipe came with a `likes: (string|DocumentReference)[]`
            const ids = recipe.likes.map((l) =>
                typeof l === "string" ? l : l.id
            );
            liked = ids.includes(userId);
        } else if (Array.isArray(currentUser?.likedRecipes)) {
            // otherwise fall back to the user's own list
            liked = currentUser.likedRecipes.includes(recipe.id);
        }

        setIsLiked(liked);
    }, [recipe.likes, currentUser?.likedRecipes, recipe.id, userId]);

    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isLiked) {
            // optimistic UI
            setIsLiked(false);
            setLikesCount((c) => c - 1);
            unlike({ recipeId: recipe.id, userId });
        } else {
            setIsLiked(true);
            setLikesCount((c) => c + 1);
            like({ recipeId: recipe.id, userId });
        }
    };

    const containerStyles = location.pathname.startsWith("/profile")
        ? "w-full"
        : "";

    return (
        <div className={`flex justify-between items-center z-20 ${containerStyles}`}>
            <div className="flex gap-2 mr-5">
                <img
                    src={
                        isLiked
                            ? "/assets/icons/liked.svg"
                            : "/assets/icons/like.svg"
                    }
                    alt="like"
                    width={20}
                    height={20}
                    onClick={handleLikeClick}
                    className="cursor-pointer"
                />
                <p className="small-medium lg:base-medium">{likesCount}</p>
            </div>
        </div>
    );
}
