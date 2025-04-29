// src/components/shared/notifications/NotificationItem.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { database } from "@/lib/firebase/config";

type NotificationItemProps = {
    id: any;
    type: "new_recipe" | "new_comment" | "new_workshop" | "new_follower";
    message?: string;
    recipeId?: any;
    workshopId?: any;
    followerId?: any;
    isRead: boolean;
};

const NotificationItem = ({
                              id,
                              type,
                              message,
                              recipeId,
                              workshopId,
                              followerId,
                              isRead,
                          }: NotificationItemProps) => {
    const navigate = useNavigate();
    const [followerUsername, setFollowerUsername] = useState<string>("");

    useEffect(() => {
        const fetchFollowerUsername = async () => {
            if (type === "new_follower" && followerId) {
                const userRef = doc(database, "Users", followerId);
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setFollowerUsername(data.username || "Unknown");
                }
            }
        };
        fetchFollowerUsername();
    }, [type, followerId]);

    const handleNotificationClick = async () => {
        try {
            const notifRef = doc(database, "Notifications", id);
            if (!isRead) await updateDoc(notifRef, { isRead: true });

            switch (type) {
                case "new_recipe":
                    if (recipeId) navigate(`/recipe/${recipeId}`);
                    break;
                case "new_workshop":
                    if (workshopId) navigate(`/workshop/${workshopId}`);
                    break;
                case "new_follower":
                    if (followerId) navigate(`/profile/${followerId}`);
                    break;
                default:
                    console.warn("Unhandled notification type:", type);
            }
        } catch (error) {
            console.error("Failed to handle notification click:", error);
        }
    };

    const renderMessage = () => {
        if (type === "new_follower" && followerUsername) {
            return `@${followerUsername} started following you.`;
        }
        return message || "You have a new notification.";
    };

    return (
        <div
            onClick={handleNotificationClick}
            className={`cursor-pointer p-4 rounded-md shadow-sm border ${
                isRead ? "bg-white text-gray-700" : "bg-blue-50 text-blue-800"
            } hover:bg-blue-100 transition-colors`}
        >
            <p className="text-sm">{renderMessage()}</p>
        </div>
    );
};

export default NotificationItem;
