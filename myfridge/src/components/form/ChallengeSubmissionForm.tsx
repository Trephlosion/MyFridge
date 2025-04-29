import { useState } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUserContext } from "@/context/AuthContext";
import { database } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ChallengeSubmissionForm = ({ challengeId, existingSubmissions = [] }: { challengeId: string; existingSubmissions?: any[] }) => {
    const { user } = useUserContext();
    const [recipeId, setRecipeId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const hasSubmitted = existingSubmissions?.some((ref) => ref.id === recipeId);

    const handleSubmit = async () => {
        if (!recipeId || hasSubmitted) return;

        const challengeRef = doc(database, "Challenges", challengeId);
        const recipeRef = doc(database, "Recipes", recipeId);

        try {
            setSubmitting(true);
            await updateDoc(challengeRef, {
                submissions: arrayUnion(recipeRef),
            });
            alert("Submitted successfully!");
        } catch (err) {
            console.error("Error submitting recipe:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 mt-4">
            <Input
                type="text"
                placeholder="Enter your Recipe ID"
                value={recipeId}
                onChange={(e) => setRecipeId(e.target.value)}
            />
            <Button disabled={hasSubmitted || submitting} onClick={handleSubmit}>
                {hasSubmitted ? "Already Submitted" : submitting ? "Submitting..." : "Submit Recipe"}
            </Button>
        </div>
    );
};

export default ChallengeSubmissionForm;
