// src/components/notifications/Notifications.tsx

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";
import NotificationItem from "./NotificationItem";
import { doc } from "firebase/firestore"; // 🔁 import this at the top

type Notification = {
    id: string;
    type: "new_recipe" | "new_comment";
    message: string;
    recipeId?: string;
    isRead: boolean;
    createdAt: any;
};

const Notifications = () => {
    const { user } = useUserContext();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!user?.id) return;

        const q = query(
            collection(database, "Notifications"),
            where("user_id", "==", user.id)),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Notification, "id">),
            }));
            setNotifications(notifData);
        });

        return () => unsubscribe();
    }, [user?.id]);

    return (
        <div className="p-6 max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-white">Notifications</h2>
            {notifications.length === 0 ? (
                <p className="text-gray-400">No notifications yet.</p>
            ) : (
                notifications.map((notif) => (
                    <NotificationItem key={notif.id} {...notif} />
                ))
            )}
        </div>
    );
};

export default Notifications;
