import {useNavigate, useParams} from "react-router-dom";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Textarea} from "@/components/ui/textarea";
import {Loader} from "@/components/shared";
import {ProfileValidation} from "@/lib/validation";
import {useUserContext} from "@/context/AuthContext";
import {useToast} from "@/hooks/use-toast";
import {doc, getDoc, updateDoc} from "firebase/firestore";
import {database} from "@/lib/firebase/config";
import {IUser} from "@/types";
import {useEffect, useState} from "react";
import {Input} from "@/components/ui/input.tsx";


const ProfileForm = () => {
    const {toast} = useToast();
    const navigate = useNavigate();
    const {id} = useParams();
    const {user, setUser} = useUserContext() as {
        user: IUser;
        setUser: (user: IUser) => void;
    };

    const form = useForm<z.infer<typeof ProfileValidation>>({
        resolver: zodResolver(ProfileValidation),
        defaultValues: {
            username: user?.username || "",
            bio: user?.bio || "",

        },
    });

    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
    const [currentUser, setCurrentUser] = useState<IUser | null>(null);

    // Fetch the current user
    const fetchCurrentUser = async () => {
        try {
            const userDocRef = doc(database, "Users", id || "");
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                setCurrentUser({id: userSnap.id, ...userSnap.data()} as IUser);
            } else {
                toast({title: "User not found."});
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            toast({title: "Error fetching user."});
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, [id]);

    if (!currentUser) {
        return (
            <div className="flex-center w-full h-full">
                <Loader/>
            </div>
        );
    }

    // Handler to update user
    const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
        setIsLoadingUpdate(true);
        try {


            const updatedUser = {
                bio: value.bio,
                username: value.username,
            };

            const userDocRef = doc(database, "Users", currentUser.id);
            await updateDoc(userDocRef, updatedUser);

            // Update global user state
            setUser({
                ...user,
                ...updatedUser,
            });

            toast({title: "Profile updated successfully!"});
            navigate(`/profile/${id}`);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({title: "Failed to update profile. Please try again."});
        } finally {
            setIsLoadingUpdate(false);
        }
    };

    return (

        <div className="flex flex-1">
            <div className="common-container">
                <div className="flex-start gap-3 justify-start w-full max-w-5xl">
                    <img
                        src="/assets/icons/edit.svg"
                        width={36}
                        height={36}
                        alt="edit"
                        className="invert-white"
                    />
                    <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
                </div>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleUpdate)}
                        className="flex flex-col gap-7 w-full mt-4 max-w-5xl"
                    >
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input type="username" className="shad-input" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bio"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="shad-textarea custom-scrollbar"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="shad-form_message"/>
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-4 items-center justify-end">
                            <Button
                                type="button"
                                className="shad-button_dark_4"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="shad-button_primary whitespace-nowrap"
                                disabled={isLoadingUpdate}
                            >
                                {isLoadingUpdate && <Loader/>}
                                Update Profile
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default ProfileForm;
