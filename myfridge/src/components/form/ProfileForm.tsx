import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/shared";
import { ProfileValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { IUser } from "@/types";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase/config";

const ProfileForm = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, setUser } = useUserContext() as {
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
    const [pfpFile, setPfpFile] = useState<File | null>(null);

    const fetchCurrentUser = async () => {
        try {
            const userDocRef = doc(database, "Users", id || "");
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                setCurrentUser({ id: userSnap.id, ...userSnap.data() } as IUser);
            } else {
                toast({ title: "User not found." });
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            toast({ title: "Error fetching user." });
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, [id]);

    const uploadProfilePicture = async (file: File): Promise<string | null> => {
        try {
            const fileRef = ref(storage, `profile_pictures/${file.name}-${Date.now()}`);
            await uploadBytes(fileRef, file);
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.error("Profile picture upload error:", error);
            return null;
        }
    };

    const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
        setIsLoadingUpdate(true);
        try {
            let pfpUrl = currentUser?.pfp || "";

            if (pfpFile) {
                const uploadedUrl = await uploadProfilePicture(pfpFile);
                if (uploadedUrl) pfpUrl = uploadedUrl;
            }

            const updatedUser = {
                bio: value.bio,
                username: value.username,
                pfp: pfpUrl,
            };

            const userDocRef = doc(database, "Users", currentUser.id);
            await updateDoc(userDocRef, updatedUser);

            setUser({ ...user, ...updatedUser });
            toast({ title: "Profile updated successfully!" });
            navigate(`/profile/${id}`);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({ title: "Failed to update profile. Please try again." });
        } finally {
            setIsLoadingUpdate(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );
    }

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
                                        <Input type="text" className="shad-input" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="shad-textarea custom-scrollbar"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormItem>
                            <FormLabel>Upload Profile Picture</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="shad-input"
                                    onChange={(e) => setPfpFile(e.target.files?.[0] || null)}
                                />
                            </FormControl>
                        </FormItem>

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
                                {isLoadingUpdate && <Loader />}
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
