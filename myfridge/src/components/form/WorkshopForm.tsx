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
import { Textarea } from "@/components/ui/textarea.tsx";
import FileUploader from "@/components/shared/FileUploader.tsx";
import { WorkshopValidation } from "@/lib/validation";
import { useCreateWorkshop } from "@/lib/react-query/queriesAndMutations.ts";
import { useUserContext } from "@/context/AuthContext.tsx";
import { useToast } from "@/hooks/use-toast.ts";

type WorkshopFormProps = {
    workshop?: {
        id?: string;
        title: string;
        description: string;
        schedule: string;
        duration: number;
        location: string;
        imageUrl: string;
        tags: string[];
    };
};

const WorkshopForm = ({ workshop }: WorkshopFormProps) => {
    const { mutateAsync: createWorkshop, isPending: isLoadingCreate } = useCreateWorkshop();
    const { user } = useUserContext();
    const { toast } = useToast();
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof WorkshopValidation>>({
        resolver: zodResolver(WorkshopValidation),
        defaultValues: {
            title: workshop ? workshop.title : "",
            description: workshop ? workshop.description : "",
            schedule: workshop ? workshop.schedule : "",
            duration: workshop ? workshop.duration.toString() : "0",
            location: workshop ? workshop.location : "",
            file: [],
            tags: workshop ? workshop.tags.join(",") : "",
        },
    });

    async function onSubmit(values: z.infer<typeof WorkshopValidation>) {
        const newWorkshop = await createWorkshop({
            ...values,
            userId: user.id,
            tags: values.tags.split(",").map(tag => tag.trim()),
        });

        if (!newWorkshop) {
            toast({
                title: "Workshop Creation Failed",
                description: "Please try again",
                duration: 5000,
            });
            return;
        }

        console.log(values);
        navigate("/");
    }

    return (
        <Form {...form}>
            <Form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
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

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form-label">Workshop Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Provide a brief workshop description" {...field} className="shad-textarea custom-scrollbar" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter workshop location" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form-label">Upload Workshop Images/Videos</FormLabel>
                            <FormControl>
                                <FileUploader fieldChange={field.onChange} mediaUrl={workshop?.imageUrl} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


