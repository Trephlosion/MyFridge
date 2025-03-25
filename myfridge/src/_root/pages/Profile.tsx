import { useState, useEffect } from "react";
import { useNavigate, useParams, Link, Outlet, useLocation, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LikedRecipes } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import { GridRecipeList, Loader } from "@/components/shared";
import { DataTable, FridgeColumns } from "@/components/DataTables";
import {
    useGetUserById,
    useFollowUser,
    useGetAllFridgeIngredients
} from "@/lib/react-query/queriesAndMutations";
import { IUser } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FridgeForm from "@/components/form/FridgeForm";

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

const Profile = () => {
    const { id } = useParams(); // The profile user's ID
    const { user } = useUserContext(); // Authenticated user context
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const { data: currentUser, isLoading } = useGetUserById(id || "");
    const followMutation = useFollowUser();

    const [followersCount, setFollowersCount] = useState<number>(0);
    const [followingCount, setFollowingCount] = useState<number>(0);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    const { data: fridge, isLoading: isFridgeLoading } = useGetAllFridgeIngredients(user.id);

    useEffect(() => {
        if (currentUser) {
            setFollowersCount(currentUser.followers.length);
            setFollowingCount(currentUser.following.length);
        }
    }, [currentUser]);

    if (isLoading || isFridgeLoading || !currentUser)
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );

    const isFollowing = currentUser.followers.includes(user.id);

    const handleFollowClick = async () => {
        setIsUpdating(true);
        await followMutation.mutateAsync({
            currentUserId: user.id,
            profileUserId: currentUser.id,
            isFollowing,
        });
        setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
        setIsUpdating(false);
    };

    return (
        <div className="profile-container">
            <div className="profile-inner_container">
                <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
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
                    <div className="flex flex-col flex-1 justify-between md:mt-2">
                        <div className="flex flex-col w-full">
                            <h1 className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                                @{currentUser.username}
                            </h1>
                        </div>
                        <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
                            <StatBlock value={currentUser.recipes.length || 0} label="Recipes" />
                            <StatBlock value={currentUser.posts.length || 0} label={"Posts"} />
                            <StatBlock value={isUpdating ? 0 : followersCount} label="Followers" />
                            <StatBlock value={isUpdating ? 0 : followingCount} label="Following" />
                        </div>
                        <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
                            {currentUser.bio}
                        </p>
                    </div>
                    <div className="flex justify-center gap-4">
                        {/* Edit Profile Button */}
                        {user.id === currentUser.id && (
                            <Link
                                to={`/update-profile/${currentUser.id}`}
                                className="h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg"
                            >
                                <img
                                    src={"/assets/icons/edit.svg"}
                                    alt="edit"
                                    width={20}
                                    height={20}
                                />
                                <p className="flex whitespace-nowrap small-medium">Edit Profile</p>
                            </Link>
                        )}
                        {/* Follow Button */}
                        {user.id !== currentUser.id && (
                            <Button type="button" className="shad-button_primary px-8" onClick={handleFollowClick}>
                                {isFollowing ? "Unfollow" : "Follow"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs for Recipes, Liked Recipes, and MyFridge */}
            <Tabs defaultValue={"recipes"} className={"flex flex-1 flex-col items-center"}>
                <TabsList className="flex max-w-5xl w-full justify-center mb-4">
                    <TabsTrigger value="recipes" className={`profile-tab rounded-l-lg !bg-dark-3 h3-bold md:h2-bold text-center`}>MyRecipes</TabsTrigger>
                    <TabsTrigger value="liked-recipes" className={`profile-tab !bg-dark-3 h3-bold md:h2-bold text-center`}>Liked Recipes</TabsTrigger>
                    {user.id === currentUser.id && (
                    <TabsTrigger value="fridge" className={`profile-tab rounded-r-lg !bg-dark-3 h3-bold md:h2-bold text-center`}>MyFridge</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value={"recipes"} className="w-full max-w-5xl">
                    <GridRecipeList recipes={currentUser.recipes} showUser={false} />
                </TabsContent>

                <TabsContent value={"liked-recipes"} className="w-full max-w-5xl">
                    <LikedRecipes />
                </TabsContent>

                {/*{user.id === currentUser.id && (
                    <>
                        <TabsContent value={"fridge"} className="w-full max-w-5xl">
                            <FridgeForm />
                        </TabsContent>
                    </>
                )}*/}
            </Tabs>

            <Outlet />
        </div>
    );
};

export default Profile;
