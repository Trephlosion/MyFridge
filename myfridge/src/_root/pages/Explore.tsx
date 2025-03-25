import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    useGetUserRecipes,
    useSearchRecipes,
} from "@/lib/react-query/queriesAndMutations";
import { Input } from "@/components/ui/input";
import {
    doc,
    getDoc,
    collection,
    getDocs,
    orderBy,
    limit,
} from "firebase/firestore";
import { database } from "@/lib/firebase/config";

const Explore = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [creators, setCreators] = useState<{ [key: string]: string }>({});
    const [suggestedRecipes, setSuggestedRecipes] = useState<any[]>([]);
    const [showMyRecipes, setShowMyRecipes] = useState(false);
    const navigate = useNavigate();
    const userId = "user_document_id_here"; // Replace with actual user ID

    const { data: userRecipes, isLoading: isLoadingUserRecipes } = useGetUserRecipes(userId);
    const { data: searchResults, isLoading: isSearching } = useSearchRecipes(searchTerm.toLowerCase());

    useEffect(() => {
        const fetchSuggestedRecipes = async () => {
            const recipesRef = collection(database, "Recipes");
            const suggestedQuery = orderBy("createdAt", "desc");
            const querySnapshot = await getDocs(recipesRef, suggestedQuery, limit(6));
            const suggested = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setSuggestedRecipes(suggested);
        };

        fetchSuggestedRecipes();
    }, []);

    const recipes = showMyRecipes
        ? userRecipes ?? []
        : searchTerm
            ? (searchResults ?? []).filter((recipe) =>
                recipe.title?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : suggestedRecipes;

    const noResults = searchTerm && recipes.length === 0;

    useEffect(() => {
        const fetchCreators = async () => {
            const newCreators: { [key: string]: string } = {};
            for (const recipe of recipes) {
                if (recipe.author?.id && !creators[recipe.author.id]) {
                    const userDoc = await getDoc(doc(database, "Users", recipe.author.id));
                    if (userDoc.exists()) {
                        newCreators[recipe.author.id] = userDoc.data().username || "Unknown Creator";
                    }
                }
            }
            setCreators((prev) => ({ ...prev, ...newCreators }));
        };

        if (recipes.length > 0) {
            fetchCreators();
        }
    }, [recipes]);

    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold mb-4 text-center">Explore Recipes</h2>

            <div className="flex justify-center mb-4 gap-4">
                <Input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowMyRecipes(false); // reset to explore when searching
                    }}
                    className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 p-2 border border-gray-300 rounded"
                />
                <button
                    onClick={() => setShowMyRecipes(!showMyRecipes)}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                    {showMyRecipes ? "Back to Explore" : "My Recipes"}
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {isLoadingUserRecipes || isSearching ? (
                    <p className="col-span-full text-center">Loading recipes...</p>
                ) : noResults ? (
                    <p className="col-span-full text-center text-gray-500">
                        No recipes found. Try another search term.
                    </p>
                ) : (
                    recipes.map((recipe) => {
                        const recipeTitle = recipe?.title || "Untitled Recipe";
                        const authorId = recipe.author?.id;
                        const creatorName = authorId ? creators[authorId] || "Loading..." : "Unknown Creator";

                        return (
                            <div
                                key={recipe.id}
                                className="border rounded p-4 shadow-md bg-white cursor-pointer transition-transform transform hover:scale-105"
                                onClick={() => navigate(`/recipe/${recipe.id}`)}
                            >
                                <img
                                    src={
                                        recipe.media_url ||
                                        "https://www.food4fuel.com/wp-content/uploads/woocommerce-placeholder-600x600.png"
                                    }
                                    alt={recipeTitle}
                                    className="w-full h-40 object-cover rounded"
                                    onError={(e) =>
                                        (e.currentTarget.src =
                                            "https://www.food4fuel.com/wp-content/uploads/woocommerce-placeholder-600x600.png")
                                    }
                                />
                                <h3 className="text-lg font-bold text-black mt-2">{recipeTitle}</h3>
                                <p className="text-sm text-black italic">Created by: {creatorName}</p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Explore;
