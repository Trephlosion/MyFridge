// RecipeDetails.tsx
                    import React, {useEffect, useState} from "react";
                    import {doc, getDoc, addDoc, collection, getDocs, query, orderBy} from "firebase/firestore";
                    import {database} from "@/lib/firebase/config";
                    import {useParams, useLocation, Link} from "react-router-dom";
                    import {useUserContext} from "@/context/AuthContext";
                    import {Recipe} from "@/types";
                    import {Button} from "@/components/ui/button";
                    import {UserInfo} from "@/types";

                    import {
                        Carousel,
                        CarouselContent,
                        CarouselItem,
                        CarouselPrevious,
                        CarouselNext,
                    } from "@/components/ui/carousel";
                    import {RatingSystem} from "@/components/shared";
                    import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
                    import {multiFormatDateString} from "@/lib/utils.ts";

                    const RecipeDetails = () => {
                        const {id} = useParams<{ id: string }>();
                        const location = useLocation();
                        const {user} = useUserContext();
                        const [recipe, setRecipe] = useState<Recipe | null>(null);
                        const [review, setReview] = useState("");
                        const [rating, setRating] = useState(0);
                        const [submitted, setSubmitted] = useState(false);
                        const [reviews, setReviews] = useState<any[]>([]);
                        const [imageUrl, setImageUrl] = useState<string>("");
                        const [userInfo, setUserInfo] = useState<UserInfo>({
                            pfp: "/assets/icons/profile-placeholder.svg",
                            username: "Unknown",
                            isVerified: false,
                            isCurator: false,
                            isAdministrator: false,
                            id: "",
                        });

    // Fetch recipe data (either from location.state or Firestore)
    useEffect(() => {
        if (location.state && (location.state as Recipe).id) {
            setRecipe(location.state as Recipe);
        } else {
            const fetchRecipe = async () => {
                if (id) {
                    const recipeDoc = await getDoc(doc(database, "Recipes", id));
                    if (recipeDoc.exists()) {
                        setRecipe({ id: recipeDoc.id, ...recipeDoc.data() } as Recipe);
                    }
                }
            };
            fetchRecipe();
        }
    }, [id, location.state]);

                        // Fetch reviews from the "Ratings" subcollection for this recipe
                        useEffect(() => {
                            const fetchReviews = async () => {
                                if (id) {
                                    try {
                                        const reviewsQuery = query(
                                            collection(database, "Recipes", id, "Ratings"),
                                            orderBy("createdAt", "desc")
                                        );
                                        const reviewsSnap = await getDocs(reviewsQuery);
                                        const reviewsList = reviewsSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));
                                        setReviews(reviewsList);
                                    } catch (error) {
                                        console.error("Error fetching reviews:", error);
                                    }
                                }
                            };
                            // Fetch reviews when recipe id is known or when a review is submitted
                            fetchReviews();
                        }, [id, submitted]);

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
                                if (!recipe) return;
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

                        if (!recipe)
                            return (
                                <div className="text-white text-center mt-10">Loading recipe...</div>
                            );

                        return (
                            <div className="p-6 max-w-4xl mx-auto text-white">
                                <img
                                    src={recipe.mediaUrl || "/assets/icons/recipe-placeholder.svg"}
                                    alt={recipe.title}
                                    className="w-full h-96 object-cover rounded-2xl shadow-lg"
                                />

                                <h1 className="text-4xl font-bold text-center mt-6">{recipe.title}</h1>
                                <div className="flex items-center justify-center gap-4 my-4">
                                    <div className="flex items-center gap-2">
                                        <Link to={`/profile/${userInfo.id}`} className="flex items-center gap-3">
                                            <Avatar className="w-16 h-16">
                                                <AvatarImage src={userInfo.pfp} alt={userInfo.username} />
                                                <AvatarFallback className={"bg-white text-black"}>{userInfo.username.charAt(0)}</AvatarFallback>
                                            </Avatar>

                                            <div className="flex items-center justify-center gap-1">
                                                <p className="text-light-3 text-center font-semibold truncate max-w-[180px]">
                                                    @{userInfo.username}
                                                </p>

                                                {/* Status Icons */}
                                                {userInfo.isVerified && (
                                                    <img
                                                        src="/assets/icons/verified.svg"
                                                        alt="verified"
                                                        className="w-5 h-5"
                                                    />
                                                )}
                                                {userInfo.isCurator && (
                                                    <img
                                                        src="/assets/icons/curator-icon.svg"
                                                        alt="curator"
                                                        className="w-5 h-5"
                                                    />
                                                )}
                                                {userInfo.isAdministrator && (
                                                    <img
                                                        src="/assets/icons/admin-icon.svg"
                                                        alt="admin"
                                                        className="w-5 h-5"
                                                    />
                                                )}
                                            </div>
                                        </Link>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <p>{multiFormatDateString(recipe.createdAt?.toString() || "")}</p>
                                            <p>{recipe.likes?.length || 0} likes</p>
                                        </div>

                                    </div>

                                </div>
                                <>
                                    {reviews.length > 0 && (() => {
                                        const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
                                        const averageRating = (totalStars / reviews.length).toFixed(1);
                                        return (
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-xl font-bold">{averageRating}</span>
                                                <span className="text-sm">({reviews.length} ratings)</span>
                                            </div>
                                        );
                                    })()}
                            </>
                                <div className="flex justify-around text-lg my-4">
                                    <p>
                                        <span className="font-semibold">Prep:</span> {recipe.prepTime || "N/A"}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Cook:</span> {recipe.cookTime || "N/A"}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Yield:</span> {recipe.servings || "N/A"}
                                    </p>
                                </div>

                                <div className="bg-gray-800 p-6 rounded-xl my-6">
                                    <h2 className="text-2xl font-semibold mb-4">Description</h2>
                                    <p className="leading-relaxed italic">
                                        {recipe.description || "No description provided."}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-semibold mb-2">Ingredients</h3>
                                    <ul className="list-disc pl-6">
                                        {recipe.ingredients &&
                                            recipe.ingredients.map((ingredient, index) => (
                                                <li key={index} className="text-lg">
                                                    {ingredient}
                                                </li>
                                            ))}
                                    </ul>
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-2xl font-semibold mb-2">Instructions</h3>
                                    <ol className="list-decimal pl-6">
                                        {recipe.instructions ? (
                                            Array.isArray(recipe.instructions)
                                                ? recipe.instructions.map((instruction: string, index: number) => (
                                                    <li key={index} className="text-lg">
                                                        {instruction}
                                                    </li>
                                                ))
                                                : // If instructions is a string, split by newline and display each line.
                                                typeof recipe.instructions === "string" &&
                                                recipe.instructions
                                                    .split("\n")
                                                    .filter((line: string) => line.trim() !== "")
                                                    .map((instruction: string, index: number) => (
                                                        <li key={index} className="text-lg">
                                                            {instruction}
                                                        </li>
                                                    ))
                                        ) : null}
                                    </ol>
                                </div>

                                {/* Render review section only for curators */}
                                {user.isCurator && (

                                    <>
                                        <div className="bg-gray-900 p-6 rounded-xl mt-6">
                                            <div className="grid w-full gap-2">
                                                <h2 className="text-2xl font-semibold mb-4">Leave a Review</h2>
                                                <div className="flex items-center gap-2 mb-4">
                                                    {[1, 2, 3, 4, 5].map((num) => (
                                                        <span
                                                            key={num}
                                                            onClick={() => setRating(num)}
                                                            className={`cursor-pointer text-2xl ${
                                                                rating >= num ? "text-yellow-400" : "text-gray-500"
                                                            }`}
                                                        >
                                      ★
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>


                                        {/* Horizontal carousel to display submitted reviews */}
                                        {reviews.length > 0 && (
                                            <>
                                                <div className="mt-6">
                                                    <h2 className="text-2xl font-semibold mb-4">Submitted Reviews</h2>
                                                    <Carousel opts={{align: "start"}} className="w-full">
                                                        <CarouselContent>
                                                            {reviews.map((rev) => (
                                                                <CarouselItem key={rev.id} className="w-full max-w-xs">
                                                                    <div className="p-3 bg-gray-800 rounded-md shadow">
                                                                        <p className="text-lg">{rev.comment}</p>
                                                                        <div className="flex mt-2">
                                                                            {Array.from({length: rev.stars}, (_, i) => (
                                                                                <span key={i} className="text-yellow-400 text-xl">★</span>
                                                                            ))}
                                                                        </div>
                                                                        <p className="text-sm mt-2">
                                                                            By: {rev.userId}
                                                                        </p>
                                                                        <p className="text-xs text-gray-400">
                                                                            {new Date(rev.createdAt.seconds * 1000).toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                </CarouselItem>
                                                            ))}
                                                        </CarouselContent>
                                                        <CarouselPrevious/>
                                                        <CarouselNext/>
                                                    </Carousel>
                                                </div>
                                            </>
                                        )}


                                    </>
                                )}
                                <div className="flex justify-center mt-6">
                                    <Button
                                        onClick={() => window.history.back()}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                                    >
                                        Back
                                    </Button>

                                </div>
                            </div>
                        )
                    }

                                export default RecipeDetails;
