// RecipeDetails.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
} from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useUserContext } from "@/context/AuthContext";

const RecipeDetails = () => {
    const { id: recipeId } = useParams();
    const navigate = useNavigate();
    const { user } = useUserContext();

    const [recipe, setRecipe] = useState<any>(null);
    const [dietaryReview, setDietaryReview] = useState<any>(null);
    const [reviewText, setReviewText] = useState("");
    const [usageCount, setUsageCount] = useState<number>(0);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchRecipe = async () => {
            if (!recipeId) return;
            try {
                const recipeDoc = await getDoc(doc(database, "Recipes", recipeId));
                if (recipeDoc.exists()) {
                    setRecipe({ id: recipeDoc.id, ...recipeDoc.data() });
                }
            } catch (error) {
                console.error("Error fetching recipe:", error);
            }
        };
        fetchRecipe();
    }, [recipeId, submitted]);

    useEffect(() => {
        const fetchDietaryReview = async () => {
            if (!recipeId) return;
            try {
                const q = query(
                    collection(database, "DietaryComplianceReviews"),
                    where("recipeId", "==", recipeId),
                    orderBy("createdAt", "desc"),
                    limit(1)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    setDietaryReview(snapshot.docs[0].data());
                }
            } catch (error) {
                console.error("Error fetching dietary compliance review:", error);
            }
        };
        fetchDietaryReview();
    }, [recipeId, submitted]);

    const submitDietaryComplianceReview = async () => {
        if (!reviewText.trim() || !recipeId) return;
        try {
            await addDoc(collection(database, "DietaryComplianceReviews"), {
                recipeId,
                curatorId: user.id,
                curatorUsername: user.username,
                reviewText: reviewText.trim(),
                usageCount,
                createdAt: serverTimestamp(),
            });
            alert("Dietary Compliance Review submitted!");
            setReviewText("");
            setUsageCount(0);
            setSubmitted((prev) => !prev);
        } catch (error) {
            console.error("Error submitting dietary compliance review:", error);
            alert("Failed to submit review.");
        }
    };

    const handleApproveRecipe = async () => {
        try {
            await updateDoc(doc(database, "Recipes", recipe.id), {
                isApproved: true,
            });
            alert("Recipe approved successfully!");
            setSubmitted(!submitted);
        } catch (error) {
            console.error("Error approving recipe:", error);
            alert("Failed to approve recipe.");
        }
    };

    const handleDeleteRecipe = async () => {
        const confirmDelete = window.confirm("Are you sure you want to permanently delete this recipe?");
        if (!confirmDelete) return;
        try {
            await deleteDoc(doc(database, "Recipes", recipe.id));
            alert("Recipe deleted successfully!");
            navigate("/explore");
        } catch (error) {
            console.error("Error deleting recipe:", error);
            alert("Failed to delete recipe.");
        }
    };

    if (!recipe) {
        return <div className="text-white text-center mt-10">Loading recipe...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto text-white space-y-8">
            <h1 className="text-4xl font-bold text-center">{recipe.title}</h1>

            {recipe.mediaUrl && (
                <div className="w-full flex justify-center">
                    <img
                        src={recipe.mediaUrl}
                        alt={recipe.title}
                        className="max-w-full max-h-[400px] object-cover rounded-lg shadow-md"
                    />
                </div>
            )}

            {/* Recipe Details */}
            <div className="bg-dark-3 p-6 rounded-lg space-y-2">
                <h2 className="text-2xl font-semibold mb-2">Recipe Details</h2>
                <p><strong>Description:</strong> {recipe.description || "No description provided."}</p>
                <p><strong>Prep Time:</strong> {recipe.prepTime || "N/A"}</p>
                <p><strong>Cook Time:</strong> {recipe.cookTime || "N/A"}</p>
            </div>

            {/* Dietary Compliance Review */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Dietary Compliance Review</h2>
                {dietaryReview ? (
                    <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                        <p className="whitespace-pre-line">{dietaryReview.reviewText}</p>
                        <p>Number of Times Used: <strong>{dietaryReview.usageCount}</strong></p>
                        <p className="text-xs text-gray-400">
                            Submitted by {dietaryReview.curatorUsername || "Unknown"} on {dietaryReview.createdAt?.toDate().toLocaleString()}
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-400 italic">No dietary compliance review submitted yet.</p>
                )}

                {user?.isCurator && (
                    <div className="space-y-4">
                        <Textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Enter dietary compliance review here..."
                            className="w-full bg-dark-3 text-white h-32"
                        />
                        <Input
                            type="number"
                            value={usageCount}
                            onChange={(e) => setUsageCount(parseInt(e.target.value))}
                            placeholder="Enter number of times used"
                            className="w-full bg-dark-3 text-white h-12 px-4 rounded-md"
                        />
                        <Button onClick={submitDietaryComplianceReview} disabled={!reviewText.trim()}>
                            Submit Dietary Review
                        </Button>
                    </div>
                )}
            </div>

            {/* Curator Actions */}
            {user?.isCurator && (
                <div className="space-y-4">
                    {!recipe.isApproved && (
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleApproveRecipe}>
                            ✅ Approve Recipe
                        </Button>
                    )}
                    <Button className="bg-yellow-500 hover:bg-yellow-600" onClick={() => navigate(`/edit-recipe/${recipe.id}`)}>
                        ✏️ Suggest Edits
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteRecipe}>
                        🗑️ Delete Recipe
                    </Button>
                </div>
            )}
        </div>
    );
};

export default RecipeDetails;



