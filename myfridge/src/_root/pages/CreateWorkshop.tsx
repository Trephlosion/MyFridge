"use client"

// Usage
// This component renders a workshop creation form using react-hook-form, Zod for validation, and Shadcn UI primitives.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { database, storage } from "@/lib/firebase/config";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

// 1. Create a form schema
const workshopFormSchema = z.object({
    title: z.string().min(2, { message: "Title must be at least 2 characters." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    date: z.string().nonempty({ message: "Date & time is required." }),
    location: z.string().nonempty({ message: "Location is required." }),
    maxParticipants: z
        .number({ invalid_type_error: "Max participants must be a number." })
        .min(1, { message: "At least one participant is required." }),
});

type WorkshopFormValues = z.infer<typeof workshopFormSchema>;

export default function CreateWorkshop() {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // 2. Define a form
    const form = useForm<WorkshopFormValues>({
        resolver: zodResolver(workshopFormSchema),
        defaultValues: {
            title: "",
            description: "",
            date: "",
            location: "",
            maxParticipants: 1,
        },
    });

    async function onSubmit(values: WorkshopFormValues) {
        if (!user) return;
        setUploading(true);

        let imageUrl = "";
        if (imageFile) {
            const imageRef = ref(
                storage,
                `workshops/${Date.now()}_${imageFile.name}`
            );
            await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(imageRef);
        }

        // Reference to the user document
        const userRef = doc(database, "Users", user.id);
        const userSnap = await getDoc(userRef);
        const creatorData = userSnap.data();
        if (!creatorData) throw new Error("Creator data not found.");

        // Prepare workshop data
        const workshopData = {
            title: values.title,
            description: values.description,
            date: new Date(values.date),
            location: values.location,
            maxParticipants: values.maxParticipants,
            createdAt: serverTimestamp(),
            media_url: imageUrl,
            userId: userRef,
        };

        // Create workshop document
        const workshopRef = await addDoc(
            collection(database, "Workshops"),
            workshopData
        );

        // 4. Add reference to user's workshops array
        await updateDoc(userRef, {
            workshops: arrayUnion(workshopRef),
        });

        // Notify followers (optional)
        if (Array.isArray(creatorData.followers)) {
            const notifRef = collection(database, "Notifications");
            await Promise.all(
                creatorData.followers.map(async (fId: string) => {
                    await addDoc(notifRef, {
                        user_id: userRef,
                        followerId: fId,
                        type: "new_workshop",
                        message: `@${creatorData.username} created a new workshop`,
                        workshopId: workshopRef.id,
                        media_url: imageUrl,
                        isRead: false,
                        createdAt: new Date(),
                    });
                })
            );
        }

        setUploading(false);
        navigate("/workshops");
    }

    // 3. Build your form
    return (
        <div className="max-w-xl mx-auto p-8 text-white">
            <h1 className="text-2xl font-semibold text-center mb-6 text-yellow-400">
                Create a New Workshop
            </h1>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="bg-gray-800 p-6 rounded-2xl shadow-lg space-y-8"
                >
                    {/* Title */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">Title</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Workshop title"
                                        {...field}
                                        className="bg-gray-700 text-white border border-gray-600 rounded-lg"
                                    />
                                </FormControl>
                                <FormDescription className="text-gray-300">
                                    A concise, descriptive title for your workshop.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Description */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Workshop description"
                                        rows={4}
                                        {...field}
                                        className="bg-gray-700 text-white border border-gray-600 rounded-lg"
                                    />
                                </FormControl>
                                <FormDescription className="text-gray-300">
                                    Provide an overview and objectives for participants.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Date Picker & Max Participants */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => {
                                const selectedDate = field.value ? new Date(field.value) : undefined;
                                return (
                                    <FormItem>
                                        <FormLabel className="text-white">Date & Time</FormLabel>
                                        <FormControl>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal bg-gray-700 border border-gray-600 rounded-lg",
                                                            !selectedDate ? "text-gray-400" : "text-white"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4 text-yellow-400" />
                                                        {selectedDate
                                                            ? format(selectedDate, "PPP p")
                                                            : <span>Pick date & time</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={selectedDate}
                                                        onSelect={(date) => date && field.onChange(date.toISOString())}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                        <FormDescription className="text-gray-300">
                                            When the workshop will take place.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        <FormField
                            control={form.control}
                            name="maxParticipants"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Max Participants</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            {...field}
                                            onChange={(e) => field.onChange(+e.target.value)}
                                            className="bg-gray-700 text-white border border-gray-600 rounded-lg"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-gray-300">
                                        The maximum number of attendees allowed.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Location */}
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">Location</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Zoom link, campus room, etc."
                                        {...field}
                                        className="bg-gray-700 text-white border border-gray-600 rounded-lg"
                                    />
                                </FormControl>
                                <FormDescription className="text-gray-300">
                                    Specify where participants should join.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Image Upload */}
                    <div>
                        <FormLabel className="block mb-2 text-white">Upload Image</FormLabel>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                e.target.files && setImageFile(e.target.files[0])
                            }
                            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-white hover:file:bg-yellow-600 rounded-lg"
                        />
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg"
                    >
                        {uploading ? "Creating..." : "Create Workshop"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
