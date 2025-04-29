import { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { GridRecipeList } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { database } from "@/lib/firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Explore = () => {
    const navigate = useNavigate();
    const { user } = useUserContext();

    const [searchTerm, setSearchTerm] = useState("");
    const [allRecipes, setAllRecipes] = useState<any[]>([]);
    const [approvedRecipes, setApprovedRecipes] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showMyRecipes, setShowMyRecipes] = useState(false);
    const [userRecipes, setUserRecipes] = useState<any[]>([]);

    // Fetch Recipes
    useEffect(() => {
        const fetchRecipes = async () => {
            const recipesRef = collection(database, "Recipes");
            const snapshot = await getDocs(query(recipesRef, orderBy("createdAt", "desc")));
            const fetchedRecipes = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAllRecipes(fetchedRecipes);
            setApprovedRecipes(fetchedRecipes.filter((r) => r.isApproved === true));
        };

        const fetchUserRecipes = async () => {
            if (!user?.id) return;
            const recipesRef = collection(database, "Recipes");
            const snapshot = await getDocs(query(recipesRef));
            const fetched = snapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter((r) => r.authorId === user.id);
            setUserRecipes(fetched);
        };

        fetchRecipes();
        fetchUserRecipes();
    }, [user?.id]);

    // Search across Approved + All Recipes
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const combinedRecipes = [ ...allRecipes];

        const filtered = combinedRecipes.filter((recipe) => {
            const titleMatch = recipe.title?.toLowerCase().includes(searchTerm.toLowerCase());
            const tagsMatch = recipe.tags?.some((tag: string) =>
                tag.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return titleMatch || tagsMatch;
        });

        setSearchResults(filtered);
    }, [searchTerm, approvedRecipes, allRecipes]);

    const recipesToShow = showMyRecipes
        ? userRecipes ?? []
        : searchTerm
            ? searchResults
            : allRecipes;

    return (
        <div className="px-6 py-10">
            <h2 className="text-2xl font-bold mb-4">Explore Recipes</h2>

            {/* Search Bar and Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-96"
                />

                {user && (
                    <Button
                        variant={showMyRecipes ? "default" : "secondary"}
                        onClick={() => setShowMyRecipes(!showMyRecipes)}
                    >
                        {showMyRecipes ? "Show Explore" : "Show My Recipes"}
                    </Button>
                )}
                {user && (
                    <Button onClick={() => navigate("/create-recipe")}>
                        ➕ Create Recipe
                    </Button>
                )}
            </div>

            {/* Approved Recipes Section */}
            {approvedRecipes.length > 0 && !searchTerm && (
                <div className="my-8">
                    <h3 className="text-xl font-semibold mb-4">✅ Approved Recipes</h3>
                    <GridRecipeList recipes={approvedRecipes} />
                </div>
            )}

            {/* All Recipes Section */}
            {recipesToShow.length > 0 ? (
                <div className="my-8">
                    <h3 className="text-xl font-semibold mb-4">📖 All Recipes</h3>
                    <GridRecipeList recipes={recipesToShow} />
                </div>
            ) : (
                <p className="text-gray-400 text-center mt-10">
                    No recipes found.
                </p>
            )}
        </div>
    );
};

export default Explore;

