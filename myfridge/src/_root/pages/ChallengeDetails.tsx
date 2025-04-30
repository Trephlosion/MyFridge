// src/_root/pages/ChallengeDetails.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
} from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ChallengeDeadlineInfo from "@/components/shared/ChallengeDeadlineInfo";
import ChallengeSubmissionForm from "@/components/form/ChallengeSubmissionForm";
import ChallengeSubmissionsPanel from "@/components/shared/ChallengeSubmissionsPanel";

const ChallengeDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useUserContext();
    const [challenge, setChallenge] = useState<any>(null);
    const [creatorInfo, setCreatorInfo] = useState<any>(null);
    const [participantsInfo, setParticipantsInfo] = useState<any[]>([]);
    const [winnerRecipe, setWinnerRecipe] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const isCreator = challenge?.creator?.id === user.id;
    const isParticipant = participantsInfo.some((p) => p.id === user.id);
    const expired = challenge?.deadline?.toDate()?.getTime() < Date.now();
    const currentWinnerId = challenge?.winner?.id;

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                if (!id) return;
                const ref = doc(database, "Challenges", id);
                const snap = await getDoc(ref);
                if (!snap.exists()) return;
                const data = snap.data();
                setChallenge({ id: snap.id, ...data });

                // creator
                const cSnap = await getDoc(data.creator);
                setCreatorInfo(cSnap.exists() ? { id: cSnap.id, ...cSnap.data() } : null);

                // participants
                if (Array.isArray(data.participants)) {
                    const parts = await Promise.all(
                        data.participants.map(async (r: any) => {
                            const ps = await getDoc(r);
                            return ps.exists() ? { id: ps.id, ...ps.data() } : null;
                        })
                    );
                    setParticipantsInfo(parts.filter(Boolean));
                }

                // winner recipe
                if (data.winner) {
                    const wSnap = await getDoc(data.winner);
                    if (wSnap.exists()) setWinnerRecipe({ id: wSnap.id, ...wSnap.data() });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, [id]);

    // remove user+their submission
    const handleLeaveChallenge = async () => {
        if (!challenge || !user.id) return;
        const ref = doc(database, "Challenges", challenge.id);

        // remove participant
        const updatedParticipants = challenge.participants.filter((r: any) => r.id !== user.id);

        // remove any of their submissions
        const toRemove = (challenge.submissions || []).filter((r: any) =>
            user.recipes.includes(r.id)
        );

        const updateData: any = { participants: updatedParticipants };
        if (toRemove.length) updateData.submissions = arrayRemove(...toRemove);

        await updateDoc(ref, updateData);

        setParticipantsInfo(prev => prev.filter(p => p.id !== user.id));
        setChallenge((c: any) => ({
            ...c,
            participants: updatedParticipants,
            submissions: (c.submissions || []).filter(r => !toRemove.some(rem => rem.id === r.id)),
        }));
    };

    // add callback for winner selection
    const handleWinnerSelect = async (recipeId: string) => {
        // update local state
        const winnerRef = doc(database, "Recipes", recipeId);
        setChallenge((c: any) => ({ ...c, winner: winnerRef }));
        // fetch full recipe
        const snap = await getDoc(winnerRef);
        if (snap.exists()) setWinnerRecipe({ id: snap.id, ...snap.data() });
    };

    if (loading) return <Loader />;
    if (!challenge) return <p className="text-center mt-10">Not found.</p>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <h1 className="text-3xl font-bold">{challenge.title}</h1>
            <p>{challenge.description}</p>
            <ChallengeDeadlineInfo deadline={challenge.deadline} />

            {/* Winner Display */}
            {winnerRecipe && (
                <Card className="border-yellow-400 ring-2">
                    <CardHeader>
                        <CardTitle className="text-xl">🏆 Winner</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link to={`/recipes/${winnerRecipe.id}`}>
                            <h2 className="font-bold">{winnerRecipe.title}</h2>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Submission Form (if joined & not creator & before deadline) */}
            {!expired && isParticipant && !isCreator && (
                <ChallengeSubmissionForm
                    challengeId={challenge.id}
                    existingSubmissions={challenge.submissions}
                />
            )}

            {/* Leave / Join Dialog */}
            <div className="flex justify-center">
                {!isParticipant ? (
                    <Button onClick={() => {/* join logic */}}>Join Challenge</Button>
                ) : (
                    /* your AlertDialog-wrapped Leave button from prior step,
                       calling handleLeaveChallenge() on confirm */
                    /* ... */
                    <Button onClick={handleLeaveChallenge} variant="destructive">
                        Leave Challenge
                    </Button>
                )}
            </div>

            {/* Submissions List */}
            {isCreator && (
                <>
                    <h2 className="text-2xl font-bold">Submissions</h2>
                    <ChallengeSubmissionsPanel
                        submissions={challenge.submissions}
                        challengeId={challenge.id}
                        allowWinnerSelection={true}
                        currentWinnerId={currentWinnerId}
                        onWinnerSelect={handleWinnerSelect}
                    />
                </>
            )}
        </div>
    );
};

export default ChallengeDetails;
