import { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { database } from "@/lib/firebase/config";
import {collection, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import { Loader } from "@/components/shared";
import {Link, useNavigate} from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";

const Challenges = () => {
    const { user } = useUserContext();
    const [challenges, setChallenges] = useState<any[]>([]);
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

    if (isLoading) {
        return(
            <>
                <div className="flex justify-center items-center h-screen">
                    <Loader />
                    <h1 className="text-light-4 text-xl">Loading challenges...</h1>
                </div>

            </>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link className={"hover:text-accentColor"} to="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink>Challenges</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <h1 className="h2-bold text-center mb-8">Recipe Challenges</h1>

            {user.isVerified && (
                <div className="flex justify-end mb-6">
                    <Button className={"bg-primary-500 hover:bg-primary-600 rounded-2xl"}  onClick={() => navigate("/create-challenge")}>
                        + Create Challenge
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.length === 0 ? (
                    <p className="text-center text-light-4">No challenges found.</p>
                ) : (
                    challenges.map((challenge) => (
                        <Card key={challenge.id} className="bg-dark-4 p-4 rounded-2xl shadow-md hover:scale-105 transition">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">{challenge.title}</CardTitle>
                                <p className="text-sm text-light-3">{new Date(challenge.createdAt?.seconds * 1000).toLocaleDateString()}</p>

                            </CardHeader>
                            <CardContent>
                                <p className="text-light-3 mb-3">{challenge.description}</p>
                                <p className="text-sm text-light-3">Participants: {challenge.participants.length}</p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    size="sm"
                                    className="w-full hover:bg-primary-600
                                     bg-primary-500 rounded-1md"
                                    onClick={() => navigate(`/challenge/${challenge.id}`)}
                                >
                                    View Challenge
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Challenges;
