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
import { toggleUserActivation } from "@/lib/firebase/api"; // Adjust the import path as needed


const formatNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    const units = ["K", "M", "B", "T"];
    const order = Math.floor(Math.log10(num) / 3);
    const unitname = units[order - 1];
    const numStr = (num / Math.pow(10, order * 3)).toFixed(2);
    return `${numStr}${unitname}`;
};

interface StatBlockProps {
    value: number;
    label: string;
}

const StatBlock = ({ value, label }: StatBlockProps) => (
    <div className="flex-center gap-2">
        <p className="small-semibold lg:body-bold text-primary-500">{formatNumber(value)}</p>
        <p className="small-medium lg:base-medium text-light-2">{label}</p>
    </div>
);

type UserCardProps = {
    user: IUser; // Replace with a Firebase-compatible user type
};

const UserCard = ({ user }: UserCardProps) => {
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

    const handleToggleProperty = async (property: keyof IUser) => {
        const updatedUser = { ...user, [property]: !user[property] };
        await updateUserMutation.mutateAsync(updatedUser);
    };

    const handleBanUser = async () => {
        const updatedUser = { ...user, isBanned: true };
        await updateUserMutation.mutateAsync(updatedUser);
    };

    const handleToggleActivation = async () => {
        try {
             await toggleUserActivation(user.id);
            console.log("User activation toggled successfully");
        } catch (error) {
            console.error("Error toggling activation:", error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Card className={`user-card ${user.isBanned ? "bg-red-500" : ""}`} style={{ width: "300px", height: "400px" }}>
                    <CardHeader>
                        <Link to={`/profile/${user.id}`}>
                            <div className="relative">
                                <img
                                    src={user.pfp || "/assets/icons/profile-placeholder.svg"}
                                    alt="creator"
                                    className="rounded-full w-28 h-28"
                                />
                                {user?.isVerified && (
                                    <img
                                        src="/assets/icons/verified.svg"
                                        alt="verified"
                                        className="absolute bottom-0 right-0 w-8 h-8"
                                    />
                                )}
                            </div>
                        </Link>
                        <div className="flex-center flex-col gap-1">
                            <p className="small-regular text-light-3 text-center line-clamp-1">
                                @{user.username}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-8 mt-1 items-center justify-center xl:justify-start flex-wrap z-20">
                            <StatBlock value={user.recipes.length || 0} label="Recipes" />
                            <StatBlock value={user.posts.length || 0} label={"Posts"} />
                            <StatBlock value={isUpdating ? 0 : followersCount} label="Followers" />
                            <StatBlock value={isUpdating ? 0 : followingCount} label="Following" />
                        </div>
                    </CardContent>
                </Card>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side={"top"} className={" bg-dark-4 rounded outline-black"}>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                    <Link to={`/profile/${user.id}`}>View User Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    {currentUser.id !== user.id && (
                        <Button type="button" size="sm" className="shad-button_primary px-5" onClick={handleFollowClick}>
                            {isFollowing ? "Unfollow" : "Follow"}
                        </Button>
                    )}
                </DropdownMenuItem>
                {currentUser.isAdministrator && (
                    <>
                        <DropdownMenuSeparator className={"bg-dark-3"} />
                        <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem
                            className="dropdown-menu-checkbox-item"
                            checked={user.isAdministrator}
                            onCheckedChange={() => handleToggleProperty("isAdministrator")}
                        >
                            Change Admin Status
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            className="dropdown-menu-checkbox-item"
                            checked={user.isVerified}
                            onCheckedChange={() => handleToggleProperty("isVerified")}
                        >
                            Change Creator Status
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            className="dropdown-menu-checkbox-item"
                            checked={user.isCurator}
                            onCheckedChange={() => handleToggleProperty("isCurator")}
                        >
                            Change Curator Status
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuItem>
                            <Button type="button" size="sm" className="shad-button bg-red px-5" onClick={handleBanUser}>
                                Ban User
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Button type="button" size="sm" className="shad-button_primary px-5" onClick={handleToggleActivation}>
                                {user.isDeactivated ? "Activate User" : "Deactivate User"}
                            </Button>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserCard;
