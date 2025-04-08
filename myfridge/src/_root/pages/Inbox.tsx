import { useEffect, useState } from 'react';
import { auth, database } from '@/lib/firebase/config';
import { doc, getDoc } from "firebase/firestore";
import { useUserContext } from "@/context/AuthContext";


const Inbox = () => {
    const { user } = useUserContext();
    const [messages, setMessages] = useState<any[]>([]);

    console.log("User ID:", user?.id);

    useEffect(() => {
        const fetchMessages = async () => {
            const docRef = doc(database, "messages", user.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const sortedMessages = (data.inbox || []).sort(
                    (a, b) => b.sentAt?.toMillis?.() - a.sentAt?.toMillis?.()
                );
                setMessages(sortedMessages);
            }
        };

        if (user?.id) fetchMessages();
    }, [user]);


    return (
        <div className="p-6 text-white">
            <h1 className="text-2xl font-bold mb-4">Inbox</h1>
            {messages.length > 0 ? (
                <ul className="space-y-2">
                    {messages.map((msg, index) => (
                        <li key={index} className="bg-gray-800 p-3 rounded-md">
                            <p>{msg.text}</p>
                            <p className="text-sm text-gray-400">
                                {new Date(msg.sentAt?.seconds * 1000).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No messages found.</p>
            )}
        </div>
    );
};

export default Inbox;





