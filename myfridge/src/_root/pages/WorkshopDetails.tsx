// src/_root/pages/WorkshopDetails.tsx

import { useEffect, useState } from 'react';
import {
    doc,
    getDoc,
    addDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    arrayUnion,
    arrayRemove,
} from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const WorkshopDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUserContext();
    const [workshop, setWorkshop] = useState<any>(null);
    const [question, setQuestion] = useState('');
    const [questions, setQuestions] = useState<any[]>([]);
    const [enrolled, setEnrolled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsername = async (userId: string) => {
        try {
            const userDoc = await getDoc(doc(database, "Users", userId));
            return userDoc.exists() ? userDoc.data().username : "Unknown";
        } catch {
            return "Unknown";
        }
    };

    const fetchWorkshop = async () => {
        if (!id) return;

        const workshopDoc = await getDoc(doc(database, 'Workshops', id));
        if (workshopDoc.exists()) {
            const data = workshopDoc.data();
            setWorkshop({ id: workshopDoc.id, ...data });

            if (user && data.participants?.includes(user.id)) {
                setEnrolled(true);
            } else {
                setEnrolled(false);
            }
        }
        setIsLoading(false);
    };

    const fetchQuestions = async () => {
        if (!id) return;

        const q = query(collection(database, 'workshopQuestions'), where("workshopId", "==", id));
        const snapshot = await getDocs(q);
        const list = await Promise.all(snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const username = await fetchUsername(data.userId);
            return { id: docSnap.id, ...data, username };
        }));
        setQuestions(list);
    };

    useEffect(() => {
        fetchWorkshop();
        fetchQuestions();
    }, [id]);

    const handleEnroll = async () => {
        if (!user || !workshop) return;

        if (workshop.participants?.length >= workshop.maxParticipants) {
            alert("Workshop is full");
            return;
        }

        const workshopRef = doc(database, "Workshops", workshop.id);
        await updateDoc(workshopRef, {
            participants: arrayUnion(user.id),
        });

        setEnrolled(true);
        fetchWorkshop();
    };

    const handleUnenroll = async () => {
        if (!user || !workshop) return;

        const workshopRef = doc(database, "Workshops", workshop.id);
        await updateDoc(workshopRef, {
            participants: arrayRemove(user.id),
        });

        setEnrolled(false);
        fetchWorkshop();
    };

    const handleSubmitQuestion = async () => {
        if (!user || !question) return;

        await addDoc(collection(database, 'workshopQuestions'), {
            workshopId: id,
            userId: user.id,
            question,
            createdAt: new Date(),
        });

        setQuestion('');
        fetchQuestions();
    };

    if (isLoading || !workshop) {
        return <div className="text-white text-center mt-10">Loading workshop...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto text-white">
            <button
                onClick={() => navigate("/workshops")}
                className="mb-4 text-sm text-yellow-400 hover:text-yellow-300 transition"
            >
                ← Back to Workshops
            </button>

            <img
                src={workshop.media_url || 'https://www.food4fuel.com/wp-content/uploads/woocommerce-placeholder-600x600.png'}
                alt={workshop.title}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />

            <h1 className="text-4xl font-bold text-center mt-6">{workshop.title}</h1>

            <div className="flex justify-around text-lg my-4">
                <p><span
                    className="font-semibold">Date:</span> {workshop.date?.toDate?.().toLocaleDateString() || 'N/A'}</p>
                <p><span className="font-semibold">Location:</span> {workshop.location}</p>
            </div>

            {/* Enroll/Unenroll Section */}
            <div className="text-center my-4">
                {user && !user.isVerified && (
                    enrolled ? (
                        <button
                            onClick={handleUnenroll}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                        >
                            Unenroll
                        </button>

                    ) : (
                        <Button
                            onClick={handleEnroll}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                        >
                            Enroll in Workshop
                        </Button>
                    )
                )}
                <p className="text-sm text-gray-400 mt-2">
                    Enrolled: {workshop.participants?.length || 0} / {workshop.maxParticipants}
                </p>
            </div>

            {/* Description */}
            <div className="bg-gray-800 p-6 rounded-xl my-6">
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="leading-relaxed italic">{workshop.description}</p>
            </div>

            {/* Question Submission */}
            <div className="bg-gray-900 p-6 rounded-xl mb-6">
                <h2 className="text-2xl font-semibold mb-4">Ask a Question (Nutrition Q&A)</h2>

                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a nutrition-related question..."
                    className="w-full p-3 rounded-md text-black mb-4"
                />

                <button
                    onClick={handleSubmitQuestion}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                >
                    Submit Question
                </button>
            </div>

            {/* Display Questions */}
            <div className="bg-gray-800 p-6 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">Questions & Answers</h2>
                {questions.length === 0 ? (
                    <p className="italic text-gray-300">No questions yet. Ask the first one!</p>
                ) : (
                    <ul className="space-y-4">
                        {questions.map((q) => (
                            <li key={q.id} className="bg-gray-700 p-4 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold text-lg">@{q.username}</h3>
                                </div>
                                <p className="text-gray-200 italic">"{q.question}"</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(q.createdAt?.toDate?.() || q.createdAt).toLocaleString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default WorkshopDetails;
