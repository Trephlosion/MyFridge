// src/_root/pages/CreateRecipe.tsx
import RecipeForm from "@/components/form/RecipeForm.tsx";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();

const CreateRecipe = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Upload image to Firebase Storage
    const uploadImage = async (file: File) => {
        try {
            const fileRef = ref(storage, `recipe_images/${file.name}-${Date.now()}`);
            await uploadBytes(fileRef, file);
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.error("Image Upload Error:", error);
            return null;
        }
    };

    // Create notifications for all followers
    const notifyFollowers = async (recipeId: string, recipeTitle: string) => {
        if (!user?.followers?.length) return;

        const notificationsRef = collection(database, "Notifications");

        const notifications = user.followers.map((followerId) => ({
            user_id: doc(database, "Users", followerId),
            type: "new_recipe",
            message: `${user.username} posted a new recipe: ${recipeTitle}`,
            recipeId,
            isRead: false,
            createdAt: serverTimestamp(),
        }));

        try {
            await Promise.all(notifications.map((notif) => addDoc(notificationsRef, notif)));
            console.log("Notifications sent to followers.");
        } catch (err) {
            console.error("Failed to send notifications:", err);
        }
    };

    // Handle Recipe Submit
    const handleCreateRecipe = async (recipeData: any) => {
        try {
            if (!user) {
                toast({ title: "You must be logged in to create a recipe!" });
                return;
            }

            let imageUrl = "";
            if (recipeData.file?.[0]) {
                imageUrl = await uploadImage(recipeData.file[0]) || "";
            }

            const newRecipe = {
                dish: recipeData.dish,
                description: recipeData.description,
                instructions: recipeData.instructions,
                cookTime: recipeData.cookTime,
                prepTime: recipeData.prepTime,
                serving: recipeData.serving,
                media_url: imageUrl,
                tags: recipeData.tags,
                author: `/Users/${user.id}`,
                createdAt: serverTimestamp(),
            };

            const recipeDocRef = await addDoc(collection(database, "Recipes"), newRecipe);

            toast({ title: "Recipe created successfully!" });

            // Send notifications
            await notifyFollowers(recipeDocRef.id, recipeData.dish);

            setTimeout(() => {
                navigate("/");
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
                    <img src="/assets/icons/add-post.svg" alt="Create Recipe" width={36} height={36} />
                    <h2 className="h3-bold md:h2-bold text-left w-full">Create Recipe</h2>
                </div>
                <RecipeForm onSubmit={handleCreateRecipe} />
            </div>
        </div>
    );
};

export default CreateRecipe;
