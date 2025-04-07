import { useEffect, useState } from "react";
                    import { Link } from "react-router-dom";
                    import { getDownloadURL, ref } from "firebase/storage";
                    import { multiFormatDateString } from "@/lib/utils.ts";
                    import { useUserContext } from "@/context/AuthContext.tsx";
                    import { Recipe } from "@/types";
                    import {database, storage} from "@/lib/firebase/config.ts";
                    import RecipeStats from "@/components/cards/RecipeStats.tsx";
import { doc, getDoc } from "firebase/firestore";

import {Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription} from "@/components/ui/card.tsx";
import {addDoc, collection} from "firebase/firestore";

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
                                const userRef = doc(database, Users, authorId);
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
                                const info = await handleGetUserInfo(recipe.author);
                                setUserInfo(info);
                            };
                            fetchUserInfo();
                        }, [recipe.author]);

                        const safeTags: string[] = Array.isArray(recipe.tags)
                            ? recipe.tags
                            : typeof recipe.tags === "string"
                                ? recipe.tags.split(",").map(t => t.trim()).filter(Boolean)
                                : [];




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
                                                <div className="flex-center gap-2 text-light-3">
                                                    <p className="subtle-semibold lg:small-regular ">
                                                        {recipe.createdAt ? multiFormatDateString(recipe.createdAt.toString()) : "Unknown date"}
                                                    </p>
                                                    <p className="subtle-semibold lg:small-regular">
                                                        {recipe.likes?.length || 0} likes
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {user?.id === recipe.author && (
                                            <Link to={`/update-recipe/${recipe.id}`}>
                                                <img
                                                    src={"/assets/icons/edit.svg"}
                                                    alt="edit"
                                                    width={20}
                                                    height={20}
                                                />
                                            </Link>
                                        )}
                                </CardHeader>
                                <CardDescription>
                                    <div>
                                        <p>
                                            {recipe.description}
                                        </p>
                                    </div>
                                </CardDescription>
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
                                    <ul className="flex-row gap-1 mt-2">
                                        {safeTags.map((tag, idx) => (
                                            <li key={`${tag}-${idx}`} className="text-light-3 small-regular">
                                                #{tag}
                                            </li>
                                        ))}
                                    </ul>
                                </CardFooter>
                            </Card>
                        );
                    };

                    export default RecipeCard;
