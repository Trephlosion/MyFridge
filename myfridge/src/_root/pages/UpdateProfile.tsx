import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import ProfileForm from "@/components/form/ProfileForm.tsx";
import Page from "@/components/FridgeDataTables/page.tsx";


const UpdateProfile = () => {
    return (
        //TODO: CENTER THIS, MAKE TEXT LARGER, STYLE IT TO BE VISIBLE
        <Tabs defaultValue={"profile"} className={"flex flex-1 w-[400px]"}>

            <TabsList className="grid w-full grid-cols-2 text-3xl">
                <TabsTrigger value="profile">Account</TabsTrigger>
                <TabsTrigger value="fridge">MyFridge</TabsTrigger>
            </TabsList>

            <TabsContent value={"profile"}>
                <ProfileForm/>
            </TabsContent>

            <TabsContent value={"fridge"}>
                <h1>My Fridge</h1>
                <Page/>
            </TabsContent>

        </Tabs>
    );
};

export default UpdateProfile;
