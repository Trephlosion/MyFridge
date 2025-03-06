import { Link } from "react-router-dom";
import { RecipeStats } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { Recipe, ExpandedUser } from "@/types";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { database } from "@/lib/firebase/config";

type GridRecipeListProps = {
  recipes: Recipe[]; // List of recipes
  showUser?: boolean;
  showStats?: boolean;
};

const GridRecipeList = ({
                          recipes,
                          showUser = true,
                          showStats = true,
                        }: GridRecipeListProps) => {
  const { user } = useUserContext();

  // Local state to hold user details
  const [creators, setCreators] = useState<{ [key: string]: ExpandedUser | null }>({});

  // Fetch creator data from Firestore
  useEffect(() => {
    const fetchCreators = async () => {
      const creatorData: { [key: string]: ExpandedUser | null } = {};

      for (const recipe of recipes) {
        if (recipe.userId && !creators[recipe.userId]) {
          try {
            const userDocRef = doc(database, "User", recipe.userId);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
              creatorData[recipe.userId] = {
                id: userSnap.id,
                ...(userSnap.data() as ExpandedUser),
              };
            } else {
              creatorData[recipe.userId] = null;
            }
          } catch (error) {
            console.error("Error fetching creator data:", error);
            creatorData[recipe.userId] = null;
          }
        }
      }

      setCreators((prev) => ({ ...prev, ...creatorData }));
    };

    fetchCreators();
  }, [recipes]);

  return (
      <ul className="grid-container">
        {recipes.map((recipe) => {
          const creator = creators[recipe.userId];

          return (
              <li key={recipe.id} className="relative min-w-80 h-80">
                {/* Link to Recipe Details */}
                <Link to={`/recipes/${recipe.id}`} className="grid-recipe_link">
                  <img
                      src={recipe.pfpId || "/assets/icons/profile-placeholder.svg"}
                      alt="recipe"
                      className="h-full w-full object-cover"
                  />
                </Link>

                {/* User Info and Stats */}
                <div className="grid-recipe_user">
                  {showUser && creator && (
                      <div className="flex items-center justify-start gap-2 flex-1">
                        <img
                            src={
                                creator.pfp || "/assets/icons/profile-placeholder.svg"
                            }
                            alt="creator"
                            className="w-8 h-8 rounded-full"
                        />
                        <p className="line-clamp-1">
                          {creator.first_name} {creator.last_name}
                        </p>
                      </div>
                  )}
                  {showStats && <RecipeStats recipe={recipe} userId={user.id} />}
                </div>
              </li>
          );
        })}
      </ul>
  );
};

export default GridRecipeList;
