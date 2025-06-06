import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { IUser } from "@/types";
import { useFollowUser } from "@/lib/react-query/queriesAndMutations.ts";
import { useUserContext } from "@/context/AuthContext.tsx";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {
    toggleUserActivation,
    toggleUserAdmin,
    toggleUserBan,
    toggleUserCreator,
    toggleUserCurator
} from "@/lib/firebase/api.ts";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {SendMessage} from "@/components/shared";

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
    const [followersCount, setFollowersCount] = useState<number>(user.followers.length);
    const [followingCount] = useState<number>(user.following.length);
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

    const handleBanUser = async () => {
        try {
            await toggleUserBan(user.id);
            console.log("User activation toggled successfully");
        } catch (error) {
            console.error("Error toggling activation:", error);
        }
    };

    const handleToggleActivation = async () => {
        try {
             await toggleUserActivation(user.id);
            console.log("User activation toggled successfully");
        } catch (error) {
            console.error("Error toggling activation:", error);
        }
    };

    const handleToggleAdmin = async () => {
        try {
            await toggleUserAdmin(user.id);
            console.log("User activation toggled successfully");
        } catch (error) {
            console.error("Error toggling activation:", error);
        }
    };

    const handleToggleCreator = async () => {
        try {
            await toggleUserCreator(user.id);
            console.log("User activation toggled successfully");
        } catch (error) {
            console.error("Error toggling activation:", error);
        }
    };

    const handleToggleCurator = async () => {
        try {
            await toggleUserCurator(user.id);
            console.log("User activation toggled successfully");
        } catch (error) {
            console.error("Error toggling activation:", error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Card
                    className={`flex-center flex-col gap-4 border bg-dark-3 border-dark-4 rounded-[20px] px-5 py-8 relative shadow-md transition-all hover:scale-[1.02] ${
                        user.isBanned || user.isDeactivated ? "border-red transition" : ""
                    }`}
                    style={{ width: "300px", height: "400px" }} // Uniform card size
                >
                    <CardHeader className="flex flex-col items-center gap-2 ">
                        <Link to={`/profile/${user.id}`}>
                            <Avatar className="w-16 h-16">
                                <AvatarImage src={user.pfp} alt={user.username} />
                                <AvatarFallback className={"bg-white text-black"}>{user.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex items-center justify-center gap-1">
                            <p className="text-light-3 text-center font-semibold truncate max-w-[180px]">
                                @{user.username}
                            </p>

                            {/* Status Icons */}
                            {user.isVerified && (
                                <img
                                    src="/assets/icons/verified.svg"
                                    alt="verified"
                                    className="w-5 h-5"
                                />
                            )}
                            {user.isCurator && (
                                <img
                                    src="/assets/icons/curator-icon.svg"
                                    alt="curator"
                                    className="w-5 h-5"
                                />
                            )}
                            {user.isAdministrator && (
                                <img
                                    src="/assets/icons/admin-icon.svg"
                                    alt="admin"
                                    className="w-5 h-5"
                                />
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-between h-full mt-2">
                        <div className="flex flex-wrap gap-5 justify-center mt-2">
                            <StatBlock value={user.recipes.length || 0} label="Recipes" />
                            <StatBlock value={user.workshops.length || 0} label="Workshops" />
                            <StatBlock value={user.challenges.length} label={"Challenges"}/>
                            <StatBlock value={isUpdating ? 0 : followersCount} label="Followers" />
                            <StatBlock value={isUpdating ? 0 : followingCount} label="Following" />
                        </div>
                    </CardContent>

                    {(user.isDeactivated || user.isBanned) && (
                        <Badge variant="destructive" className="absolute bg-red top-2 right-2">
                            Deactivated
                        </Badge>
                    )}
                </Card>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side={"right"} sideOffset={5} className={" flex-col border bg-dark-3 border-dark-4 rounded-b-[20px] rounded-t-[15px] px-5 py-8 relative shadow-md transition-all hover:scale-[1.02]"}>
                <DropdownMenuLabel className={"text-accentColor"}>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                    <Link className={"hover:text-accentColor"} to={`/profile/${user.id}`}>View User Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    {currentUser.id !== user.id && (
                        <Button type="button" size="sm" className="shad-button_primary px-5" onClick={handleFollowClick}>
                            {isFollowing ? "Unfollow" : "Follow"}
                        </Button>
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link to={`/send-message/${user.id}`}>
                        <Button type="button" size="sm" className=" rounded-xl bg-green-600 hover:bg-green-700 transition px-5">
                            Message User
                        </Button>
                    </Link>
                </DropdownMenuItem>
                {currentUser.isAdministrator && (
                    <>
                        <DropdownMenuSeparator className={"bg-dark-1"} />
                        <DropdownMenuLabel className={"text-accentColor"}>Admin Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Button type="button" size="sm" className={`rounded-xl transition  hover:bg-dark-1 bg-dark-2 ${ user.isAdministrator ? "outline-red hover:bg-red transition" : ""}`} onClick={handleToggleAdmin}>
                                {user.isAdministrator ? "Remove Admin" : "Make Admin"}
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Button type="button" size="sm" className={`rounded-xl transition hover:bg-dark-1 bg-dark-2 ${ user.isVerified ? "outline-red hover:bg-red transition" : ""}`} onClick={handleToggleCreator}>
                                {user.isVerified ? "Revoke Creator Status" : "Verify User"}
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Button type="button" size="sm" className={`rounded-xl transition hover:bg-dark-1 bg-dark-2 ${ user.isCurator ? "outline-red hover:bg-red transition" : ""}`} onClick={handleToggleCurator}>
                                {user.isCurator ? "Revoke Curator Status" : "Make Recipe Expert"}
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Button type="button" size="sm" className="rounded-xl bg-dark-2 hover:bg-red outline-red " onClick={handleBanUser}>
                                Ban User
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Button type="button" size="sm" className={`rounded-xl transition hover:bg-dark-1 bg-dark-2 ${ user.isDeactivated ? "outline-red hover:bg-red transition" : ""}`} onClick={handleToggleActivation}>
                                {user.isDeactivated ? "Reactivate Account" : "Deactivate User"}
                            </Button>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserCard;
