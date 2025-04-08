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
    query,
} from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext.tsx";
import RecipeCard from "@/components/cards/RecipeCard.tsx";
import LoadingRecipe from "@/components/shared/LoadingRecipe.tsx";
import { Button } from "@/components/ui/button";

const Explore = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [creators, setCreators] = useState<{ [key: string]: string }>({});
    const [suggestedRecipes, setSuggestedRecipes] = useState<any[]>([]);
    const [showMyRecipes, setShowMyRecipes] = useState(false);
    const [ratingsMap, setRatingsMap] = useState<{ [key: string]: any[] }>({});
    const navigate = useNavigate();
    const { user } = useUserContext();
    const [highlightedRecipes, setHighlightedRecipes] = useState<string[]>([]);

    const { data: userRecipes, isLoading: isLoadingUserRecipes } = useGetUserRecipes(user.id);
    const { data: searchResults, isLoading: isSearching } = useSearchRecipes(searchTerm.toLowerCase());



    useEffect(() => {
        const fetchSuggestedRecipes = async () => {
            const recipesRef = collection(database, "Recipes");
            const suggestedQuery = query(recipesRef, orderBy("createdAt", "desc"), limit(6));
            const querySnapshot = await getDocs(suggestedQuery);
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
                recipe.id?.toLowerCase().includes(searchTerm.toLowerCase())
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

    useEffect(() => {
        const fetchRatingsForUserRecipes = async () => {
            const newRatingsMap: { [key: string]: any[] } = {};
            for (const recipe of recipes) {
                if (recipe.author?.id === user.id) {
                    const ratingsRef = collection(database, "Recipes", recipe.id, "Ratings");
                    const snapshot = await getDocs(ratingsRef);
                    newRatingsMap[recipe.id] = snapshot.docs.map(doc => doc.data());
                }
            }
            setRatingsMap(newRatingsMap);
        };

        if (recipes.length > 0) {
            fetchRatingsForUserRecipes();
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
                <Button
                    onClick={() => setShowMyRecipes(!showMyRecipes)}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                    {showMyRecipes ? "Back to Explore" : "My Recipes"}
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {isLoadingUserRecipes || isSearching ? (
                    <LoadingRecipe/>
                ) : noResults ? (
                    <p className="col-span-full text-center text-gray-500">
                        No recipes found. Try another search term.


                    </p>
                ) : (

                    recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe}  />
                    ))

                )}
            </div>
        </div>
    );
};

export default Explore;
