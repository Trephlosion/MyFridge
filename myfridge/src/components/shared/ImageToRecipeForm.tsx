import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import RecipeCard from "@/components/cards/RecipeCard";
import { Loader } from "@/components/shared";

const CLOUD_FUNCTION_URL = "https://us-central1-myfridge-601ec.cloudfunctions.net/generateRecipeFromImage"; // Replace with your real URL

const ImageToRecipeForm = () => {
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [recipe, setRecipe] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!image) return;

        setLoading(true);
        setRecipe(null);
        setError("");

        try {
            const formData = new FormData();
            formData.append("image", image); // name doesn’t matter, busboy just reads file

            const res = await fetch(CLOUD_FUNCTION_URL, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to generate recipe.");

            const data = await res.json();
            setRecipe(data.recipe);
        } catch (err) {
            console.error(err);
            setError("Something went wrong generating the recipe.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-dark-3 text-white w-full max-w-2xl mx-auto mt-6 rounded-2xl p-6">
            <CardHeader>
                <CardTitle>Generate Recipe from Image</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <Input type="file" accept="image/*" onChange={handleImageChange} />

                {previewUrl && (
                    <img src={previewUrl} alt="preview" className="w-full max-h-80 object-cover rounded-lg" />
                )}

                <Button onClick={handleSubmit} disabled={!image || loading}>
                    {loading ? "Generating..." : "Generate"}
                </Button>

                {loading && <Loader />}

                {error && <p className="text-red-500">{error}</p>}

                {recipe && <RecipeCard recipe={recipe} />}
            </CardContent>
        </Card>
    );
};

export default ImageToRecipeForm;
