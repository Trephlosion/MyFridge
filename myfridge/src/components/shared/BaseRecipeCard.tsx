import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDownloadURL, ref } from "firebase/storage";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { Recipe } from "@/types";
import { storage } from "@/lib/firebase/config";
import RecipeStats from "@/components/shared/RecipeStats.tsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


type RecipeCardProps = {
    recipe: Recipe;
};

const BaseRecipeCard = ({ recipe }: RecipeCardProps) => {
    const { user } = useUserContext();
    const [imageUrl, setImageUrl] = useState<string>(""); // State for recipe image

    // Fetch recipe image URL from Firebase Storage
    useEffect(() => {
        const fetchImageUrl = async () => {
            if (recipe.pfpId) {
                try {
                    const fileRef = ref(storage, recipe.pfpId); // Use pfpId as storage path
                    const url = await getDownloadURL(fileRef);
                    setImageUrl(url); // Set the fetched URL
                } catch (error) {
                    console.error("Error fetching image URL:", error);
                    setImageUrl("/assets/icons/profile-placeholder.svg"); // Fallback image
                }
            } else {
                setImageUrl("/assets/icons/profile-placeholder.svg"); // Fallback if no pfpId
            }
        };

        fetchImageUrl();
    }, [recipe.pfpId]);

    if (!recipe.userId) return null; // Ensures the recipe has an associated user

    return (
        <Card className="recipe-card">
        <div className="recipe-card">
            <CardTitle>
                {/* Recipe Title */}
                <h3 className="h3-bold lg:h2-bold">{recipe.dish}</h3>

            </CardTitle>
            <CardDescription>
                {/* Recipe Description */}
                <p className="small-medium lg:base-medium">{recipe.description}</p>
            </CardDescription>

            <CardHeader>
                {/* Recipe Header */}
                <div className="flex-between">
                    <div className="flex items-center gap-3">
                        {/* Link to Creator's Profile */}
                        <Link to={`/profile/${recipe.userId}`}>
                            <img
                                src={imageUrl || "/assets/icons/profile-placeholder.svg"}
                                alt="creator"
                                className="w-12 lg:h-12 rounded-full"
                            />
                        </Link>
                        {/* User Info */}
                        <div className="flex flex-col">
                            <Link to={`/profile/${recipe.userId}`}>
                                <p className="text-light-1 lg:medium-bold">
                                    {user.username}
                                </p>
                            </Link>
                            <div className="flex-center gap-2 text-light-3">
                                <p className="subtle-semibold lg:small-regular ">
                                    {multiFormatDateString(recipe.createdAt.toString())}
                                </p>
                                <p className="subtle-semibold lg:small-regular">
                                    {recipe.likes?.length || 0} likes
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Edit Recipe Link */}
                    {user?.id === recipe.userId && (
                        <Link to={`/update-recipe/${recipe.id}`}>
                            <img
                                src={"/assets/icons/edit.svg"}
                                alt="edit"
                                width={20}
                                height={20}
                            />
                        </Link>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {/* Recipe Content */}
                <Link to={`/recipes/${recipe.id}`}>
                    <div className="small-medium lg:base-medium py-5">
                        <p>{recipe.dish}</p>
                        <ul className="flex gap-1 mt-2">
                            {recipe.tags?.map((tag: string, index: number) => (
                                <li
                                    key={`${tag}${index}`}
                                    className="text-light-3 small-regular"
                                >
                                    #{tag}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <img
                        src={imageUrl || "/assets/icons/profile-placeholder.svg"}
                        alt="recipe image"
                        className="recipe-card_img"
                    />
                </Link>

            </CardContent>


            <CardFooter>
                <RecipeStats recipe={recipe} userId={user.id} />

            </CardFooter>

        </div>
        </Card>
    );
};

export default BaseRecipeCard;
