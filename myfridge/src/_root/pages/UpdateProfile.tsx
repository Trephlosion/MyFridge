import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/form/ProfileForm.tsx";
import FridgeForm from "@/components/form/FridgeForm.tsx";
import { useGetAllFridgeIngredients, useGetUserById } from "@/lib/react-query/queriesAndMutations.ts";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext.tsx";
import { Button } from "@/components/ui/button";

const UpdateProfile = () => {
    const { user } = useUserContext(); // Authenticated user context
    const navigate = useNavigate();

    // This function should include any saving logic if necessary.
    // For this example, we assume that the ProfileForm and FridgeForm save changes automatically,
    // so we simply navigate back to the profile page.
    const handleUpdateProfile = async () => {
        // Optionally, add any save logic here (e.g. call an API to update the user profile)
        navigate(`/profile/${user.id}`);
    };

    return (
        <>
            <Tabs defaultValue={"profile"} className={"flex flex-1 flex-col items-center"}>
                <TabsList className="flex max-w-5xl w-full justify-center mb-4">
                    <TabsTrigger
                        value="profile"
                        className={`profile-tab rounded-l-lg !bg-dark-3 h3-bold md:h2-bold text-center`}
                    >
                        Account
                    </TabsTrigger>
                    <TabsTrigger
                        value="fridge"
                        className={`profile-tab rounded-r-lg !bg-dark-3 h3-bold md:h2-bold text-center`}
                    >
                        MyFridge
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={"profile"} className="w-full max-w-5xl">
                    <ProfileForm />
                </TabsContent>

                <TabsContent value={"fridge"} className="w-full max-w-5xl">
                    <FridgeForm />
                </TabsContent>
            </Tabs>
            <div className="flex justify-end mt-4">
                <Button type="button" className="shad-button_dark_4" onClick={handleUpdateProfile}>
                    Update Profile
                </Button>
            </div>
        </>
    );
};

export default UpdateProfile;
