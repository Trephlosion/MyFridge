// src/components/shared/ChallengeSubmissionsPanel.tsx
import { useEffect, useState } from "react";
import { getDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import SelectWinnerButton from "./SelectWinnerButton";

interface Props {
    submissions: any[];               // array of DocumentReference<Recipe>
    challengeId: string;
    allowWinnerSelection: boolean;
    currentWinnerId?: string;
    onWinnerSelect: (recipeId: string) => void;
}

const ChallengeSubmissionsPanel = ({
                                       submissions,
                                       challengeId,
                                       allowWinnerSelection,
                                       currentWinnerId,
                                       onWinnerSelect,
                                   }: Props) => {
    const [recipes, setRecipes] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecipes = async () => {
            if (!submissions) return;
            try {
                const recipesData = await Promise.all(
                    submissions.map(async (ref) => {
                        const snap = await getDoc(ref);
                        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
                    })
                );
                setRecipes(recipesData.filter(Boolean));
            } catch (error) {
                console.error("Failed to load submissions:", error);
            }
        };

        fetchRecipes();
    }, [submissions]);

    if (!submissions || submissions.length === 0) {
        return <p className="text-light-4 mt-3">No submissions yet.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {recipes.map((recipe) => {
                const isWinner = recipe.id === currentWinnerId;
                return (
                    <div key={recipe.id} className="relative">
                        <Card
                            onClick={() => navigate(`/recipes/${recipe.id}`)}
                            className={`cursor-pointer transition ${
                                isWinner ? "ring-4 ring-yellow-400" : ""
                            }`}
                        >
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                    {recipe.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-light-3 line-clamp-2">
                                    {recipe.description}
                                </p>
                            </CardContent>
                        </Card>

                        {isWinner && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                🏆 Winner
                            </div>
                        )}

                        {allowWinnerSelection && !isWinner && (
                            <SelectWinnerButton
                                challengeId={challengeId}
                                recipeId={recipe.id}
                                onSuccess={onWinnerSelect}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ChallengeSubmissionsPanel;
