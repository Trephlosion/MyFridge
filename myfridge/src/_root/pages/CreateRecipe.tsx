import RecipeForm from "@/components/form/RecipeForm.tsx";
import { collection, addDoc, serverTimestamp, getDocs, query, where,doc  } from "firebase/firestore";
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
            const fileRef = ref(storage, `recipe_images/${file.name}-${Date.now()}`); // ✅ Create unique filename
            await uploadBytes(fileRef, file); // ✅ Upload file to Firebase Storage
            return await getDownloadURL(fileRef); // ✅ Get downloadable URL
        } catch (error) {
            console.error("Image Upload Error:", error);
            return null; // ✅ Return null if upload fails
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

            // After uploading media, prepare new recipe:
            const newRecipeRef = await addDoc(collection(database, "Recipes"), {
                title: recipeData.title,
                description: recipeData.description,
                instructions: recipeData.instructions,
                ingredients: recipeData.ingredients,
                cookTime: recipeData.cookTime,
                prepTime: recipeData.prepTime,
                servings: recipeData.servings,
                mediaUrl: imageUrl || "",
                tags: recipeData.tags,
                author: doc(database, "Users", user.id),
                createdAt: serverTimestamp(),
            });

// ✅ Add reference to user's recipe array
            const userRef = doc(database, "Users", user.id);
            await updateDoc(userRef, {
                recipes: arrayUnion(newRecipeRef),
            });
            const recipeDocRef = await addDoc(collection(database, "Recipes"), newRecipe);

            await addDoc(collection(database, "Recipes"), newRecipe); // ✅ Save to Firestore
            toast({ title: "Recipe created successfully!" });

            // Send notifications
            await notifyFollowers(recipeDocRef.id, recipeData.dish);

            setTimeout(() => {
                navigate("/"); // ✅ Refresh page after submission
            }, 1000);
        } catch (error) {
            console.error("Error creating recipe:", error);
            toast({ title: "Failed to create recipe. Please try again." });
        }
    };

    return (
        <div className="flex flex-1">
            <div className="common-container">
                <div className="max-w-5l flex-start gap-3 justify-start h-full">
                    <img
                        src="/assets/icons/add-post.svg"
                        alt="Create Recipe"
                        width={36}
                        height={36}
                    />
                    <h2 className="h3-bold md:h2-bold text-left w-full">Create Recipe</h2>
                </div>

                <RecipeForm /> {/* ✅ Pass function to RecipeForm */}
            </div>
        </div>
    );
};

export default CreateRecipe;




