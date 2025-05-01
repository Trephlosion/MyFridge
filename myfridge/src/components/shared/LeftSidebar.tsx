import {Link, NavLink, useLocation, useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {useSignOutAccount} from "@/lib/react-query/queriesAndMutations.ts";
import {useEffect} from "react";
import {INITIAL_USER, useUserContext} from "@/context/AuthContext.tsx";
import {sidebarLinks} from "@/constants";
import {INavLink} from "@/types";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";

const LeftSidebar = () => {
    const {mutate: signOut, isSuccess} = useSignOutAccount();
    const navigate = useNavigate();
    const {user, setUserContext, isLoading} = useUserContext();
    const { pathname } = useLocation();

    const handleSignOut = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
        signOut();
        setUserContext({ isAuthenticated: false, user: INITIAL_USER });
        navigate("/sign-in");
    };

    useEffect(() => {
        if(isSuccess) navigate(0);
    }, [isSuccess]);



    return (
        <nav className="leftsidebar h-screen">
            <div className="flex flex-col gap-11">
                <Link to="/" className="flex gap-3 items-center">
                    <img
                        src="/assets/images/logo.svg"
                        alt="logo"
                        width={170}
                        height={36}
                    />
                </Link>

                {isLoading || !user.email ? (
                    <div className="flex gap-3 items-center">
                        {/*<Loader/>*/}
                        <Skeleton className={"h-14 w-14 rounded-full"}/>
                        <div className="flex flex-col">
                            <Skeleton className={"h-4 w-28"}/>
                            <Skeleton className={"h-4 w-20"}/>
                        </div>


                    </div>
                ) : (
                    <>
                    <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
                        <div className={"relative"}>
                            <Avatar className="w-14 h-14">
                                <AvatarImage src={user.pfp} alt={user.username} />
                                <AvatarFallback className={"bg-white text-black "}>{user.username.charAt(0)}</AvatarFallback>
                            </Avatar>

                            {/* Status Icons */}
                            {user.isVerified && (
                                <img
                                    src="/assets/icons/verified.svg"
                                    alt="verified"
                                    className="w-4 h-4 absolute bottom-0.5 right-0"
                                />
                            )}
                            {user.isCurator && (
                                <img
                                    src="/assets/icons/curator-icon.svg"
                                    alt="curator"
                                    className="w-4 h-4 absolute bottom-0.5 right-0"
                                />
                            )}
                            {user.isAdministrator && (
                                <img
                                    src="/assets/icons/admin-icon.svg"
                                    alt="admin"
                                    className="w-4 h-4 absolute bottom-0.5 right-0"
                                />
                            )}
                        </div>
                            <div className={"flex flex-col"}>
                                <p className="right-0 small-regular text-light-3">@{user.username}</p>
                            </div>
                    </Link>

                    </>
                )}

                <ul className="flex flex-col gap-6">
                    {sidebarLinks.map((link: INavLink) => {
                        const isActive = pathname === link.route;

                        return (
                            <li
                                key={link.label}
                                className={`leftsidebar-link group ${
                                    isActive && "bg-primary-500"
                                }`}>
                                <NavLink
                                    to={link.route}
                                    className="flex gap-4 items-center p-4">
                                    <img
                                        src={link.imgURL}
                                        alt={link.label}
                                        className={`group-hover:invert-white ${
                                            isActive && "invert-white"
                                        }`}
                                    />
                                    {link.label}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <Button
                variant="ghost"
                className="shad-button_ghost"
                onClick={(e) => handleSignOut(e)}>
                <img src="/assets/icons/logout.svg" alt="logout"/>
                <p className="small-medium lg:base-medium">Logout</p>
            </Button>
        </nav>
    );
};

export default LeftSidebar;
