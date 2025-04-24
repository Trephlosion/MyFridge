import { useUserContext } from "@/context/AuthContext.tsx";
import RecipeCard from "@/components/cards/RecipeCard";
import { Recipe } from "@/types";

type GridRecipeListProps = {
  recipes: Recipe[]; // List of all available recipes
};

const GridRecipeList = ({ recipes }: GridRecipeListProps) => {
  const { user } = useUserContext();

  const likedRecipeIds = user?.likedRecipes?.map((ref: any) => ref.id) || [];

  const filteredRecipes = recipes.filter((recipe) =>
      likedRecipeIds.includes(recipe.id)
  );

  return (
      <ul className="grid-container">
        {filteredRecipes.map((recipe) => (
            <li key={recipe.id} className="relative min-w-80 h-80">
              <RecipeCard recipe={recipe} />
            </li>
        ))}
      </ul>
  );
};

export default GridRecipeList;
