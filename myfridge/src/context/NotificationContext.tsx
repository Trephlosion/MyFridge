// src/context/useNotificationContext.tsx

import { createContext, useContext, useEffect, useState } from "react";
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "./AuthContext";

type Notification = {
    id: string;
    type: "new_recipe" | "new_comment";
    message: string;
    recipeId?: string;
    isRead: boolean;
    createdAt: any;
};

type NotificationContextType = {
    notifications: Notification[];
};

const NotificationContext = createContext<NotificationContextType>({ notifications: [] });

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUserContext();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!user?.id) return;

        const q = query(
            collection(database, "Notifications"),
            where("userId", "==", user.id),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Notification[];

            setNotifications(fetched);
        });

        return () => unsubscribe();
    }, [user?.id]);

    return (
        <NotificationContext.Provider value={{ notifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotificationContext must be used within a NotificationProvider");
    }
    return context;
};
