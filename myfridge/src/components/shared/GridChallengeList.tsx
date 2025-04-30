import { useEffect, useState } from "react";
import { DocumentReference, getDoc } from "firebase/firestore";
import ChallengeCard from "@/components/cards/ChallengeCard";
import Loader from "@/components/shared/Loader";

type GridChallengeListProps = {
    challenges: DocumentReference[]; // Array of refs to Challenges collection
};

const GridChallengeList = ({ challenges }: GridChallengeListProps) => {
    const [challengeData, setChallengeData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const results = await Promise.all(
                    challenges.map(async (ref) => {
                        const snap = await getDoc(ref);
                        if (!snap.exists()) return null;

                        const data = snap.data();
                        const creatorSnap = await getDoc(data.creator);
                        return {
                            id: snap.id,
                            ...data,
                            creatorData: creatorSnap.exists() ? creatorSnap.data() : {},
                        };
                    })
                );

                setChallengeData(results.filter(Boolean));
            } catch (error) {
                console.error("Failed to load challenge data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (challenges.length > 0) {
            fetchChallenges();
        } else {
            setLoading(false);
        }
    }, [challenges]);

    if (loading) return <Loader />;

    if (challengeData.length === 0)
        return <p className="text-light-4">No challenges found.</p>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {challengeData.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
        </div>
    );
};

export default GridChallengeList;
