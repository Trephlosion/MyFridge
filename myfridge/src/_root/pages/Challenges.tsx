import { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { database } from "@/lib/firebase/config";
import {collection, addDoc, getDocs, doc, getDoc, serverTimestamp, updateDoc} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/shared";
import { useNavigate } from "react-router-dom";

const Challenges = () => {
    const { user } = useUserContext();
    const [challenges, setChallenges] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, "Challenges"));
                const challengesData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setChallenges(challengesData);
            } catch (error) {
                console.error("Error fetching challenges:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChallenges();
    }, []);

    const handleCreateChallenge = async () => {
        if (!title || !description) return;

        try {
            const newChallenge = {
                title,
                description,
                creator: doc(database, "Users", user.id), // DocumentReference
                participants: [],
                createdAt: serverTimestamp(),
            };

            const challengeRef = await addDoc(collection(database, "Challenges"), newChallenge);

            const userRef = doc(database, "Users", user.id);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                const updatedChallenges = userData.challenges ? [...userData.challenges, challengeRef] : [challengeRef];
                await updateDoc(userRef, {
                    challenges: updatedChallenges,
                });
            }

            setChallenges((prev) => [{ id: challengeRef.id, ...newChallenge }, ...prev]);
            setTitle("");
            setDescription("");
        } catch (error) {
            console.error("Error creating challenge:", error);
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="h2-bold text-center mb-8">Recipe Challenges</h1>

            {user.isVerified && (
                <div className="flex flex-col gap-4 mb-10">
                    <Input
                        type="text"
                        placeholder="Challenge Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Input
                        type="text"
                        placeholder="Challenge Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Button onClick={handleCreateChallenge}>Create Challenge</Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.length === 0 ? (
                    <p className="text-center text-light-4">No challenges found.</p>
                ) : (
                    challenges.map((challenge) => (
                        <Card key={challenge.id} className="bg-dark-4 p-4 shadow-md hover:scale-105 transition">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">{challenge.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-light-3 mb-3">{challenge.description}</p>
                                <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => navigate(`/challenge/${challenge.id}`)}
                                >
                                    View Challenge
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Challenges;
