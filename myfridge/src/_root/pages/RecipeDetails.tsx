import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader, GridRecipeList, RecipeStats } from "@/components/shared";
import { useGetRecipeById, useGetRecentRecipes, useDeleteRecipe } from "@/lib/react-query/queriesAndMutations";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

const RecipeDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Recipe ID from URL
    const { user } = useUserContext();

    // Fetch the recipe details and related recipes
    const { data: recipe, isLoading } = useGetRecipeById(id);
    const { data: userRecipes, isLoading: isUserRecipeLoading } = useGetRecentRecipes();
    const { mutate: deleteRecipe } = useDeleteRecipe();

    // Filter related recipes excluding the current one
    const relatedRecipes = userRecipes?.filter((userRecipe) => userRecipe.id !== id);

    // Handle delete recipe
    const handleDeleteRecipe = () => {
        if (recipe) {
            deleteRecipe({ recipeId: id, imageId: recipe.imageId });
            navigate(-1); // Navigate back
        }
    };

    return (
        <div className="recipe_details-container">
            {/* Back Button */}
            <div className="hidden md:flex max-w-5xl w-full">
                <Button onClick={() => navigate(-1)} variant="ghost" className="shad-button_ghost">
                    <img src="/assets/icons/back.svg" alt="back" width={24} height={24} />
                    <p className="small-medium lg:base-medium">Back</p>
                </Button>
            </div>

            {/* Recipe Details */}
            {isLoading || !recipe ? (
                <Loader />
            ) : (
                <div className="recipe_details-card">
                    <img src={recipe.imageUrl} alt="recipe" className="recipe_details-img" />
                    <div className="recipe_details-info">
                        <div className="flex-between w-full">
                            {/* Creator Profile Link */}
                            <Link to={`/profile/${recipe.userId}`} className="flex items-center gap-3">
                                <img
                                    src={recipe.pfpId || "/assets/icons/profile-placeholder.svg"}
                                    alt="creator"
                                    className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                                />
                                <div className="flex gap-1 flex-col">
                                    <p className="base-medium lg:body-bold text-light-1">
                                        {recipe.first_name} {recipe.last_name}
                                    </p>
                                    <div className="flex-center gap-2 text-light-3">
                                        <p className="subtle-semibold lg:small-regular">{multiFormatDateString(recipe.createdAt)}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Edit and Delete Buttons */}
                            <div className="flex-center gap-4">
                                {user.id === recipe.userId && (
                                    <>
                                        <Link to={`/update-recipe/${recipe.id}`}>
                                            <img src="/assets/icons/edit.svg" alt="edit" width={24} height={24} />
                                        </Link>
                                        <Button
                                            onClick={handleDeleteRecipe}
                                            variant="ghost"
                                            className="ost_details-delete_btn"
                                        >
                                            <img src="/assets/icons/delete.svg" alt="delete" width={24} height={24} />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <hr className="border w-full border-dark-4/80" />

                        {/* Recipe Description */}
                        <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
                            <p>{recipe.description}</p>
                            <ul className="flex gap-1 mt-2">
                                {recipe.tags?.map((tag: string, index: number) => (
                                    <li key={`${tag}-${index}`} className="text-light-3 small-regular">
                                        #{tag}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Recipe Stats */}
                        <div className="w-full">
                            <RecipeStats recipe={recipe} userId={user.id} />
                        </div>
                    </div>
                </div>
            )}

            {/* Related Recipes */}
            <div className="w-full max-w-5xl">
                <hr className="border w-full border-dark-4/80" />
                <h3 className="body-bold md:h3-bold w-full my-10">More Related Recipes</h3>
                {isUserRecipeLoading || !relatedRecipes ? (
                    <Loader />
                ) : (
                    <GridRecipeList recipes={relatedRecipes} />
                )}
            </div>
        </div>
    );
};

export default RecipeDetails;
