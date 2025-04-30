import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    orderBy,
    query,
    Timestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { database } from "@/lib/firebase/config";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Notification {
    id: string;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: Timestamp;
    user_id: any; // Firestore reference
    workshopId?: string;
    recipeId?: string;
}

interface UserData {
    username: string;
    pfp: string;
}

const NotificationsPage = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<
        (Notification & { senderData?: UserData })[]
    >([]);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            const notificationsRef = collection(database, "Notifications");
            const q = query(notificationsRef, orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            const notifs: (Notification & { senderData?: UserData })[] = [];

            for (const docSnap of querySnapshot.docs) {
                const notif = docSnap.data() as Notification;

                if (notif.followerId === user.id || notif.user_id?.id === user.id) {
                    let senderData: UserData | undefined = undefined;

                    if (notif.user_id) {
                        const senderSnap = await getDoc(notif.user_id);
                        if (senderSnap.exists()) {
                            const data = senderSnap.data();
                            senderData = {
                                username: data.username,
                                pfp: data.pfp || "",
                            };
                        }
                    }

                    notifs.push({
                        ...notif,
                        id: docSnap.id,
                        senderData,
                    });
                }
            }

            setNotifications(notifs);
        };

        fetchNotifications();
    }, [user]);

    const handleNotificationClick = (notif: Notification) => {
        if (notif.workshopId) {
            navigate(`/workshops/${notif.workshopId}`);
        } else if (notif.recipeId) {
            navigate(`/recipes/${notif.recipeId}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-center text-yellow-400">
                Notifications
            </h1>

            {notifications.length === 0 ? (
                <p className="text-gray-400 text-center">No notifications yet.</p>
            ) : (
                <ul className="space-y-4">
                    {notifications.map((notif) => {
                        const username = notif.senderData?.username || "Someone";
                        const message =
                            notif.type === "new_workshop"
                                ? `@${username} created a new workshop`
                                : notif.type === "new_comment"
                                    ? `@${username} commented on your recipe`
                                    : notif.type === "new_follower"
                                        ? `@${username} followed you`
                                        : notif.message;

                        return (
                            <li
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`flex items-start space-x-4 p-4 bg-gray-800 rounded-lg shadow cursor-pointer hover:bg-gray-700 transition`}
                            >
                                <Avatar>
                                    <AvatarImage src={notif.senderData?.pfp || ""} />
                                    <AvatarFallback>
                                        {username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <p className="text-white">{message}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {notif.createdAt
                                            ? formatDistanceToNow(notif.createdAt.toDate(), {
                                                addSuffix: true,
                                            })
                                            : "Just now"}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default NotificationsPage;
