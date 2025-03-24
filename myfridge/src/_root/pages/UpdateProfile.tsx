import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import ProfileForm from "@/components/form/ProfileForm.tsx";
import FridgeForm from "@/components/form/FridgeForm.tsx";
import {DataTable, FridgeColumns} from "@/components/DataTables";
import {useGetAllFridgeIngredients, useGetUserById} from "@/lib/react-query/queriesAndMutations.ts";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useUserContext} from "@/context/AuthContext.tsx";


const UpdateProfile = () => {

    const { user } = useUserContext(); // Authenticated user context



    const { data: fridge, isLoading: isFridgeLoading } = useGetAllFridgeIngredients(user.id);


    return (
        //TODO: CENTER THIS, MAKE TEXT LARGER, STYLE IT TO BE VISIBLE
        <Tabs defaultValue={"profile"} className={"flex flex-1 flex-col items-center"}>
            <TabsList className="flex max-w-5xl w-full justify-center mb-4">
                <TabsTrigger value="profile" className={`profile-tab rounded-l-lg !bg-dark-3 h3-bold md:h2-bold text-center`}>Account</TabsTrigger>
                <TabsTrigger value="fridge" className={`profile-tab rounded-r-lg !bg-dark-3 h3-bold md:h2-bold text-center`}>MyFridge</TabsTrigger>
            </TabsList>

            <TabsContent value={"profile"} className="w-full max-w-5xl">
                <ProfileForm />
            </TabsContent>

            <TabsContent value={"fridge"} className="w-full max-w-5xl">
                <FridgeForm />

                
            </TabsContent>
        </Tabs>
    );
};

export default UpdateProfile;
