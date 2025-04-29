import { doc, updateDoc } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";

const SelectWinnerButton = ({ challengeId, recipeId }: { challengeId: string; recipeId: string }) => {
    const handleSelectWinner = async () => {
        try {
            const challengeRef = doc(database, "Challenges", challengeId);
            const recipeRef = doc(database, "Recipes", recipeId);

            await updateDoc(challengeRef, {
                winner: recipeRef,
            });

            alert("Winner selected!");
        } catch (error) {
            console.error("Error selecting winner:", error);
        }
    };

    return (
        <Button onClick={handleSelectWinner} size="sm" className="bg-green-600 hover:bg-green-700">
            Select as Winner
        </Button>
    );
};

export default SelectWinnerButton;
