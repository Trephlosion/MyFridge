// Now fixing CreateWorkshop.tsx (normalized)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUserContext } from "@/context/AuthContext";
import { database, storage } from "@/lib/firebase/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CreateWorkshop = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        location: "",
        maxParticipants: "",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setUploading(true);
            let imageUrl = "";

            if (imageFile) {
                const imageRef = ref(storage, `workshops/${Date.now()}_${imageFile.name}`);
                await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(imageRef);
            }

            const newWorkshop = {
                title: formData.title,
                description: formData.description,
                date: new Date(formData.date),
                location: formData.location,
                maxParticipants: parseInt(formData.maxParticipants),
                createdAt: serverTimestamp(),
                media_url: imageUrl,
                userId: doc(database, "Users", user.id),
            };

            await addDoc(collection(database, "Workshops"), newWorkshop);
            navigate("/workshops");
        } catch (error) {
            console.error("Failed to create workshop:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 text-white">
            <h1 className="text-3xl font-bold mb-6 text-center text-yellow-400">Create a New Workshop</h1>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
                <Input
                    name="title"
                    placeholder="Workshop Title"
                    onChange={handleChange}
                    required
                    className="bg-gray-700 text-white border border-gray-600"
                />

                <textarea
                    name="description"
                    placeholder="Workshop Description"
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded"
                    rows={4}
                    required
                />

                <Input
                    name="date"
                    type="datetime-local"
                    onChange={handleChange}
                    required
                    className="bg-gray-700 text-white border border-gray-600"
                />

                <Input
                    name="location"
                    placeholder="Location (Zoom, Campus, etc.)"
                    onChange={handleChange}
                    required
                    className="bg-gray-700 text-white border border-gray-600"
                />

                <Input
                    name="maxParticipants"
                    type="number"
                    min="1"
                    placeholder="Max Participants"
                    onChange={handleChange}
                    required
                    className="bg-gray-700 text-white border border-gray-600"
                />

                <label className="block text-sm font-semibold text-gray-300">
                    Upload an Image:
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-white hover:file:bg-yellow-600"
                />

                <Button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                    {uploading ? "Creating Workshop..." : "Create Workshop"}
                </Button>
            </form>
        </div>
    );
};

export default CreateWorkshop;
