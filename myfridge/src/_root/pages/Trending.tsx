import { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { collection, getDocs, query } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useNavigate } from "react-router-dom";
import RecipeCard from "@/components/cards/RecipeCard";

const Trending = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [trendingRecipes, setTrendingRecipes] = useState<any[]>([]);

    useEffect(() => {
        const fetchTrendingRecipes = async () => {
            const recipesRef = collection(database, "Recipes");
            const snapshot = await getDocs(query(recipesRef));

            let recipes = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Only keep recipes with at least 1 like
            recipes = recipes.filter((recipe) => recipe.likes?.length > 0);

            // Sort descending by likes
            recipes.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));

            setTrendingRecipes(recipes);
        };

        fetchTrendingRecipes();
    }, []);

    const getTrendingBadge = (index: number) => {
        if (index === 0) return "🥇 #1 Trending";
        if (index === 1) return "🥈 #2 Trending";
        if (index === 2) return "🥉 #3 Trending";
        return null;
    };

    return (
        <div className="px-6 py-10">
            {/* Header */}
            <div className="flex items-center justify-center mb-8 gap-3">
                <img src="/assets/icons/trend.svg" alt="Trending" className="w-8 h-8" />
                <h2 className="text-3xl font-bold text-center">Trending Recipes</h2>
            </div>

            {/* Trending Recipe Cards */}
            {trendingRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingRecipes.map((recipe, index) => (
                        <div key={recipe.id} className="relative">
                            {/* Trending Badge */}
                            {index < 3 && (
                                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    {getTrendingBadge(index)}
                                </div>
                            )}
                            <RecipeCard recipe={recipe} />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 text-center mt-10">
                    No trending recipes found.
                </p>
            )}
        </div>
    );
};

export default Trending;



