// src/components/shared/notifications/NotificationItem.tsx

import { useNavigate } from "react-router-dom";
import { updateDoc, doc } from "firebase/firestore";
import { database } from "@/lib/firebase/config";

type NotificationItemProps = {
    id: string;
    type: "new_recipe" | "new_comment";
    message: string;
    recipeId?: string;
    isRead: boolean;
};

const NotificationItem = ({
                              id,
                              type,
                              message,
                              recipeId,
                              isRead,
                          }: NotificationItemProps) => {
    const navigate = useNavigate();

    const handleNotificationClick = async () => {
        try {
            // Mark notification as read
            if (!isRead) {
                const notifRef = doc(database, "Notifications", id);
                await updateDoc(notifRef, { isRead: true });
            }

            // Navigate if recipeId is available
            if (recipeId) {
                navigate(`/recipe/${recipeId}`);
            } else {
                console.warn("No recipeId provided in this notification:", id);
            }
        } catch (error) {
            console.error("Failed to handle notification click:", error);
        }
    };

    return (
        <div
            onClick={handleNotificationClick}
            className={`cursor-pointer p-4 rounded-md shadow-sm border ${
                isRead ? "bg-white text-gray-700" : "bg-blue-50 text-blue-800"
            } hover:bg-blue-100 transition-colors`}
        >
            <p className="text-sm">{message}</p>
        </div>
    );
};

export default NotificationItem;
