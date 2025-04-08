// RecipeDetails.tsx
import { useEffect, useState } from "react";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { Recipe } from "@/types";

const RecipeDetails = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { user } = useUserContext();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // If recipe data was passed through location state, use it.
        if (location.state && (location.state as Recipe).id) {
            setRecipe(location.state as Recipe);
        } else {
            // Otherwise, fetch the recipe from Firebase.
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
                src={
                    recipe.mediaUrl || "/assets/icons/recipe-placeholder.svg"
                }
                alt={recipe.title}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />

            <h1 className="text-4xl font-bold text-center mt-6">{recipe.title}</h1>

            <div className="flex justify-around text-lg my-4">
                <p>
                    <span className="font-semibold">Prep:</span>{" "}
                    {recipe.prepTime || "N/A"}
                </p>
                <p>
                    <span className="font-semibold">Cook:</span>{" "}
                    {recipe.cookTime || "N/A"}
                </p>
                <p>
                    <span className="font-semibold">Yield:</span>{" "}
                    {recipe.servings || "N/A"}
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
                            : // If instructions is a string, we can split it into lines by newline,
                              // or just wrap it in an array.
                            [recipe.instructions].map((instruction, index) => (
                                <li key={index} className="text-lg">
                                    {instruction}
                                </li>
                            ))
                    ) : null}
                </ol>
            </div>

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
        </div>
    );
};

export default RecipeDetails;
