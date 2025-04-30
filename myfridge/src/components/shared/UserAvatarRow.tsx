import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {getDoc, DocumentReference, doc, Timestamp} from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { multiFormatDateString } from "@/lib/utils";
import { IUser } from "@/types";
import { database } from "@/lib/firebase/config";
import {ensureUserRef, resolveUserRef} from "@/lib/firebase/api"

interface UserAvatarRowProps {
    user: IUser | DocumentReference;
    dateString?: Timestamp; // Optional, for showing creation date
}

const UserAvatarRow = ({ user, dateString }: UserAvatarRowProps) => {
    const [userInfo, setUserInfo] = useState<IUser | null>(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                if (user && typeof user === "object" && "username" in user) {
                    setUserInfo(user as IUser);
                    return;
                }

                const userRef = resolveUserRef(user);
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                    setUserInfo({ id: snap.id, ...(snap.data() as IUser) });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserInfo();
    }, [user]);

    if (!userInfo) return null;

    return (
        <Link to={`/profile/${userInfo.id}`} className="flex items-center gap-3">
            <Avatar className="w-16 h-16">
                <AvatarImage src={userInfo.pfp} alt={userInfo.username} />
                <AvatarFallback className="bg-white text-black">
                    {userInfo.username?.charAt(0) ?? ""}
                </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
                <div className="flex items-center gap-1">
                    <p className="text-light-3 font-semibold truncate max-w-[180px]">
                        @{userInfo.username}
                    </p>

                    {userInfo.isVerified && (
                        <img src="/assets/icons/verified.svg" alt="verified" className="w-5 h-5" />
                    )}
                    {userInfo.isCurator && (
                        <img src="/assets/icons/curator-icon.svg" alt="curator" className="w-5 h-5" />
                    )}
                    {userInfo.isAdministrator && (
                        <img src="/assets/icons/admin-icon.svg" alt="admin" className="w-5 h-5" />
                    )}
                </div>
                {dateString && (
                    <p className="text-xs text-gray-500">{multiFormatDateString(dateString)}</p>
                )}
            </div>
        </Link>
    );
};

export default UserAvatarRow;
