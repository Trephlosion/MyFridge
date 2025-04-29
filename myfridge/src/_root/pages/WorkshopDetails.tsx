// Extending WorkshopDetails.tsx to allow replies to Questions

import { useEffect, useState } from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const WorkshopDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUserContext();

    const [workshop, setWorkshop] = useState<any>(null);
    const [creator, setCreator] = useState<{ username: string; pfp: string } | null>(null);
    const [question, setQuestion] = useState("");
    const [questions, setQuestions] = useState<any[]>([]);
    const [enrolled, setEnrolled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWorkshop = async () => {
        if (!id) return;
        const workshopDoc = await getDoc(doc(database, "Workshops", id));
        if (workshopDoc.exists()) {
            const data = workshopDoc.data();
            setWorkshop({ id: workshopDoc.id, ...data });
            if (data.userId) {
                const userSnap = await getDoc(data.userId);
                if (userSnap.exists()) {
                    const userData = userSnap.data() as { username: string; pfp: string };
                    setCreator({ username: userData.username, pfp: userData.pfp || "/assets/icons/profile-placeholder.svg" });
                }
            }
            if (user && data.participants?.some((ref: any) => ref.id === user.id)) {
                setEnrolled(true);
            }
        }
        setIsLoading(false);
    };

    const fetchQuestions = async () => {
        if (!id) return;

        const q = query(collection(database, "workshopQuestions"), where("workshopId", "==", doc(database, "Workshops", id)));
        const snapshot = await getDocs(q);

        const list = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                let username = "Unknown";
                if (data.userId) {
                    const userSnap = await getDoc(data.userId);
                    if (userSnap.exists()) {
                        username = (userSnap.data() as { username: string }).username;
                    }
                }

                const repliesSnapshot = await getDocs(collection(docSnap.ref, "Replys"));
                const replies = await Promise.all(
                    repliesSnapshot.docs.map(async (replyDoc) => {
                        const replyData = replyDoc.data();
                        let repliedByUsername = "Unknown";
                        if (replyData.repliedBy) {
                            const replyUserSnap = await getDoc(replyData.repliedBy);
                            if (replyUserSnap.exists()) {
                                repliedByUsername = (replyUserSnap.data() as { username: string }).username;
                            }
                        }
                        return { id: replyDoc.id, ...replyData, repliedByUsername };
                    })
                );

                return { id: docSnap.id, ...data, username, replies };
            })
        );

        setQuestions(list);
    };

    useEffect(() => {
        fetchWorkshop();
        fetchQuestions();
    }, [id]);

    const handleEnroll = async () => {
        if (!user || !workshop) return;

        const workshopRef = doc(database, "Workshops", workshop.id);
        await updateDoc(workshopRef, {
            participants: arrayUnion(doc(database, "Users", user.id)),
        });
        setEnrolled(true);
        fetchWorkshop();
    };

    const handleUnenroll = async () => {
        if (!user || !workshop) return;

        const workshopRef = doc(database, "Workshops", workshop.id);
        await updateDoc(workshopRef, {
            participants: arrayRemove(doc(database, "Users", user.id)),
        });
        setEnrolled(false);
        fetchWorkshop();
    };

    const handleSubmitQuestion = async () => {
        if (!user || !question) return;

        await addDoc(collection(database, "workshopQuestions"), {
            workshopId: doc(database, "Workshops", id!),
            userId: doc(database, "Users", user.id),
            question,
            createdAt: new Date(),
        });

        setQuestion("");
        fetchQuestions();
    };

    const handleReplySubmit = async (questionId: string, replyText: string) => {
        if (!user || !replyText) return;

        await addDoc(collection(database, `workshopQuestions/${questionId}/Replys`), {
            replyText,
            repliedAt: new Date(),
            repliedBy: doc(database, "Users", user.id),
        });

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
                src={workshop.media_url || '/assets/icons/recipe-placeholder.svg'}
                alt={workshop.title}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />

            <h1 className="text-4xl font-bold text-center mt-6">{workshop.title}</h1>

            <div className="flex justify-around text-lg my-4">
                <p><span className="font-semibold">Date:</span> {new Date(workshop.date?.seconds * 1000).toLocaleDateString()}</p>
                <p><span className="font-semibold">Location:</span> {workshop.location}</p>
            </div>

            <div className="flex justify-center mb-4">
                {user && !user.isVerified && (
                    enrolled ? (
                        <Button onClick={handleUnenroll} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
                            Unenroll
                        </Button>
                    ) : (
                        <Button onClick={handleEnroll} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                            Enroll in Workshop
                        </Button>
                    )
                )}
            </div>

            <div className="text-center text-sm text-gray-400 mb-6">
                Enrolled: {workshop.participants?.length || 0} / {workshop.maxParticipants}
            </div>

            <div className="bg-gray-800 p-6 rounded-xl my-6">
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="leading-relaxed italic">{workshop.description}</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl mb-6">
                <h2 className="text-2xl font-semibold mb-4">Ask a Question (Nutrition Q&A)</h2>
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a nutrition-related question..."
                    className="w-full p-3 rounded-md text-black mb-4"
                />
                <Button
                    onClick={handleSubmitQuestion}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                >
                    Submit Question
                </Button>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">Questions & Answers</h2>
                {questions.length === 0 ? (
                    <p className="italic text-gray-300">No questions yet. Ask the first one!</p>
                ) : (
                    <ul className="space-y-8">
                        {questions.map((q) => (
                            <li key={q.id} className="bg-gray-700 p-4 rounded-lg shadow-md">
                                <div className="flex flex-col mb-2">
                                    <Link to={`/profile/${q.userId?.id}`} className="flex items-center mb-2">
                                        <Avatar className="w-10 h-10 mr-2">
                                            <AvatarImage src={q.userId?.pfp || '/assets/icons/profile-placeholder.svg'} alt={q.username} />
                                            <AvatarFallback className="bg-white text-black">
                                                {q.username.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <h3 className="font-semibold text-lg">@{q.username}</h3>
                                    </Link>
                                    <p className="text-gray-200 italic">"{q.question}"</p>
                                </div>

                                {/* Replies */}
                                <div className="ml-6 space-y-2">
                                    {q.replies.map((reply: any) => (
                                        <div key={reply.id} className="bg-gray-600 p-3 rounded-md">
                                            <Link to={`/profile/${reply.repliedBy?.id}`} className="flex items-center mb-2">
                                                <p className="text-sm text-yellow-300">@{reply.repliedByUsername}</p>
                                            </Link>
                                            <p className="text-gray-100 italic">{reply.replyText}</p>
                                            <p className="text-xs text-gray-400">{new Date(reply.repliedAt?.seconds * 1000).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>

                                <ReplyInput onSubmitReply={(text) => handleReplySubmit(q.id, text)} />

                                {/* Add a Reply
                                {enrolled && (
                                    <ReplyInput onSubmitReply={(text) => handleReplySubmit(q.id, text)} />
                                )}*/}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const ReplyInput = ({ onSubmitReply }: { onSubmitReply: (text: string) => void }) => {
    const [replyText, setReplyText] = useState("");

    return (
        <div className="flex flex-col mt-4">
      <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write your reply..."
          className="w-full p-2 rounded-md text-black mb-2"
      />
            <Button
                onClick={() => { onSubmitReply(replyText); setReplyText(""); }}
                className="bg-green-600 hover:bg-green-700 text-white"
            >
                Submit Reply
            </Button>
        </div>
    );
};

export default WorkshopDetails;
