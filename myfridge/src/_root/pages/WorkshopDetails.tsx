// src/_root/pages/WorkshopDetails.tsx

import { useEffect, useState } from 'react';
import { doc, getDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { database } from "@/lib/firebase/config";
import { useParams, useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

const WorkshopDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUserContext();
    const [workshop, setWorkshop] = useState<any>(null);
    const [question, setQuestion] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [questions, setQuestions] = useState<any[]>([]);

    const fetchUsername = async (userId: string) => {
        try {
            const userDoc = await getDoc(doc(database, "Users", userId));
            return userDoc.exists() ? userDoc.data().username : "Unknown";
        } catch (error) {
            console.error("Error fetching username:", error);
            return "Unknown";
        }
    };

    useEffect(() => {
        const fetchWorkshop = async () => {
            if (id) {
                const workshopDoc = await getDoc(doc(database, 'Workshops', id));
                if (workshopDoc.exists()) {
                    setWorkshop({ id: workshopDoc.id, ...workshopDoc.data() });
                }
            }
        };

        const fetchQuestions = async () => {
            if (id) {
                const q = query(collection(database, 'workshopQuestions'), where("workshopId", "==", id));
                const snapshot = await getDocs(q);
                const list = await Promise.all(
                    snapshot.docs.map(async (docSnap) => {
                        const data = docSnap.data();
                        const username = await fetchUsername(data.userId);
                        return { id: docSnap.id, ...data, username };
                    })
                );
                setQuestions(list);
            }
        };

        fetchWorkshop();
        fetchQuestions();
    }, [id]);

    const handleSubmitQuestion = async () => {
        if (!user || !question) return;

        await addDoc(collection(database, 'workshopQuestions'), {
            workshopId: id,
            userId: user.id,
            question,
            createdAt: new Date(),
        });

        setSubmitted(true);
        setQuestion('');

        const q = query(collection(database, 'workshopQuestions'), where("workshopId", "==", id));
        const snapshot = await getDocs(q);
        const list = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                const username = await fetchUsername(data.userId);
                return { id: docSnap.id, ...data, username };
            })
        );
        setQuestions(list);
    };

    if (!workshop) return <div className="text-white text-center mt-10">Loading workshop...</div>;

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
                <p><span className="font-semibold">Date:</span> {workshop.date?.toDate?.().toLocaleDateString() || 'N/A'}</p>
                <p><span className="font-semibold">Location:</span> {workshop.location || 'N/A'}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl my-6">
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="leading-relaxed italic">{workshop.description || 'No description provided.'}</p>
            </div>

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
                    disabled={submitted}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                >
                    {submitted ? 'Question Submitted' : 'Submit Question'}
                </button>
            </div>

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
