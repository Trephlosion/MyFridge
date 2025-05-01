import { useState, useEffect } from "react";
import {Link, useNavigate} from "react-router-dom";
import {
    useGetUserRecipes,
    useSearchRecipes,
} from "@/lib/react-query/queriesAndMutations";
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
import {GridRecipeList} from "@/components/shared";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";

const Explore = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [creators, setCreators] = useState<{ [key: string]: string }>({});
    const [suggestedRecipes, setSuggestedRecipes] = useState<any[]>([]);
    const [showMyRecipes, setShowMyRecipes] = useState(false);
    const [ratingsMap, setRatingsMap] = useState<{ [key: string]: any[] }>({});
    const { user } = useUserContext();
    const { data: userRecipes, isLoading: isLoadingUserRecipes } = useGetUserRecipes(user.id);
    const { data: searchResults, isLoading: isSearching } = useSearchRecipes(searchTerm.toLowerCase());
    const noResults = searchTerm && recipes.length === 0;
    const recipes = showMyRecipes
        ? userRecipes ?? []
        : searchTerm
            ? (searchResults ?? []).filter((recipe) =>
                recipe.id?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : suggestedRecipes;


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

    console.log("Recipes:", recipes);

    return (
        <div className="p-5">
            {/* ─── Breadcrumb ───────────────────────── */}
            <div className={"text-white"}>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link className={"hover:text-accentColor"} to="/">Home</Link>
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
            <GridRecipeList recipes={recipes} />

        </div>
    );
};

export default Explore;
