import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { useUserContext } from '@/context/AuthContext';
import { database } from '@/lib/firebase/config';

const Inbox = () => {
    const { user } = useUserContext();
    const [messages, setMessages] = useState<any[]>([]);
    const [usernames, setUsernames] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user?.id) return;

            const q = query(
                collection(database, 'Messages'),
                where('toUserId', '==', user.id)
            );

            const snapshot = await getDocs(q);
            const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Sort by newest first
            const sorted = fetchedMessages.sort(
                (a, b) => b.sentAt?.seconds - a.sentAt?.seconds
            );
            setMessages(sorted);

            // Collect unique sender IDs
            const senderIds = [...new Set(sorted.map(msg => msg.fromUserId))];
            const usernameMap: Record<string, string> = {};

            // Fetch usernames for each sender
            await Promise.all(senderIds.map(async (id) => {
                try {
                    const userDoc = await getDoc(doc(database, 'Users', id)); // note: case-sensitive collection name
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        usernameMap[id] = data.username || id;
                    } else {
                        usernameMap[id] = id;
                    }
                } catch (err) {
                    console.error(`Error fetching username for ${id}`, err);
                    usernameMap[id] = id;
                }
            }));

            setUsernames(usernameMap);
        };

        fetchMessages();
    }, [user]);

    return (
        <div className="p-6 text-white">
            <h1 className="text-2xl font-bold mb-4">📥 Inbox</h1>
            {messages.length > 0 ? (
                <ul className="space-y-2">
                    {messages.map((msg, index) => (
                        <li key={index} className="bg-white text-black p-3 rounded-md shadow border">
                            <p className="text-sm text-gray-700 mb-1">
                                From: <span className="font-medium">@{usernames[msg.fromUserId] || msg.fromUserId}</span>
                            </p>
                            <p className="font-semibold">Subject: {msg.subject}</p>
                            <p>{msg.text}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                {msg.sentAt?.seconds && new Date(msg.sentAt.seconds * 1000).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No messages found.</p>
            )}
        </div>
    );
};

export default Inbox;











/*import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { useUserContext } from '@/context/AuthContext';
import { database } from '@/lib/firebase/config';

const Inbox = () => {
    const { user } = useUserContext();
    const [messages, setMessages] = useState<any[]>([]);
    const [usernames, setUsernames] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user?.id) return;

            const q = query(
                collection(database, 'Messages'),
                where('toUserId', '==', user.id)
            );

            const snapshot = await getDocs(q);
            const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Sort newest first
            const sorted = fetchedMessages.sort(
                (a: any, b: any) => b.sentAt?.seconds - a.sentAt?.seconds
            );
            setMessages(sorted);

            // Fetch usernames from sender IDs
            const uniqueSenderIds = [...new Set(sorted.map(msg => msg.fromUserId))];
            const usernameMap: Record<string, string> = {};

            await Promise.all(
                uniqueSenderIds.map(async (senderId) => {
                    const senderDoc = await getDoc(doc(database, 'users', senderId));
                    usernameMap[senderId] = senderDoc.exists()
                        ? senderDoc.data().username || senderId
                        : senderId;
                })
            );

            setUsernames(usernameMap);
        };

        fetchMessages();
    }, [user]);

    return (
        <div className="p-6 text-white">
            <h1 className="text-2xl font-bold mb-4">📥 Inbox</h1>
            {messages.length > 0 ? (
                <ul className="space-y-2">
                    {messages.map((msg, index) => (
                        <li key={index} className="bg-white text-black p-3 rounded-md shadow border">
                            <p className="text-sm text-gray-700 mb-1">
                                From: <span className="font-medium">{usernames[msg.fromUserId] || msg.fromUserId}</span>
                            </p>
                            <p className="font-semibold">Subject: {msg.subject}</p>
                            <p>{msg.text}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                {msg.sentAt?.seconds && new Date(msg.sentAt.seconds * 1000).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No messages found.</p>
            )}
        </div>
    );
};

export default Inbox;


 */






