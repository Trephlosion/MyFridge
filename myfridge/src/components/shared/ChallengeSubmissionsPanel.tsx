// src/components/shared/ChallengeSubmissionsPanel.tsx
import { useEffect, useState } from "react";
import { getDoc, DocumentReference } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";        // only for winner highlight wrapper
import RecipeCard from "@/components/cards/RecipeCard";

interface Props {
    submissions: DocumentReference[];
    challengeId: string;
    allowWinnerSelection: boolean;
    currentWinnerId?: string;
    onWinnerSelect: (recipeId: string) => void;
}

const ChallengeSubmissionsPanel = ({
                                       submissions,
                                       allowWinnerSelection,
                                       currentWinnerId,
                                       onWinnerSelect,
                                   }: Props) => {
    const [recipes, setRecipes] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecipes = async () => {
            if (!submissions) return;
            const loaded = await Promise.all(
                submissions.map(async (ref) => {
                    const snap = await getDoc(ref);
                    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
                })
            );
            setRecipes(loaded.filter(Boolean));
        };
        fetchRecipes();
    }, [submissions]);

    if (!submissions || submissions.length === 0) {
        return <p className="text-light-4 mt-3">No submissions yet.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {recipes.map((recipe) => {
                const isWinner = recipe.id === currentWinnerId;
                return (
                    <div key={recipe.id} className="relative">
                        {/* Winner highlight */}
                        {isWinner ? (
                            <div className="absolute inset-0 ring-4 ring-yellow-400 rounded-xl pointer-events-none"></div>
                        ) : null}

                        {/* RecipeCard clickable */}
                        <div onClick={() => navigate(`/recipes/${recipe.id}`)}>
                            <RecipeCard recipe={recipe} />
                        </div>

                        {/* Winner button */}
                        {allowWinnerSelection && !isWinner && (
                            <button
                                onClick={() => onWinnerSelect(recipe.id)}
                                className="mt-2 w-full text-sm bg-green-600 hover:bg-green-700 text-white py-1 rounded"
                            >
                                Select as Winner
                            </button>
                        )}

                        {/* Winner badge */}
                        {isWinner && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                🏆 Winner
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ChallengeSubmissionsPanel;
