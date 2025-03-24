import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types";
import { useFollowUser, useUpdateUser } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader } from "@/components/shared";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu.tsx";
import { MoreHorizontal } from "lucide-react";



type UserCardProps = {
    user: IUser; // Replace with a Firebase-compatible user type
};

const UserCardMini = ({ user }: UserCardProps) => {
    const { user: currentUser } = useUserContext();
    const followMutation = useFollowUser();
    const updateUserMutation = useUpdateUser();

    const [followersCount, setFollowersCount] = useState<number>(user.followers.length);
    const [followingCount, setFollowingCount] = useState<number>(user.following.length);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    const isFollowing = user.followers.includes(currentUser.id);

    const handleFollowClick = async () => {
        setIsUpdating(true);
        await followMutation.mutateAsync({
            currentUserId: currentUser.id,
            profileUserId: user.id,
            isFollowing,
        });
        setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
        setIsUpdating(false);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Card className={`user-card ${user.isBanned ? "bg-red-500" : ""}`} style={{ width: "125px", height: "125px" }}>
                    <CardContent>
                        <Link to={`/profile/${user.id}`}>
                            <div className="relative">
                                <img
                                    src={user.pfp || "/assets/icons/profile-placeholder.svg"}
                                    alt="creator"
                                    className="rounded-full w-14 h-14"
                                />
                                {user?.isVerified && (
                                    <img
                                        src="/assets/icons/verified.svg"
                                        alt="verified"
                                        className="absolute bottom-0 right-0 w-4 h-4"
                                    />
                                )}
                            </div>
                        </Link>
                        <div className="flex-center flex-col gap-1">
                            <p className="small-regular text-light-3 text-center line-clamp-1">
                                @{user.username}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className={" bg-dark-4 rounded outline-black"}>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                    <Link to={`/profile/${user.id}`}>View User Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    {currentUser.id !== user.id && (
                        <Button type="button" size="sm" className="shad-button_primary px-5" onClick={handleFollowClick}>
                            {isFollowing ? "Unfollow" : "Follow"}
                        </Button>
                    )}
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserCardMini;
