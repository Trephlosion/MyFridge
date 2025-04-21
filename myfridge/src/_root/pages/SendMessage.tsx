/*import { useEffect, useState } from 'react';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { useUserContext } from '@/context/AuthContext';
import { database } from '@/lib/firebase/config';

interface Message {
    text: string;
    subject: string;
    fromUserId: string;
    sentAt: { seconds: number; toDate: () => Date };
}

const Inbox = () => {
    const { user } = useUserContext();
    const [messages, setMessages] = useState<any[]>([]);
    const [usernames, setUsernames] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user?.id) return;

            const docRef = doc(database, 'messages', user.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const sortedMessages = (data.inbox || []).sort(
                    (a, b) => b.sentAt?.seconds - a.sentAt?.seconds
                );
                setMessages(sortedMessages);

                // Collect unique sender IDs to fetch their usernames
                const uniqueSenderIds = [...new Set(sortedMessages.map((msg) => msg.fromUserId))];
                const userMap: Record<string, string> = {};

                for (const uid of uniqueSenderIds) {
                    const userDoc = await getDoc(doc(database, 'users', uid));
                    userMap[uid] = userDoc.exists() ? userDoc.data().username || uid : uid;
                }

                setUsernames(userMap);
            }
        };

        fetchMessages();
    }, [user]);

    return (
        <div className="p-6 text-white">
            <h1 className="text-2xl font-bold mb-4">📥 Inbox</h1>
            {messages.length > 0 ? (
                <ul className="space-y-2">
                    {messages.map((msg, index) => (
                        <li key={index} className="bg-gray-800 p-3 rounded-md">
                            <p className="text-sm text-gray-400 mb-1">
                                From: <span className="font-medium">{usernames[msg.fromUserId] || msg.fromUserId}</span>
                            </p>
                            <p className="font-semibold text-md">Subject: {msg.subject}</p>
                            <p>{msg.text}</p>
                            <p className="text-xs text-gray-400 mt-2">
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
*/




import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const SendMessage = () => {
    const { userId } = useParams();
    const { user: sender } = useUserContext();
    const navigate = useNavigate();

    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSendMessage = async () => {
        if (!message.trim() || !subject.trim()) return;

        const messageRef = doc(database, "messages", userId!);
        const snapshot = await getDoc(messageRef);

        const newMessage = {
            subject: subject.trim(),
            text: message.trim(),
            sentAt: new Date(),
            fromUserId: sender.id,
            fromUsername: sender.username,
            toUserId: userId
        };

        if (snapshot.exists()) {
            await updateDoc(messageRef, {
                inbox: arrayUnion(newMessage)
            });
        } else {
            await setDoc(messageRef, {
                inbox: [newMessage]
            });
        }

        navigate("/all-users");
    };

    return (
        <div className="common-container">
            <h2 className="h2-bold mb-4">Send Message</h2>

            <input
                className="w-full border border-gray-300 rounded-md p-2 mb-4 text-black"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />

            <textarea
                className="w-full border border-gray-300 rounded-md p-2 mb-4 text-black"
                rows={5}
                placeholder="Write your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <Button onClick={handleSendMessage} className="shad-button_primary">
                Send
            </Button>
        </div>
    );
};

export default SendMessage;





