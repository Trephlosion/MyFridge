// src/components/shared/Notifications.tsx
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "@/components/shared/NotificationItem";
import { Loader } from "@/components/shared";
import { useEffect } from "react";

const Notifications = () => {
    const { notifications, loading, markAsRead } = useNotifications();

    useEffect(() => {
        // Auto-mark all unread notifications as read after component mounts
        notifications.forEach((notification) => {
            if (!notification.isRead) {
                markAsRead(notification.id);
            }
        });
    }, [notifications, markAsRead]);

    if (loading) return <Loader />;

    return (
        <div className="w-full max-w-3xl mx-auto p-4 text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">Notifications</h2>
    {notifications.length === 0 ? (
        <p className="text-center text-gray-400">No notifications yet.</p>
    ) : (
        <ul className="space-y-4">
            {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                notification={notification}
                onMarkAsRead={() => markAsRead(notification.id)}
        />
    ))}
        </ul>
    )}
    </div>
);
};

export default Notifications;
