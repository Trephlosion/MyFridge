import { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { database } from "@/lib/firebase/config";
import { collection, getDocs, doc, query, where, getDoc } from "firebase/firestore";
import ChallengeCard from "@/components/cards/ChallengeCard";
import Loader from "@/components/shared/Loader";

const MyChallengesTab = () => {
    const { user } = useUserContext();
    const [createdChallenges, setCreatedChallenges] = useState<any[]>([]);
    const [joinedChallenges, setJoinedChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                if (!user) return;

                // Fetch all challenges

                const challengesRef = collection(database, "Challenges");
                const allSnap = await getDocs(challengesRef);

                const challengesList = await Promise.all(
                    allSnap.docs.map(async (snap) => {
                        const data = snap.data();
                        const creatorSnap = await getDoc(data.creator);
                        return {
                            id: snap.id,
                            ...data,
                            creatorData: creatorSnap.exists() ? creatorSnap.data() : {},
                        };
                    })
                );

                const created = challengesList.filter((c) => user.challenges);
                const joined = challengesList.filter((c) => c.participants?.some((p: any) => p.id === user.id) && c.creatorData.id !== user.id);

                setCreatedChallenges(created);
                setJoinedChallenges(joined);
            } catch (err) {
                console.error("Error loading user challenges:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, [user.id]);

    if (loading) return <Loader />;

    return (
        <div className="flex flex-col gap-8">
            <section>
                <h2 className="h3-bold mb-4">Challenges I Created</h2>
                {createdChallenges.length === 0 ? (
                    <p className="text-light-4">You haven't created any challenges yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {createdChallenges.map((ch) => (
                            <ChallengeCard key={ch.id} challenge={ch} />
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="h3-bold mb-4">Challenges I Joined</h2>
                {joinedChallenges.length === 0 ? (
                    <p className="text-light-4">You haven't joined any challenges yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {joinedChallenges.map((ch) => (
                            <ChallengeCard key={ch.id} challenge={ch} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default MyChallengesTab;
