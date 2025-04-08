// RecipeCard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDownloadURL, ref } from "firebase/storage";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { Recipe } from "@/types";
import { database, storage } from "@/lib/firebase/config";
import RecipeStats from "@/components/cards/RecipeStats";
import { doc, getDoc } from "firebase/firestore";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

type RecipeCardProps = {
    recipe: Recipe;
};

type UserInfo = {
    pfp: string;
    username: string;
};

const RecipeCard = ({ recipe }: RecipeCardProps) => {
    const { user } = useUserContext();
    const [imageUrl, setImageUrl] = useState<string>("");
    const [userInfo, setUserInfo] = useState<UserInfo>({
        pfp: "/assets/icons/profile-placeholder.svg",
        username: "Unknown",
    });

    // Fetch the image URL.
    useEffect(() => {
        const fetchImageUrl = async () => {
            if (recipe.mediaUrl) {
                if (recipe.mediaUrl.startsWith("http")) {
                    setImageUrl(recipe.mediaUrl);
                } else {
                    try {
                        const fileRef = ref(storage, recipe.mediaUrl);
                        const url = await getDownloadURL(fileRef);
                        setImageUrl(url);
                    } catch (error) {
                        console.error("Error fetching image URL:", error);
                        setImageUrl("/assets/icons/recipe-placeholder.svg");
                    }
                }
            } else {
                setImageUrl("/assets/icons/recipe-placeholder.svg");
            }
        };

        fetchImageUrl();
    }, [recipe.mediaUrl]);

    // Fetch the author's info.
    const handleGetUserInfo = async (authorId: any) => {
        try {
            let userRef;
            // If authorId is a string, convert it to a DocumentReference.
            if (typeof authorId === "string") {
                userRef = doc(database, "Users", authorId);
            } else {
                userRef = authorId;
            }
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                return {
                    pfp: userData.pfp || "/assets/icons/profile-placeholder.svg",
                    username: userData.username || "Unknown",
                };
            } else {
                console.error("User document does not exist.");
                return {
                    pfp: "/assets/icons/profile-placeholder.svg",
                    username: "Unknown",
                };
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
            return {
                pfp: "/assets/icons/profile-placeholder.svg",
                username: "Unknown",
            };
        }
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            // If the recipe is an AI recipe, use recipe.pfp and recipe.username directly.
            if (recipe.tags && Array.isArray(recipe.tags) && recipe.tags.includes("AI")) {
                setUserInfo({
                    pfp: recipe.pfp || "/assets/icons/ai-bot-icon.svg",
                    username: recipe.username || "AI Chef",
                });
            } else if (recipe.author || recipe.userId) {
                const authorIdentifier = recipe.author || recipe.userId;
                const info = await handleGetUserInfo(authorIdentifier);
                setUserInfo(info);
            }
        };
        fetchUserInfo();
    }, [recipe.author, recipe.userId, recipe.tags, recipe.pfp, recipe.username]);

    // Safe tags parsing.
    const safeTags: string[] = Array.isArray(recipe.tags)
        ? recipe.tags
        : typeof recipe.tags === "string"
            ? recipe.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [];

    return (
        <Card className="recipe-card flex flex-col">
            <CardTitle className="flex-center text-center">
                <h1 className="text-lg font-bold">{recipe.title}</h1>
            </CardTitle>
            <CardHeader className="flex justify-between px-3">
                <div className="flex flex-col items-start gap-3">
                    <Link to={`/profile/${recipe.author || recipe.userId}`}>
                        <img
                            src={userInfo.pfp}
                            alt="creator"
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <p className="text-sm font-medium">{userInfo.username}</p>
                    </Link>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <p>
                                {recipe.createdAt
                                    ? multiFormatDateString(recipe.createdAt.toString())
                                    : "Unknown date"}
                            </p>
                            <p>{recipe.likes?.length || 0} likes</p>
                        </div>
                    </div>
                </div>
                {user?.id === recipe.author || user?.id === recipe.userId ? (
                    <Link to={`/update-recipe/${recipe.id}`}>
                        <img
                            src="/assets/icons/edit.svg"
                            alt="edit"
                            className="w-5 h-5"
                        />
                    </Link>
                ) : null}
            </CardHeader>
            <CardContent className="flex-grow p-2">
                <Link to={`/recipes/${recipe.id}`} state={recipe}>
                    <img
                        src={imageUrl}
                        alt="recipe"
                        className="w-full h-80 object-cover rounded"
                    />
                </Link>
            </CardContent>
            <CardDescription className="px-3">
                <p className="text-sm text-gray-700 line-clamp-2">
                    {recipe.description}
                </p>
            </CardDescription>
            <CardFooter className="mt-auto px-5">
                <RecipeStats recipe={recipe} userId={user.id} />
                <ul className="flex flex-row flex-wrap gap-1 mt-2 text-xs text-gray-500">
                    {safeTags.map((tag, idx) => (
                        <li key={`${tag}-${idx}`}>#{tag}</li>
                    ))}
                </ul>
            </CardFooter>
        </Card>
    );
};

export default RecipeCard;
