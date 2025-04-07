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
                        setImageUrl("/assets/icons/profile-placeholder.svg");
                    }
                }
            } else {
                setImageUrl("/assets/icons/recipe-placeholder.svg");
            }
        };

        fetchImageUrl();
    }, [recipe.mediaUrl]);

    // Fetch the author's info.
    const handleGetUserInfo = async (authorId: string) => {
        try {
            const userRef = doc(database, "Users", authorId);
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
            if (recipe.author && recipe.author) {
                const info = await handleGetUserInfo(recipe.author);
                setUserInfo(info);
            }
        };
        fetchUserInfo();
    }, [recipe.author]);

    // Safe tags parsing.
    const safeTags: string[] = Array.isArray(recipe.tags)
        ? recipe.tags
        : typeof recipe.tags === "string"
            ? recipe.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [];

    return (
        <Card className="recipe-card w-80 h-96 flex flex-col">
            <CardTitle className="flex-center text-center">
                <h1 className="text-lg font-bold">{recipe.title}</h1>
            </CardTitle>
            <CardHeader className="flex justify-between items-center px-3">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${recipe.author}`}>
                        <img
                            src={userInfo.pfp}
                            alt="creator"
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    </Link>
                    <div className="flex flex-col">
                        <Link to={`/profile/${recipe.author}`}>
                            <p className="text-sm font-medium">{userInfo.username}</p>
                        </Link>
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
                {user?.id === recipe.author && (
                    <Link to={`/update-recipe/${recipe.id}`}>
                        <img
                            src="/assets/icons/edit.svg"
                            alt="edit"
                            className="w-5 h-5"
                        />
                    </Link>
                )}
            </CardHeader>
            <CardContent className="flex-grow p-2">
                <Link to={`/recipes/${recipe.id}`}>
                    <img
                        src={imageUrl}
                        alt="recipe"
                        className="w-full h-40 object-cover rounded"
                    />
                </Link>
            </CardContent>
            <CardDescription className="px-3">
                {/* Use Tailwind's line-clamp-3 for multi-line truncation.
            Ensure the Tailwind line-clamp plugin is enabled in your project.
            Alternatively, you can use inline styles:
             style={{
               display: '-webkit-box',
               WebkitLineClamp: 3,
               WebkitBoxOrient: 'vertical',
               overflow: 'hidden'
             }} */}
                <p className="text-sm text-gray-700 line-clamp-3">{recipe.description}</p>
            </CardDescription>
            <CardFooter className="mt-auto px-5">
                <RecipeStats recipe={recipe} userId={user.id} />
                <ul className="flex flex-col flex-wrap gap-1 mt-2 text-xs text-gray-500">
                    {safeTags.map((tag, idx) => (
                        <li key={`${tag}-${idx}`}>#{tag}</li>
                    ))}
                </ul>
            </CardFooter>
        </Card>
    );
};

export default RecipeCard;
