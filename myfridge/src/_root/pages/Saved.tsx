import { useEffect, useState } from "react";
import { GridRecipeList, Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";
import { getDoc, doc } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { Recipe } from "@/types";

const Saved = () => {
    const { data: currentUser } = useGetCurrentUser();
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Fetch saved recipes
    useEffect(() => {
        const fetchSavedRecipes = async () => {
            if (!currentUser?.id || !currentUser.likedRecipes?.recipes) return;

            try {
                const recipes: Recipe[] = [];
                for (const recipeId of currentUser.likedRecipes.recipes) {
                    const recipeRef = doc(database, "Recipe", recipeId);
                    const recipeSnap = await getDoc(recipeRef);
                    if (recipeSnap.exists()) {
                        recipes.push({
                            id: recipeSnap.id,
                            ...recipeSnap.data(),
                        } as Recipe);
                    }
                }
                setSavedRecipes(recipes.reverse());
            } catch (error) {
                console.error("Error fetching saved recipes:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSavedRecipes();
    }, [currentUser]);

    return (
        <div className="saved-container">
            {/* Header */}
            <div className="flex gap-2 w-full max-w-5xl">
                <img
                    src="/assets/icons/save.svg"
                    width={36}
                    height={36}
                    alt="saved"
                    className="invert-white"
                />
                <h2 className="h3-bold md:h2-bold text-left w-full">Saved Recipes</h2>
            </div>

            {/* Content */}
            {isLoading ? (
                <Loader />
            ) : (
                <ul className="w-full flex justify-center max-w-5xl gap-9">
                    {savedRecipes.length === 0 ? (
                        <p className="text-light-4">No available recipes</p>
                    ) : (
                        <GridRecipeList recipes={savedRecipes} showStats={false} />
                    )}
                </ul>
            )}
        </div>
    );
};

export default Saved;
