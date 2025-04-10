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
                    DropdownMenuTrigger,
                    DropdownMenuCheckboxItem
                } from "@/components/ui/dropdown-menu.tsx";
                import {
                    toggleUserActivation,
                    toggleUserAdmin,
                    toggleUserBan,
                    toggleUserCreator,
                    toggleUserCurator
                } from "@/lib/firebase/api.ts";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {AspectRatio} from "@/components/ui/aspect-ratio.tsx";
import {Badge} from "@/components/ui/badge.tsx"; // Adjust the import path as needed

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
                                    className={`user-card relative bg-dark-4 rounded-lg shadow-md p-4 transition-all hover:scale-[1.02] ${
                                        user.isBanned || user.isDeactivated ? "bg-red" : ""
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
                                            <StatBlock value={user.posts.length || 0} label="Posts" />
                                            <StatBlock value={isUpdating ? 0 : followersCount} label="Followers" />
                                            <StatBlock value={isUpdating ? 0 : followingCount} label="Following" />
                                        </div>
                                    </CardContent>

                                    {(user?.isDeactivated || user?.isBanned) && (
                                        <Badge variant="destructive" className="absolute top-2 right-2">
                                            Deactivated
                                        </Badge>
                                    )}
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
                                            onCheckedChange={() => handleToggleAdmin()}
                                        >
                                            Change Admin Status
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            className="dropdown-menu-checkbox-item"
                                            checked={user.isVerified}
                                            onCheckedChange={() => handleToggleCreator()}
                                        >
                                            Change Creator Status
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            className="dropdown-menu-checkbox-item"
                                            checked={user.isCurator}
                                            onCheckedChange={() => handleToggleCurator()}
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

                                        <DropdownMenuItem>
                                            <Link to={`/send-message/${user.id}`}>
                                                <Button type="button" size="sm" className="shad-button_primary px-5">
                                                    Message User
                                                </Button>
                                            </Link>
                                        </DropdownMenuItem>

                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                };

                export default UserCard;
