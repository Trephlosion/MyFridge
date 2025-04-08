// src/_root/pages/NotificationsPage.tsx

import React from "react";
import NotificationItem from "@/components/shared/notifications/NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";
import { Loader } from "@/components/shared";

const NotificationsPage = () => {
    const { notifications, loading } = useNotifications();

    console.log("Fetched notifications:", notifications);

    return (
        <div className="p-6 max-w-4xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-6">Notifications</h1>

            {loading ? (
                <Loader />
            ) : notifications.length === 0 ? (
                <p className="text-gray-400">You have no notifications.</p>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <NotificationItem
                            key={notif.id}
                            id={notif.id}
                            type={notif.type}
                            message={notif.message || "No message found in notification."}
                            recipeId={notif.recipeId}
                            isRead={notif.isRead}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
