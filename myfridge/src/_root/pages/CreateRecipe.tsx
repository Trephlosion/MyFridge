import RecipeForm from "@/components/form/RecipeForm.tsx";
import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // ✅ Import Firebase Storage

const storage = getStorage(); // ✅ Initialize Firebase Storage

const CreateRecipe = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const { toast } = useToast();

    // ✅ Function to upload image & return URL
    const uploadImage = async (file) => {
        try {
            const fileRef = ref(storage, `recipe_images/${file.name}-${Date.now()}`); // ✅ Create unique filename
            await uploadBytes(fileRef, file); // ✅ Upload file to Firebase Storage
            return await getDownloadURL(fileRef); // ✅ Get downloadable URL
        } catch (error) {
            console.error("Image Upload Error:", error);
            return null; // ✅ Return null if upload fails
        }
    };

    // ✅ Function to handle recipe submission
    const handleCreateRecipe = async (recipeData) => {
        try {
            if (!user) {
                toast({ title: "You must be logged in to create a recipe!" });
                return;
            }

            let imageUrl = null;

            // ✅ Upload image if provided
            if (recipeData.file && recipeData.file[0]) {
                imageUrl = await uploadImage(recipeData.file[0]); // ✅ Get image URL
            }

            // ✅ Prepare valid Firestore document
            const newRecipe = {
                title: recipeData.dish,
                description: recipeData.description,
                instructions: recipeData.instructions,
                cookTime: recipeData.cookTime,
                prepTime: recipeData.prepTime,
                serving: recipeData.serving,
                media_url: imageUrl || "", // ✅ Save image URL (or empty if missing)
                tags: recipeData.tags,
                author: doc(database, "Users", user?.id), // ✅ Correct reference format
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(database, "Recipes"), newRecipe); // ✅ Save to Firestore
            toast({ title: "Recipe created successfully!" });

            setTimeout(() => {
                window.location.reload(); // ✅ Refresh page after submission
            }, 1000);
        } catch (error) {
            console.error("Error creating recipe:", error);
            toast({ title: "Failed to create recipe. Please try again." });
        }
    };

    return (
        <div className="flex flex-1">
            <div className="common-container">
                <div className="max-w-5l flex-start gap-3 justify-start">
                    <img
                        src="/assets/icons/add-post.svg"
                        alt="Create Recipe"
                        width={36}
                        height={36}
                    />
                    <h2 className="h3-bold md:h2-bold text-left w-full">Create Recipe</h2>
                </div>
                <RecipeForm onSubmit={handleCreateRecipe} /> {/* ✅ Pass function to RecipeForm */}
            </div>
        </div>
    );
};

export default CreateRecipe;




