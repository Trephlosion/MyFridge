import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    useGetUserRecipes,
} from "@/lib/react-query/queriesAndMutations";
import {
    collection,
    getDocs,
    orderBy,
    query,
} from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext.tsx";
import { Input } from "@/components/ui/input";
import { GridRecipeList, LoadingRecipe } from "@/components/shared";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.tsx";

const Explore = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [allRecipes, setAllRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUserContext();
    const { data: userRecipes } = useGetUserRecipes(user.id);

    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true);
            const recipesRef = collection(database, "Recipes");
            const recipesQuery = query(recipesRef, orderBy("createdAt", "desc"));
            const snapshot = await getDocs(recipesQuery);
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllRecipes(fetched);
            setLoading(false);
        };
        fetchRecipes();
    }, []);

    const recipesToShow = searchTerm
        ? allRecipes.filter(recipe =>
            recipe.title?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : allRecipes;

    return (
        <div className="p-5">
            <div className="text-white">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link className="hover:text-accentColor" to="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink>Explore</BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-center">Explore Recipes</h2>

            <div className="mb-4">
                <Input
                    type="text"
                    placeholder="Search recipes by title..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full"
                />
            </div>

            {loading && <LoadingRecipe />}

            {!loading && recipesToShow.length === 0 && (
                <p className="text-center text-light-4 mt-4">
                    No recipes found matching "{searchTerm}".
                </p>
            )}

            {!loading && <GridRecipeList recipes={recipesToShow} />}
        </div>
    );
};

export default Explore;
