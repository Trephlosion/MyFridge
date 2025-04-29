// Updating WorkshopForm.tsx (normalized, modular, clean)

import { useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileUploader from "@/components/shared/FileUploader";
import { WorkshopValidation } from "@/lib/validation";
import { useCreateWorkshop } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { database } from "@/lib/firebase/config";
import { doc } from "firebase/firestore";

interface WorkshopFormProps {
    workshop?: {
        id?: string;
        title: string;
        description: string;
        schedule: string;
        duration: number;
        location: string;
        mediaUrl: string;
        tags: string[];
    };
}

const WorkshopForm = ({ workshop }: WorkshopFormProps) => {
    const { mutateAsync: createWorkshop, isPending: isLoadingCreate } = useCreateWorkshop();
    const { user } = useUserContext();
    const { toast } = useToast();
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof WorkshopValidation>>({
        resolver: zodResolver(WorkshopValidation),
        defaultValues: {
            title: workshop?.title || "",
            description: workshop?.description || "",
            schedule: workshop?.schedule || "",
            duration: workshop?.duration?.toString() || "0",
            location: workshop?.location || "",
            file: [],
            tags: workshop?.tags?.join(",") || "",
        },
    });

    const onSubmit = async (values: z.infer<typeof WorkshopValidation>) => {
        if (!user) return;

        const preparedWorkshop = {
            ...values,
            tags: values.tags.split(",").map((tag) => tag.trim()),
            userId: doc(database, "Users", user.id),
        };

        const newWorkshop = await createWorkshop(preparedWorkshop);

        if (!newWorkshop) {
            toast({
                title: "Workshop Creation Failed",
                description: "Please try again.",
                duration: 5000,
            });
            return;
        }

        navigate("/workshops");
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
                {/* Title */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Workshop Title</FormLabel>
                            <FormControl>
                                <Input type="text" className="shad-input" {...field} />
                            </FormControl>
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
                            <FormLabel>Workshop Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Provide a brief description" className="shad-textarea custom-scrollbar" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Schedule */}
                <FormField
                    control={form.control}
                    name="schedule"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Workshop Schedule (Date & Time)</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Duration */}
                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration (in minutes)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Enter duration in minutes" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Location */}
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter location (Zoom, Campus, etc.)" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* File Upload */}
                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Upload Workshop Images/Videos</FormLabel>
                            <FormControl>
                                <FileUploader fieldChange={field.onChange} mediaUrl={workshop?.mediaUrl} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Tags */}
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags (comma separated)</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Nutrition, Wellness, Fitness" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="shad-button_primary w-full" disabled={isLoadingCreate}>
                    {isLoadingCreate ? "Creating..." : "Create Workshop"}
                </Button>
            </form>
        </Form>
    );
};

export default WorkshopForm;
