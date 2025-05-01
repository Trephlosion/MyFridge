import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
    useLikeRecipe,
    useUnlikeRecipe,
    useGetCurrentUser,
} from "@/lib/react-query/queriesAndMutations";
import type { Recipe } from "@/types";
import type { DocumentReference } from "firebase/firestore";

interface RecipeStatsProps {
    recipe: Recipe;
    userId: string;
}

export default function RecipeStats({ recipe, userId }: RecipeStatsProps) {
    // AI recipes don’t get like buttons
    if (Array.isArray(recipe.tags) && recipe.tags.includes("AI")) {
        return null;
    }

    const location = useLocation();
    const { data: currentUser } = useGetCurrentUser();
    const { mutate: like, isPending: isLiking } = useLikeRecipe();
    const { mutate: unlike, isPending: isUnliking } = useUnlikeRecipe();

    // Determine initial liked state once
    const initialLiked = (() => {
        if (Array.isArray(recipe.likes)) {
            const ids = recipe.likes.map((l) =>
                typeof l === "string" ? l : "id" in l && typeof l.id === "string" ? l.id : ""
            );
            return ids.includes(userId);
        }
        if (Array.isArray(currentUser?.likedRecipes)) {
            const ids = currentUser.likedRecipes.map((r) =>
                typeof r === "string" ? r : "id" in r && typeof r.id === "string" ? r.id : ""
            );
            return ids.includes(recipe.id);
        }
        return false;
    })();

    const [isLiked, setIsLiked] = useState(initialLiked);
    const [likesCount, setLikesCount] = useState(
        Array.isArray(recipe.likes) ? recipe.likes.length : 0
    );

    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLiking || isUnliking) return;

        const nextLiked = !isLiked;
        setIsLiked(nextLiked);
        setLikesCount((c) => c + (nextLiked ? 1 : -1));

        if (nextLiked) {
            like({ recipeId: recipe.id, userId });
        } else {
            unlike({ recipeId: recipe.id, userId });
        }
    };

    const containerStyles = location.pathname.startsWith("/profile") ? "w-full" : "";

    return (
        <div
            className={`flex justify-between items-center z-20 ${containerStyles}`}
            aria-busy={isLiking || isUnliking}
        >
            <div className="flex gap-2 mr-5">
                <button
                    onClick={handleLikeClick}
                    disabled={isLiking || isUnliking}
                    className="p-1 rounded-full focus:outline-none disabled:opacity-50 disabled:cursor-wait"
                    aria-label={isLiked ? "Unlike recipe" : "Like recipe"}
                >
                    <img
                        src={isLiked ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
                        alt={isLiked ? "liked" : "like"}
                        width={20}
                        height={20}
                    />
                </button>
                <p className="small-medium lg:base-medium">{likesCount}</p>
            </div>
        </div>
    );
}
