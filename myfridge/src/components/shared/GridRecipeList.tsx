import { useUserContext } from "@/context/AuthContext.tsx";
import RecipeCard from "@/components/cards/RecipeCard";
import { Recipe } from "@/types";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import LoadingRecipe from "@/components/shared/LoadingRecipe.tsx";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useGetUserRecipes, useSearchRecipes} from "@/lib/react-query/queriesAndMutations.ts";
import {collection, doc, getDoc, getDocs, limit, orderBy, query, DocumentReference } from "firebase/firestore";
import {database} from "@/lib/firebase/config.ts";
import {getUserRecipes} from "@/lib/firebase/api.ts";
import {firestore} from "firebase-admin";


type GridRecipeListProps = {
  recipes: any[]; // List of all available recipes
};

const GridRecipeList = ({ recipes }: GridRecipeListProps) => {
  const { user } = useUserContext();



  const { data: userRecipes, isLoading: isLoadingUserRecipes } = useGetUserRecipes(recipes);

  const likedRecipeIds = user?.likedRecipes?.map((ref: any) => ref.id) || [];

  const filteredRecipes = recipes.filter((recipe) =>
      likedRecipeIds.includes(recipe.id)
  );


  const [searchTerm, setSearchTerm] = useState("");
  const [creators, setCreators] = useState<{ [key: string]: string }>({});
  const [suggestedRecipes, setSuggestedRecipes] = useState<any[]>([]);
  const [showMyRecipes, setShowMyRecipes] = useState(false);
  const [ratingsMap, setRatingsMap] = useState<{ [key: string]: any[] }>({});
  const navigate = useNavigate();
  const [highlightedRecipes, setHighlightedRecipes] = useState<string[]>([]);

  const { data: searchResults, isLoading: isSearching } = useSearchRecipes(searchTerm.toLowerCase());



  useEffect(() => {
    const fetchSuggestedRecipes = async () => {
      const recipesRef = collection(database, "Recipes");
      const suggestedQuery = query(recipesRef, orderBy("createdAt", "desc"), limit(20));
      const querySnapshot = await getDocs(suggestedQuery);
      const suggested = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSuggestedRecipes(suggested);
    };

    fetchSuggestedRecipes();
  }, []);


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
        if (recipe.author === user.id) {
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

  const location = useLocation();
  const isProfilePage = location.pathname.includes("/profile");

  return (

<>

  <div className="w-auto grid grid-cols-3 gap-4">
    {isProfilePage ? (
        isLoadingUserRecipes ? (
            <LoadingRecipe />
        ) : userRecipes && userRecipes.length > 0 ? (
            userRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
            ))
        ) : (
            <p className="col-span-full text-center text-gray-500">
              No recipes found on your profile.
            </p>
        )
    ) : (
        recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
        ))
    )}
  </div>

</>

  );
};

export default GridRecipeList;
