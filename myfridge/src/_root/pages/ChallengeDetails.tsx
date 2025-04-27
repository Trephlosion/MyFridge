import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, getDocs } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { Loader } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const ChallengeDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useUserContext();
    const [challenge, setChallenge] = useState<any>(null);
    const [creatorInfo, setCreatorInfo] = useState<any>(null);
    const [participantsInfo, setParticipantsInfo] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
                            setCreatorInfo(creatorSnap.data());
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
                setIsLoading(false);
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
                },
            ]);
        } catch (error) {
            console.error("Error joining challenge:", error);
        }
    };

    if (isLoading) return <Loader />;

    if (!challenge) return <div className="text-center text-light-4 mt-10">Challenge not found.</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Card className="bg-dark-4 p-4 shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                    {creatorInfo && (
                        <div className="flex items-center gap-3 mt-2">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={creatorInfo.pfp} alt={creatorInfo.username} />
                                <AvatarFallback>{creatorInfo.username?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="text-light-3">@{creatorInfo.username}</p>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <p className="text-light-3 mb-6">{challenge.description}</p>
                    <Button size="sm" className="w-full mb-8" onClick={handleJoinChallenge}>
                        Join Challenge
                    </Button>

                    <h3 className="text-lg font-semibold mb-3">Participants</h3>
                    {participantsInfo.length === 0 ? (
                        <p className="text-light-4">No participants yet.</p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {participantsInfo.map((participant) => (
                                <div key={participant.id} className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={participant.pfp} alt={participant.username} />
                                        <AvatarFallback>{participant.username?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-light-3 text-sm">@{participant.username}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ChallengeDetails;
