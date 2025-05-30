import { useState, useEffect } from "react";
import {useParams, Link, Outlet, useNavigate} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Inbox } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import {GridRecipeList, Loader, LoadingRecipe, GridChallengeList, SendMessage} from "@/components/shared";
import { DataTable, FridgeColumns } from "@/components/DataTables";
import {
    useGetUserById,
    useFollowUser,
    useGetAllFridgeIngredients
} from "@/lib/react-query/queriesAndMutations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { onSnapshot } from "firebase/firestore";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import { useGetUserRecipes } from "@/lib/react-query/queriesAndMutations";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";
import FridgeForm from "@/components/form/FridgeForm.tsx";

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
    const navigate = useNavigate();
    const [myFridge, setMyFridge] = useState([]);
    const { data: currentUser, isLoading } = useGetUserById(id || "");
    const followMutation = useFollowUser();
    const [followersCount, setFollowersCount] = useState<number>(0);
    const [followingCount, setFollowingCount] = useState<number>(0);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const { data: profileUserRecipes, isLoading: isLoadingRecipes } = useGetUserRecipes(currentUser?.id);
    const { data: fridge, isLoading: isFridgeLoading } = useGetAllFridgeIngredients(user.myFridge);

    useEffect(() => {
        if (currentUser) {
            setFollowersCount(currentUser.followers.length);
            setFollowingCount(currentUser.following.length);
        }

        let unsub = () => {};
        if (user.myFridge) {
            unsub = onSnapshot(user.myFridge, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setMyFridge(data.ingredients || []);
                } else {
                    setMyFridge([]);
                }
            });
        }

        return () => {
            unsub();
        };
    }, [currentUser, user.myFridge]);

    if (isLoading || isFridgeLoading) return (<>
        <p className="text-center text-light-4 mt-10">Loading Recipe...</p>
        <div className="flex justify-center items-center h-screen">
            <Loader />
        </div>
    </>);

    if (!currentUser) return (<>
        <p className="text-center text-light-4 mt-10">An Error has occurred loading a user, try visiting the page again.</p>
        <Button
            onClick={() => navigate("/all-users")}
            className="mb-4 text-sm text-yellow-400 hover:bg-red transition"
        >
            ← Back to People
        </Button>
    </>);

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

    console.log("currentUser.recipes", currentUser.recipes)

    return (
        <div className="profile-container bg-dark-4">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link className={"hover:text-accentColor"} to="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link className={"hover:text-accentColor"} to="/all-users">People</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink>@{currentUser.username}</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="profile-inner_container -m-2 p-2">
                <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7 ">
                    <div className={"relative"}>
                    <Avatar className="w-28 h-28">
                        <AvatarImage src={currentUser.pfp} alt={currentUser.username} />
                        <AvatarFallback className={"bg-white text-black text-2xl"}>{currentUser.username.charAt(0)}</AvatarFallback>
                    </Avatar>

                        {/* Status Icons */}
                        {currentUser.isVerified && (
                            <img
                                src="/assets/icons/verified.svg"
                                alt="verified"
                                className="w-9 h-9 absolute bottom-0.5 right-0"
                            />
                        )}
                        {currentUser.isCurator && (
                            <img
                                src="/assets/icons/curator-icon.svg"
                                alt="curator"
                                className="w-9 h-9 absolute bottom-0.5 right-0"
                            />
                        )}
                        {currentUser.isAdministrator && (
                            <img
                                src="/assets/icons/admin-icon.svg"
                                alt="admin"
                                className="w-9 h-9 absolute bottom-0.5 right-0 "
                            />
                        )}
                    </div>
                    <div className="flex flex-col flex-1 justify-between md:mt-2">

                            <div className="flex flex-row w-full items-center justify-left gap-1">
                                <h1 className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                                    @{currentUser.username}
                                </h1>

                            </div>

                        <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
                            <StatBlock value={currentUser.recipes.length} label="Recipes" />
                            <StatBlock value={currentUser.workshops.length} label={"Workshops"} />
                            <StatBlock value={currentUser.challenges.length} label={"Challenges"} />
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
                                className="h-12 bg-dark-2 px-5 text-light-1 flex-center gap-2 rounded-lg"
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
                            <>
                            <Button type="button" className="shad-button_primary px-8" onClick={handleFollowClick}>
                                {isFollowing ? "Unfollow" : "Follow"}
                            </Button>

                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs for Recipes, Liked Recipes, and MyFridge */}
            {currentUser.isBanned || currentUser.isDeactivated ? (
                <div className="text-red text-center mt-10 text-xl font-semibold">
                    The user you are trying to view is {currentUser.isBanned ? "banned." : "deactivated."}.
                </div>
            ) : (
                <Tabs defaultValue={"recipes"} className={"flex flex-1 flex-col items-center"}>
                    <TabsList className="flex max-w-5xl w-full justify-center mb-4">
                        <TabsTrigger value="recipes" className={`profile-tab rounded-l-lg !bg-dark-3 h3-bold md:h2-bold text-center`}>MyRecipes</TabsTrigger>
                        <TabsTrigger value="liked-recipes" className={`profile-tab !bg-dark-3 h3-bold md:h2-bold text-center`}>Liked Recipes</TabsTrigger>
                        <TabsTrigger value={"challenges"} className={`profile-tab !bg-dark-3 h3-bold md:h2-bold text-center`}>Challenges</TabsTrigger>
                        {user.id === currentUser.id && (
                            <>
                                <TabsTrigger value={"inbox"} className={`profile-tab !bg-dark-3 h3-bold md:h2-bold text-center`}>Inbox</TabsTrigger>
                                <TabsTrigger value="fridge" className={`profile-tab rounded-r-lg !bg-dark-3 h3-bold md:h2-bold text-center`}>MyFridge</TabsTrigger>
                            </>
                        )}
                    </TabsList>

                    <TabsContent value={"recipes"} className="w-full max-w-5xl">
                        {isLoadingRecipes ? (
                            <LoadingRecipe />
                        ) : (
                            <>
                                {currentUser.recipes.length === 0 && (
                                    <p className="text-light-4">I have no Recipes!</p>
                                )}

                                <GridRecipeList recipes={currentUser.recipes} />
                            </>

                        )}
                    </TabsContent>

                    <TabsContent value={"liked-recipes"} className="w-full max-w-5xl">
                        <>
                            {currentUser.likedRecipes.length === 0 && (
                                <p className="text-light-4">No liked recipes</p>
                            )}

                            <GridRecipeList recipes={currentUser.likedRecipes} />
                        </>
                    </TabsContent>

                    <TabsContent value={"challenges"} className="w-full max-w-5xl">
                        <>
                            <GridChallengeList challenges={currentUser.challenges}/>
                        </>
                    </TabsContent>

                    {user.id === currentUser.id && (
                        <>
                            <TabsContent value={"inbox"} className="w-full max-w-5xl">
                                <div className="mb-4 flex justify-end">
                                   <Inbox/>
                                </div>
                            </TabsContent>

                            <TabsContent value={"fridge"} className="w-full max-w-5xl">
                                <div>
                                    <FridgeForm />
                                </div>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            )}
            <Outlet />
        </div>
    );
};

export default Profile;
