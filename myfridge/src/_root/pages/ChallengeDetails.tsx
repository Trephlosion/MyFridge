import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";
import { Loader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ChallengeDeadlineInfo from "@/components/shared/ChallengeDeadlineInfo";
import ChallengeSubmissionForm from "@/components/form/ChallengeSubmissionForm";
import ChallengeSubmissionsPanel from "@/components/shared/ChallengeSubmissionsPanel";
import SelectWinnerButton from "@/components/shared/SelectWinnerButton";

const ChallengeDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useUserContext();
    const [challenge, setChallenge] = useState<any>(null);
    const [creatorInfo, setCreatorInfo] = useState<any>(null);
    const [participantsInfo, setParticipantsInfo] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isCreator = challenge?.creator?.id === user.id;
    const isParticipant = participantsInfo.some((p) => p.id === user.id);
    const expired = challenge?.deadline?.toDate?.()?.getTime() < Date.now();

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                if (!id) return;

                const challengeRef = doc(database, "Challenges", id);
                const challengeSnap = await getDoc(challengeRef);

                if (challengeSnap.exists()) {
                    const challengeData = challengeSnap.data();
                    setChallenge({ id: challengeSnap.id, ...challengeData });

                    // Fetch creator info
                    if (challengeData.creator) {
                        const creatorSnap = await getDoc(challengeData.creator);
                        if (creatorSnap.exists()) {
                            setCreatorInfo({ id: creatorSnap.id, ...creatorSnap.data() });
                        }
                    }

                    // Fetch participants info
                    if (Array.isArray(challengeData.participants)) {
                        const participantsData = await Promise.all(
                            challengeData.participants.map(async (ref: any) => {
                                const participantSnap = await getDoc(ref);
                                return participantSnap.exists() ? { id: participantSnap.id, ...participantSnap.data() } : null;
                            })
                        );
                        setParticipantsInfo(participantsData.filter(Boolean));
                    }
                }
            } catch (error) {
                console.error("Error fetching challenge:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenge();
    }, [id]);

    const handleJoinChallenge = async () => {
        if (!challenge || !user?.id) return;

        try {
            const challengeRef = doc(database, "Challenges", challenge.id);
            await updateDoc(challengeRef, {
                participants: arrayUnion(doc(database, "Users", user.id)),
            });

            setParticipantsInfo((prev) => [
                ...prev,
                {
                    id: user.id,
                    username: user.username,
                    pfp: user.pfp,
                    isVerified: user.isVerified,
                    isCurator: user.isCurator,
                    isAdministrator: user.isAdministrator,
                },
            ]);
        } catch (error) {
            console.error("Error joining challenge:", error);
        }
    };

    const handleLeaveChallenge = async () => {
        if (!challenge || !user?.id) return;

        try {
            const challengeRef = doc(database, "Challenges", challenge.id);
            const updatedParticipants = challenge.participants.filter(
                (ref: any) => ref.id !== user.id
            );

            await updateDoc(challengeRef, {
                participants: updatedParticipants,
            });

            setParticipantsInfo((prev) => prev.filter((p) => p.id !== user.id));
        } catch (error) {
            console.error("Error leaving challenge:", error);
        }
    };

    if (loading) return <Loader />;
    if (!challenge) return <p className="text-center text-light-4 mt-10">Challenge not found.</p>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Card className="bg-dark-4 p-4 shadow-md rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-3xl">{challenge.title}</CardTitle>

                    {creatorInfo && (
                        <div className="flex items-center gap-3 mt-4">
                            <Link to={`/profile/${creatorInfo.id}`}>
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={creatorInfo.pfp} alt={creatorInfo.username} />
                                    <AvatarFallback className="bg-white text-black">
                                        {creatorInfo.username.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className="flex flex-col">
                                <p className="text-light-3 font-semibold">@{creatorInfo.username}</p>
                                <div className="flex gap-1">
                                    {creatorInfo.isVerified && <img src="/assets/icons/verified.svg" className="w-5 h-5" />}
                                    {creatorInfo.isCurator && <img src="/assets/icons/curator-icon.svg" className="w-5 h-5" />}
                                    {creatorInfo.isAdministrator && <img src="/assets/icons/admin-icon.svg" className="w-5 h-5" />}
                                </div>
                            </div>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="space-y-6">
                    <p className="text-light-3">{challenge.description}</p>

                    <ChallengeDeadlineInfo deadline={challenge.deadline} />

                    {expired && challenge.winner && (
                        <div className="bg-green-700 p-3 rounded-lg mt-4 text-center font-bold">
                            🏆 Winner Selected!
                        </div>
                    )}

                    {!expired && isParticipant && !isCreator && (
                        <ChallengeSubmissionForm challengeId={challenge.id} existingSubmissions={challenge.submissions} />
                    )}

                    <div className="flex justify-center">
                        {isParticipant ? (
                            <Button size="sm" variant="destructive" onClick={handleLeaveChallenge} className="w-full">
                                Leave Challenge
                            </Button>
                        ) : (
                            <Button size="sm" onClick={handleJoinChallenge} className="w-full">
                                Join Challenge
                            </Button>
                        )}
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Participants</h3>
                        {participantsInfo.length === 0 ? (
                            <p className="text-light-4">No participants yet.</p>
                        ) : (
                            <div className="flex flex-wrap gap-4">
                                {participantsInfo.map((participant) => (
                                    <div key={participant.id} className="flex flex-col items-center">
                                        <Link to={`/profile/${participant.id}`}>
                                            <Avatar className="w-16 h-16">
                                                <AvatarImage src={participant.pfp} alt={participant.username} />
                                                <AvatarFallback className="bg-white text-black">
                                                    {participant.username.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <p className="text-light-3">@{participant.username}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {isCreator && (
                        <>
                            <h3 className="text-2xl font-bold mt-8 mb-2">Submissions</h3>
                            <ChallengeSubmissionsPanel
                                submissions={challenge.submissions}
                                challengeId={challenge.id}
                                allowWinnerSelection={!expired}
                            />
                        </>
                    )}
                </CardContent>
            </Card>

            <Button onClick={() => window.history.back()} className="mt-8 bg-red-600 hover:bg-red-700 w-full">
                Go Back
            </Button>
        </div>
    );
};

export default ChallengeDetails;
