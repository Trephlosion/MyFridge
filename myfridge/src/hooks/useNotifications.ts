// src/hooks/useNotifications.ts
import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    doc
} from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";

export type NotificationType = "new_recipe" | "new_comment";

export type Notification = {
    id: string;
    type: NotificationType;
    message: string;
    recipeId?: string;
    isRead: boolean;
    userId: string;
    createdAt: any;
};

export const useNotifications = () => {
    const { user } = useUserContext();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch notifications for current user
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?.id) return;

            try {

                const q = query(
                    collection(database, "Notifications"),
                    where("user_id", "==", doc(database, "Users", user.id)) ,
                    orderBy("createdAt", "desc")
                );

                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Notification[];

                setNotifications(data);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user?.id]);

    // Mark a notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            const notifRef = doc(database, "Notifications", notificationId);
            await updateDoc(notifRef, { isRead: true });

            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    return {
        notifications,
        loading,
        markAsRead
    };
};
