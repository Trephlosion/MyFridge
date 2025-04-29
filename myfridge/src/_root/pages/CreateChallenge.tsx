"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { database } from "@/lib/firebase/config";
import { addDoc, collection, serverTimestamp, doc } from "firebase/firestore";
import { useUserContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast"; // 🆕 Import the Shadcn toast hook
import { format } from "date-fns"; // 🆕 Import date-fns to format dates

// Form validation schema
const formSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
    description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
    deadline: z.date({
        required_error: "Please select a deadline date",
    }),
});

const CreateChallenge = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            deadline: new Date(new Date().setDate(new Date().getDate() + 7)), // Default deadline: 7 days later
        },
    });


    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user.isVerified) {
            alert("Only verified users can create challenges.");
            return;
        }

        try {
            const newChallenge = {
                title: values.title,
                description: values.description,
                creator: doc(database, "Users", user.id),
                participants: [],
                submissions: [],
                winner: null,
                deadline: values.deadline,
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(database, "Challenges"), newChallenge);

            toast({
                title: "Challenge Created 🎉",
                description: "Your challenge has been successfully posted!",
            });

            navigate("/challenges");
        } catch (error) {
            console.error("Error creating challenge:", error);
            toast({
                variant: "destructive",
                title: "Failed to create challenge",
                description: "Please try again.",
            });
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-center text-light-1">Create a New Challenge</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Title Field */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Challenge Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Best Summer Salad" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Description Field */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Challenge Description</FormLabel>
                                <FormControl>
                                    <Input placeholder="Describe the goal of this challenge..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Deadline Field */}
                    <FormField
                        control={form.control}
                        name="deadline"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Deadline</FormLabel>

                                {/* 🆕 Show Live Preview */}
                                <p className="text-sm text-gray-400 mb-2">
                                    Selected Deadline:{" "}
                                    {field.value ? format(field.value, "MMMM d, yyyy") : "No date selected"}
                                </p>

                                <FormControl>
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        className="rounded-md border"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                        Create Challenge
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default CreateChallenge;
