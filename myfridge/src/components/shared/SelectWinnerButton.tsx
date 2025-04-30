// src/components/shared/SelectWinnerButton.tsx
import { doc, updateDoc } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";

interface Props {
    challengeId: string;
    recipeId: string;
    onSuccess?: (recipeId: string) => void;
}

const SelectWinnerButton = ({ challengeId, recipeId, onSuccess }: Props) => {
    const handleSelectWinner = async () => {
        try {
            const challengeRef = doc(database, "Challenges", challengeId);
            const recipeRef = doc(database, "Recipes", recipeId);

            await updateDoc(challengeRef, {
                winner: recipeRef,
            });

            onSuccess?.(recipeId);
        } catch (error) {
            console.error("Error selecting winner:", error);
        }
    };

    return (
        <Button
            onClick={handleSelectWinner}
            size="sm"
            className="mt-2 bg-green-600 hover:bg-green-700"
        >
            Select as Winner
        </Button>
    );
};

export default SelectWinnerButton;
