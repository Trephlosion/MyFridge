import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { Recipe } from "@/types";
import { Loader } from "@/components/shared";
import RecipeCard from "@/components/cards/RecipeCard";

const Trending = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrendingRecipes = async () => {
            try {
                const snapshot = await getDocs(collection(database, "Recipes"));
                const allRecipes = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Recipe[];

                // Filter recipes with at least 1 like
                const likedRecipes = allRecipes.filter(
                    (r) => Array.isArray(r.likes) && r.likes.length > 0
                );

                // Sort by number of likes (descending)
                const sorted = likedRecipes.sort(
                    (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
                );

                setRecipes(sorted);
            } catch (err) {
                console.error("Error fetching trending recipes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingRecipes();
    }, []);

    const getTrendingBadge = (index: number) => {
        if (index === 0) return "#1 Trending (🥇)";
        if (index === 1) return "#2 Trending (🥈)";
        if (index === 2) return "#3 Trending (🥉)";
        return null;
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">🔥 Trending Recipes</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe, index) => (
                    <div key={recipe.id} className="relative">
                        {/* Trending Badge (Top 3) */}
                        {index < 3 && (
                            <div className="absolute top-2 left-2 z-20 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                {getTrendingBadge(index)}
                            </div>
                        )}

                        <RecipeCard recipe={recipe} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Trending;




