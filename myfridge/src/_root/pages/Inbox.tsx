import { useEffect, useState } from 'react';
import { database } from '@/lib/firebase/config';
import { doc, getDoc } from "firebase/firestore";
import { useUserContext } from "@/context/AuthContext";
import {Card, CardContent, CardTitle} from "@/components/ui/card.tsx";

const Inbox = () => {
    const { user } = useUserContext();
    const [messages, setMessages] = useState<any[]>([]);
    const [usernames, setUsernames] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user?.id) return;

            const docRef = doc(database, "messages", user.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const sortedMessages = (data.inbox || []).sort(
                    (a: any, b: any) => b.sentAt?.toMillis?.() - a.sentAt?.toMillis?.()
                );
                setMessages(sortedMessages);

                // Fetch usernames of senders
                const uniqueSenderIds = [...new Set(sortedMessages.map((msg: any) => msg.fromUserId))];
                const senderMap: Record<string, string> = {};

                await Promise.all(
                    uniqueSenderIds.map(async (senderId) => {
                        const userDoc = await getDoc(doc(database, "Users", senderId));
                        senderMap[senderId] = userDoc.exists() ? userDoc.data().username || senderId : senderId;
                    })
                );

                setUsernames(senderMap);
            }
        };

        fetchMessages();
    }, [user]);

    return (
        <div className="p-6 text-black bg-light-4 w-full rounded" >
            <h1 className="text-2xl font-bold mb-4">📥 Inbox</h1>
            {messages.length > 0 ? (
                <ul className="space-y-2">
                    {messages.map((msg, index) => (
                        <li>
                            <Card key={index} className={"bg-light-2 rounded-3xl border border-light-4 p-5 lg:p-7 w-full max-w-screen-sm hover:scale-[1.05] transition-all"}>
                                <CardTitle className="text-lg font-semibold">
                                    From: {usernames[msg.fromUserId] || msg.fromUserId}
                                </CardTitle>
                                <CardContent>
                                    <p className="text-sm text-gray-600">Subject: {msg.subject}</p>
                                    <p>{msg.text}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(msg.sentAt?.seconds * 1000).toLocaleString()}
                                    </p>
                                </CardContent>
                            </Card>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-600">No messages found.</p>
            )}
        </div>
    );
};

export default Inbox;






/*import { useEffect, useState } from 'react';
import { auth, database } from '@/lib/firebase/config';
import { doc, getDoc } from "firebase/firestore";
import { useUserContext } from "@/context/AuthContext";

const Inbox = () => {
    const { user } = useUserContext();
    const [messages, setMessages] = useState<any[]>([]);
    const [usernames, setUsernames] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user?.id) return;

            const docRef = doc(database, "messages", user.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const sortedMessages = (data.inbox || []).sort(
                    (a, b) => b.sentAt?.toMillis?.() - a.sentAt?.toMillis?.()
                );
                setMessages(sortedMessages);

                // Fetch usernames of senders
                const uniqueSenderIds = [...new Set(sortedMessages.map((msg) => msg.fromUserId))];
                const senderMap: Record<string, string> = {};

                await Promise.all(
                    uniqueSenderIds.map(async (senderId) => {
                        const userDoc = await getDoc(doc(database, "users", senderId));
                        senderMap[senderId] = userDoc.exists() ? userDoc.data().username || senderId : senderId;
                    })
                );

                setUsernames(senderMap);
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








/*import { useEffect, useState } from 'react';
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
*/
