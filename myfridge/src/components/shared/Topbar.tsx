import {Link, useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {useSignOutAccount} from "@/lib/react-query/queriesAndMutations.ts";
import {useEffect} from "react";
import {useUserContext} from "@/context/AuthContext.tsx";
import {getCurrentUser} from "@/lib/firebase/api.ts";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";

const Topbar = () => {
    const {mutate: signOut, isSuccess} = useSignOutAccount();
    const navigate = useNavigate();
    const {user} = useUserContext()


    useEffect(() => {
        if(isSuccess) navigate(0);
        }, [isSuccess])




    if (!user) {
        return <div>Loading...</div>;
    }




    return (

        <section className="topbar">
            <div className="flex-between py-4 px-5">
                <Link to="/" className="flex gap-3 items-center">
                    <img
                        src="/assets/images/logo.svg"
                        alt="logo"
                        width={130}
                        height={325}
                    />
                </Link>

                <div className="flex gap-4">
                    <Button
                        variant="ghost"
                        className="shad-button_ghost"
                        onClick={() => signOut()}>
                        <img src="/assets/icons/logout.svg" alt="logout" />
                    </Button>
                    <Link to={`/profile/${user.id}`} className="flex-center gap-3">
                        <>
                            <div className={"relative"}>
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={user.pfp} alt={user.username} />
                                    <AvatarFallback className={"bg-white text-black "}>{user.username.charAt(0)}</AvatarFallback>
                                </Avatar>

                                {/* Status Icons */}
                                {user.isVerified && (
                                    <img
                                        src="/assets/icons/verified.svg"
                                        alt="verified"
                                        className="w-2.5 h-2.5 absolute bottom-0.5 right-0"
                                    />
                                )}
                                {user.isCurator && (
                                    <img
                                        src="/assets/icons/curator-icon.svg"
                                        alt="curator"
                                        className="w-2.5 h-2.5 absolute bottom-0.5 right-0"
                                    />
                                )}
                                {user.isAdministrator && (
                                    <img
                                        src="/assets/icons/admin-icon.svg"
                                        alt="admin"
                                        className="w-2.5 h-2.5 absolute bottom-0.5 right-0"
                                    />
                                )}
                            </div>

                                <p className="small-regular text-light-3">@{user.username}</p>
                        </>
                    </Link>
                </div>
            </div>
        </section>
    );
};
export default Topbar
