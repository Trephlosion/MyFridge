import React, {useEffect, useState} from 'react'
import {useUserContext} from "@/context/AuthContext.tsx";
import {getDownloadURL, ref} from "firebase/storage";
import {database, storage} from "@/lib/firebase/config.ts";
import {doc, getDoc} from "firebase/firestore";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Link} from "react-router-dom";
import {multiFormatDateString} from "@/lib/utils.ts";
import RecipeStats from "@/components/cards/RecipeStats.tsx";
import {Recipe} from "@/types";

type RecipeCardProps = {
    recipe: Recipe;
};

type UserInfo = {
    pfp: string;
    username: string;
};

const RecipeCardMini  = ({ recipe }: RecipeCardProps) => {
    const { user } = useUserContext();
    const [imageUrl, setImageUrl] = useState<string>("");
    const [userInfo, setUserInfo] = useState<UserInfo>({
        pfp: "/assets/icons/profile-placeholder.svg",
        username: "Unknown"
    });


    useEffect(() => {
        const fetchImageUrl = async () => {
            if (recipe.mediaUrl) {
                try {
                    const fileRef = ref(storage, recipe.mediaUrl);
                    const url = await getDownloadURL(fileRef);
                    setImageUrl(url);
                } catch (error) {
                    console.error("Error fetching image URL:", error);
                    setImageUrl("/assets/icons/profile-placeholder.svg");
                }
            } else {
                setImageUrl("/assets/icons/profile-placeholder.svg");
            }
        };

        fetchImageUrl();
    }, [recipe.mediaUrl]);

    const handleGetUserInfo = async (authorId: string) => {
        try {
            const userRef = doc(database, "Users", authorId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const pfp = userData.pfp || "/assets/icons/profile-placeholder.svg";
                const username = userData.username || "Unknown";
                return { pfp, username };
            } else {
                console.error("User document does not exist.");
                return { pfp: "/assets/icons/profile-placeholder.svg", username: "Unknown" };
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
            return { pfp: "/assets/icons/profile-placeholder.svg", username: "Unknown" };
        }
    };


    useEffect(() => {
        const fetchUserInfo = async () => {
            const info = await handleGetUserInfo(recipe.author.id);
            setUserInfo(info);
        };
        fetchUserInfo();
    }, [recipe.author]);



    return (
        <Card className="recipe-card">
            <CardTitle className={"flex-center text-center"}>
                <h1>{recipe.title}</h1>
            </CardTitle>
            <CardHeader className="flex-between">

                <div className="flex items-center gap-3">
                    <Link to={`/profile/${recipe.author}`}>
                        <img
                            src={userInfo.pfp || "/assets/icons/profile-placeholder.svg"}
                            alt="creator"
                            className="w-12 lg:h-12 rounded-full"
                        />
                    </Link>
                    <div className="flex flex-col">
                        <Link to={`/profile/${recipe.author}`}>
                            <p className="text-light-1 lg:medium-bold">
                                {userInfo.username}
                            </p>
                        </Link>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="small-medium lg:base-medium py-2.5">
                <Link to={`/recipes/${recipe.id}`}>

                    <img
                        src={imageUrl || "/assets/icons/recipe-placeholder.svg"}
                        alt="recipe image"
                        className="recipe-card_img"
                    />
                </Link>
            </CardContent>

            <CardFooter className={"flex-col"}>
                <RecipeStats recipe={recipe} userId={user.id} />
            </CardFooter>
        </Card>
    );
}
export default RecipeCardMini
