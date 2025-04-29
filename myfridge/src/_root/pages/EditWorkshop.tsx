// Now building EditWorkshop.tsx (normalized, modular)

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from "@/lib/firebase/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EditWorkshop = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        location: "",
        maxParticipants: "",
        media_url: "",
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchWorkshop = async () => {
            if (!id) return;
            try {
                const docSnap = await getDoc(doc(database, "Workshops", id));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        title: data.title || "",
                        description: data.description || "",
                        date: new Date(data.date.seconds * 1000).toISOString().slice(0, -1),
                        location: data.location || "",
                        maxParticipants: data.maxParticipants?.toString() || "",
                        media_url: data.media_url || "",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch workshop:", error);
            }
        };

        fetchWorkshop();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        try {
            setUploading(true);

            let imageUrl = formData.media_url;

            if (imageFile) {
                const imageRef = ref(storage, `workshops/${Date.now()}_${imageFile.name}`);
                await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(imageRef);
            }

            await updateDoc(doc(database, "Workshops", id), {
                title: formData.title,
                description: formData.description,
                date: new Date(formData.date),
                location: formData.location,
                maxParticipants: parseInt(formData.maxParticipants),
                media_url: imageUrl,
            });

            navigate("/workshops");
        } catch (error) {
            console.error("Failed to update workshop:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 text-white">
            <h1 className="text-3xl font-bold mb-6 text-center text-yellow-400">Edit Workshop</h1>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
                <Input
                    name="title"
                    placeholder="Workshop Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 text-white border border-gray-600"
                />

                <textarea
                    name="description"
                    placeholder="Workshop Description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded"
                    rows={4}
                    required
                />

                <Input
                    name="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 text-white border border-gray-600"
                />

                <Input
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 text-white border border-gray-600"
                />

                <Input
                    name="maxParticipants"
                    type="number"
                    min="1"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 text-white border border-gray-600"
                />

                <label className="block text-sm font-semibold text-gray-300">
                    Update Image:
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
                    {uploading ? "Updating Workshop..." : "Update Workshop"}
                </Button>
            </form>
        </div>
    );
};

export default EditWorkshop;
