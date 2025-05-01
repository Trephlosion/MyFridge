import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { getDownloadURL, ref } from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { Recipe } from "@/types";
import { database, storage } from "@/lib/firebase/config";

import RecipeStats from "@/components/cards/RecipeStats";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { RecipeCardProps, UserInfo } from "@/types";
import {UserAvatarRow} from "@/components/shared";
import {Badge} from "@/components/ui/badge.tsx";


const RecipeCard = ({ recipe }: RecipeCardProps) => {
    const navigate = useNavigate();
    const { user } = useUserContext();
    const [imageUrl, setImageUrl] = useState<string>("");
    const [userInfo, setUserInfo] = useState<UserInfo>({
        pfp: "/assets/icons/profile-placeholder.svg",
        username: "Unknown",
        isVerified: false,
        isCurator: false,
        isAdministrator: false,
        id: "",
    });

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

    const handleGetUserInfo = async (authorId: any) => {
        try {
            const userRef = typeof authorId === "string" ? doc(database, "Users", authorId) : authorId;
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData:any = userSnap.data();
                return {
                    pfp: userData.pfp,
                    username: userData.username || "Unknown",
                    isVerified: userData.isVerified || false,
                    isCurator: userData.isCurator || false,
                    isAdministrator: userData.isAdministrator || false,
                    id: userSnap.id,
                };
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
        return {
            pfp: "/assets/icons/profile-placeholder.svg",
            username: "Unknown",
        };
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (recipe.tags?.includes("AI")) {
                setUserInfo({
                    pfp: recipe.pfp || "/assets/icons/ai-bot-icon.svg",
                    username: recipe.username || "AI Chef",
                })
            } else if (recipe.author || recipe.userId) {
                const authorIdentifier = recipe.author || recipe.userId;
                const info = await handleGetUserInfo(authorIdentifier);
                setUserInfo(info);
            }
        };
        fetchUserInfo();
    }, [recipe]);

    const safeTags = Array.isArray(recipe.tags)
        ? recipe.tags
        : typeof recipe.tags === "string"
            ? recipe.tags.split(",").map((t) => t.trim())
            : [];

    return (
        <Card className="recipe-card flex flex-col">
            <CardTitle className="flex-center text-center">
                <h1 className="text-lg font-bold">{recipe.title}</h1>
            </CardTitle>
            <CardHeader className="flex justify-between px-3">
                <div className="flex flex-col items-start gap-3">
                    {recipe.author && <UserAvatarRow user={recipe.author} />}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <p>{recipe.createdAt ? (multiFormatDateString(recipe.createdAt)) : "Unknown Date"}</p>
                        {recipe.updatedAt && recipe.createdAt !== recipe.updatedAt && (
                            <p>Updated {multiFormatDateString(recipe.updatedAt)}</p>
                        )}
                        {recipe.likes && <p>{recipe.likes.length} likes</p>}
                    </div>
                    {user.username === userInfo.username ? (
                        <Link to={`/update-recipe/${recipe.id}`}>
                            <img src="/assets/icons/edit.svg" alt="edit" className="w-5 h-5" />
                        </Link>
                    ) : null}
                </div>
                {recipe.isSeasonal && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Badge variant={"secondary"} className={"bg-orange-400 "}>
                            Seasonal
                        </Badge>
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-2">
                <Link to={`/recipes/${recipe.id}`} state={JSON.parse(JSON.stringify(recipe))}>
                    <AspectRatio ratio={16 / 9} className="w-full rounded overflow-hidden">
                        <img
                            src={imageUrl}
                            alt={recipe.title}
                            className="object-cover w-full h-full rounded"
                        />
                    </AspectRatio>
                </Link>
            </CardContent>
            <CardDescription className="px-3 mt-1">
                <p className="text-sm text-gray-700 line-clamp-2">{recipe.description}</p>
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
