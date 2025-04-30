import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUserContext } from "@/context/AuthContext";
import { database } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import RecipeCard from "@/components/cards/RecipeCard";

const ChallengeSubmissionForm = ({
                                     challengeId,
                                     existingSubmissions = [],
                                 }: {
    challengeId: string;
    existingSubmissions?: any[];
}) => {
    const { user } = useUserContext();
    const [userRecipes, setUserRecipes] = useState<any[]>([]);
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const submittedIds = existingSubmissions.map((ref) => ref.id);

    useEffect(() => {
        const fetchUserRecipes = async () => {
            try {
                const userRef = doc(database, "Users", user.id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    if (Array.isArray(data.recipes)) {
                        const recipes = await Promise.all(
                            data.recipes.map(async (ref: any) => {
                                const snap = await getDoc(ref);
                                return snap.exists() ? { id: snap.id, ...snap.data() } : null;
                            })
                        );
                        setUserRecipes(recipes.filter(Boolean));
                    }
                }
            } catch (err) {
                console.error("Error fetching user recipes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRecipes();
    }, [user.id]);

    const handleSubmit = async () => {
        if (!selectedRecipeId || submittedIds.includes(selectedRecipeId)) return;

        const recipeRef = doc(database, "Recipes", selectedRecipeId);
        const challengeRef = doc(database, "Challenges", challengeId);

        try {
            setSubmitting(true);
            await updateDoc(challengeRef, {
                submissions: arrayUnion(recipeRef),
            });
            alert("Recipe submitted!");
        } catch (err) {
            console.error("Submission failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-6 space-y-6">
            <h2 className="text-xl font-bold text-light-1">Select a Recipe to Submit</h2>

            {loading ? (
                <p className="text-light-4">Loading your recipes...</p>
            ) : userRecipes.length === 0 ? (
                <p className="text-light-4">You have no recipes to submit.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userRecipes.map((recipe) => {
                        const isSubmitted = submittedIds.includes(recipe.id);
                        const isSelected = selectedRecipeId === recipe.id;

                        return (
                            <div
                                key={recipe.id}
                                onClick={() => !isSubmitted && setSelectedRecipeId(recipe.id)}
                                className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                                    isSubmitted
                                        ? "border-gray-500 opacity-60 pointer-events-none"
                                        : isSelected
                                            ? "border-green-500 scale-105"
                                            : "border-transparent hover:border-green-400"
                                }`}
                            >
                                {isSubmitted && (
                                    <div className="absolute top-2 right-2 bg-green-700 text-white text-xs px-2 py-1 rounded">
                                        Submitted ✅
                                    </div>
                                )}
                                <RecipeCard recipe={recipe} />
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedRecipeId && !submittedIds.includes(selectedRecipeId) && (
                <Button onClick={handleSubmit} disabled={submitting} className="mt-6 w-full bg-green-600 hover:bg-green-700">
                    {submitting ? "Submitting..." : "Submit Selected Recipe"}
                </Button>
            )}
        </div>
    );
};

export default ChallengeSubmissionForm;
