// src/_root/pages/ChallengeDetails.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams} from 'react-router-dom';
import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
} from 'firebase/firestore';
import { database } from '@/lib/firebase/config';
import { useUserContext } from '@/context/AuthContext';
import { Loader, ChallengeDeadlineInfo, ChallengeSubmissionsPanel } from '@/components/shared';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from '@/components/ui/alert-dialog';
import ChallengeSubmissionForm from '@/components/form/ChallengeSubmissionForm';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";

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
    const expired = challenge?.deadline?.toDate?.().getTime() < Date.now();
    const currentWinnerId = challenge?.winner?.id;
    const navigate = useNavigate();

    // 1️⃣ Load challenge, creator, participants, and winner
    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                if (!id) return;
                const ref = doc(database, 'Challenges', id);
                const snap = await getDoc(ref);
                if (!snap.exists()) return;
                const data = snap.data();
                setChallenge({ id: snap.id, ...data });

                // creator
                const cSnap = await getDoc(data.creator);
                if (cSnap.exists()) {
                    setCreatorInfo({ id: cSnap.id, ...cSnap.data() });
                }

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

                // winner
                if (data.winner) {
                    const wSnap = await getDoc(data.winner);
                    if (wSnap.exists()) {
                        setWinnerRecipe({ id: wSnap.id, ...wSnap.data() });
                    }
                }
            } catch (err) {
                console.error('Error loading challenge:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, [id]);

    // 2️⃣ Join challenge
    const handleJoinChallenge = async () => {
        if (!challenge || !user.id) return;
        const ref = doc(database, 'Challenges', challenge.id);
        await updateDoc(ref, {
            participants: arrayUnion(doc(database, 'Users', user.id)),
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
        setChallenge((c: any) => ({
            ...c,
            participants: [...c.participants, doc(database, 'Users', user.id)],
        }));
    };

    // 3️⃣ Leave challenge & remove their submission(s)
    const handleLeaveChallenge = async () => {
        if (!challenge || !user.id) return;
        const ref = doc(database, 'Challenges', challenge.id);

        // remove participant
        const updatedParticipants = challenge.participants.filter(
            (r: any) => r.id !== user.id
        );

        // remove any of their submissions
        const toRemove = (challenge.submissions || []).filter((r: any) =>
            user.recipes.includes(r.id)
        );

        const updateData: any = { participants: updatedParticipants };
        if (toRemove.length) updateData.submissions = arrayRemove(...toRemove);

        await updateDoc(ref, updateData);

        // update local state
        setParticipantsInfo((prev) => prev.filter((p) => p.id !== user.id));
        setChallenge((c: any) => ({
            ...c,
            participants: updatedParticipants,
            submissions: (c.submissions || []).filter(
                (r: any) => !toRemove.some((t: any) => t.id === r.id)
            ),
        }));
    };

    // 4️⃣ When creator selects a winner
    const handleWinnerSelect = async (recipeId: string) => {
        const ref = doc(database, 'Challenges', challenge.id);
        const recipeRef = doc(database, 'Recipes', recipeId);
        await updateDoc(ref, { winner: recipeRef });

        setChallenge((c: any) => ({ ...c, winner: recipeRef }));
        const wSnap = await getDoc(recipeRef);
        if (wSnap.exists()) {
            setWinnerRecipe({ id: wSnap.id, ...wSnap.data() });
        }
    };

    if (loading) return (<>
            <p className="text-center text-light-4 mt-10">Loading Challenges...</p>
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        </>);

    if (!challenge) return (<>
            <p className="text-center text-light-4 mt-10">Challenge not found.</p>
                <Button
                    onClick={() => navigate("/challenges")}
                    className="mb-4 text-sm text-yellow-400 hover:text-yellow-300 transition"
                >
                    ← Back to Challenges
                </Button>
            </>);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* ─── Breadcrumb ───────────────────────── */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink >
                            <Link className={"hover:text-accentColor"} to="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink>
                            <Link className={"hover:text-accentColor"} to="/challenges">Challenges</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink>{challenge?.title}</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* ✨ Info Card */}
            <Card className={`flex-center flex-col gap-4 border bg-dark-3 border-dark-4 rounded-[20px] px-5 py-8 relative shadow-md transition-all hover:scale-[1.02] ${
                challenge.deadline?.toDate() < new Date() ? "border-red transition" : ""
            }`}>
                <CardHeader>
                    <CardTitle className="text-3xl">{challenge.title}</CardTitle>
                    <ChallengeDeadlineInfo deadline={challenge.deadline} />
                </CardHeader>

                <CardContent className="space-y-4">
                    <CardDescription>{challenge.description}</CardDescription>

                    {creatorInfo && (
                        <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src={creatorInfo.pfp} alt={creatorInfo.username} />
                                <AvatarFallback className={"bg-white text-black"}>
                                    {creatorInfo.username.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <p className="font-semibold">@{creatorInfo.username}</p>
                        </div>
                    )}

                    {winnerRecipe && (
                        <div className="pt-4">
                            <h3 className="text-xl font-bold">🏆 Winner</h3>
                            <Link
                                to={`/recipes/${winnerRecipe.id}`}
                                className="text-green-400 underline"
                            >
                                {winnerRecipe.title}
                            </Link>
                        </div>
                    )}

                    {/* Submission Form */}
                    {!expired && isParticipant && !isCreator && (
                        <ChallengeSubmissionForm
                            challengeId={challenge.id}
                            existingSubmissions={challenge.submissions}
                        />
                    )}

                    {/* Submissions Panel (creator only) */}
                    {isCreator && (
                        <>
                            <h2 className="text-2xl font-bold">Submissions</h2>
                            <ChallengeSubmissionsPanel
                                submissions={challenge.submissions}
                                challengeId={challenge.id}
                                allowWinnerSelection={!expired}
                                currentWinnerId={currentWinnerId}
                                onWinnerSelect={handleWinnerSelect}
                            />
                        </>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col justify-end">
                    {/* Join / Leave */}
                    <div className="flex justify-center">
                        {!expired && (
    !isParticipant ? (
        <Button className={"bg-primary-500 hover:bg-primary-600 rounded-2xl shadow p-5 mb-3"} onClick={handleJoinChallenge}>Join Challenge</Button>
    ) : (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Leave Challenge</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Leave</AlertDialogTitle>
                    <AlertDialogDescription>
                        Leaving will remove you and your submission from this
                        challenge. Are you sure?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLeaveChallenge}>
                        Yes, Leave
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
)}
                    </div>
                </CardFooter>
            </Card>


        </div>
    );
};

export default ChallengeDetails;
