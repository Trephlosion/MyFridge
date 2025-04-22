import React from 'react'

import { useState } from "react"; import { useNavigate } from "react-router-dom"; import { collection, addDoc, serverTimestamp } from "firebase/firestore"; import { useUserContext } from "@/context/AuthContext"; import { database } from "@/lib/firebase/config"; import { Input } from "@/components/ui/input"; import { Button } from "@/components/ui/button";

const CreateWorkshop = () => { const { user } = useUserContext(); const navigate = useNavigate();

    const [formData, setFormData] = useState({ title: "", description: "", date: "", location: "", maxParticipants: 0, media_url: "", });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const { name, value } = e.target; setFormData((prev) => ({ ...prev, [name]: name === "maxParticipants" ? Number(value) : value, })); };

    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();

        if (!user) return;

        const newWorkshop = {
            ...formData,
            date: new Date(formData.date),
            createdAt: serverTimestamp(),

            // Denormalized fields
            userId: doc(database, "Users", user.id),
            creatorUsername: user.username,
            creatorPfp: user.pfp || "/assets/icons/profile-placeholder.svg",
        };

        try {
            await addDoc(collection(database, "Workshops"), newWorkshop);
            navigate("/workshops");
        } catch (err) {
            console.error("Failed to create workshop:", err);
        }
    };

    return ( <div className="max-w-3xl mx-auto p-6 text-white"> <h1 className="text-3xl font-bold mb-6">Create Workshop</h1> <form onSubmit={handleSubmit} className="space-y-4"> <Input name="title" placeholder="Workshop Title" onChange={handleChange} required /> <textarea name="description" placeholder="Workshop Description" onChange={handleChange} className="w-full p-2 rounded bg-gray-800 border border-gray-600" required /> <Input name="date" type="datetime-local" onChange={handleChange} required /> <Input name="location" placeholder="Location" onChange={handleChange} required /> <Input name="maxParticipants" type="number" placeholder="Max Participants" onChange={handleChange} required /> <Input name="media_url" placeholder="Media URL (optional)" onChange={handleChange} /> <Button type="submit">Create Workshop</Button> </form> </div> ); };

export default CreateWorkshop;