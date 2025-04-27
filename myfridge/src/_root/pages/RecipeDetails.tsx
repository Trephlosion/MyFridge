// RecipeDetails.tsx


import { useEffect, useState } from "react";
import { doc, getDoc, addDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { Recipe } from "@/types";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";

const RecipeDetails = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { user } = useUserContext();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);

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
                    const reviewsList = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setReviews(reviewsList);
                } catch (error) {
                    console.error("Error fetching reviews:", error);
                }
            }
        };
        // Fetch reviews when recipe id is known or when a review is submitted
        fetchReviews();
    }, [id, submitted]);

    const handleSubmitReview = async () => {
        if (!user || !review || rating === 0) return;
        try {
            if (id) {
                await addDoc(collection(database, "Recipes", id, "Ratings"), {
                    recipeId: id,
                    userId: user.id,
                    comment: review,
                    stars: rating,
                    createdAt: new Date(),
                });
                setSubmitted(true);
                setReview("");
                setRating(0);
            }
        } catch (error) {
            console.error("Error submitting a review:", error);
        }
    };

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
                            ? recipe.instructions.map((instruction, index) => (
                                <li key={index} className="text-lg">
                                    {instruction}
                                </li>
                            ))
                            : // If instructions is a string, split by newline and display each line.
                            recipe.instructions
                                .split("\n")
                                .filter(line => line.trim() !== "")
                                .map((instruction, index) => (
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
                        <h2 className="text-2xl font-semibold mb-4">Leave a Review</h2>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Write your review here..."
                            className="w-full p-3 rounded-md text-black mb-4"
                        />
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
                        <Button
                            onClick={handleSubmitReview}
                            disabled={submitted}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                        >
                            {submitted ? "Review Submitted" : "Submit Review"}
                        </Button>
                    </div>

                    {/* Horizontal carousel to display submitted reviews */}
                    {reviews.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">Submitted Reviews</h2>
                            <Carousel opts={{ align: "start" }} className="w-full">
                                <CarouselContent>
                                    {reviews.map((rev) => (
                                        <CarouselItem key={rev.id} className="w-full max-w-xs">
                                            <div className="p-3 bg-gray-800 rounded-md shadow">
                                                <p className="text-lg">{rev.comment}</p>
                                                <div className="flex mt-2">
                                                    {Array.from({ length: rev.stars }, (_, i) => (
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
                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RecipeDetails;




