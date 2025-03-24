import {Link, useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {useSignOutAccount} from "@/lib/react-query/queriesAndMutations.ts";
import {useEffect} from "react";
import {useUserContext} from "@/context/AuthContext.tsx";
import {getCurrentUser} from "@/lib/firebase/api.ts";

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
                        <div className="relative">
                            <img
                                src={user.pfp || "/assets/icons/profile-placeholder.svg"}
                                alt="creator"
                                className="rounded-full w-8 h-8"
                            />
                            {user?.isVerified && (
                                <img
                                    src="/assets/icons/verified.svg"
                                    alt="verified"
                                    className="absolute bottom-0 right-0 w-2 h-2"
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
