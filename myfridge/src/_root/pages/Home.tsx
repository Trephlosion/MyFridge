import { RecipeCard } from "@/components/shared";
                import { IRecipeMetadata } from "@/types";
                import { useGetRecentRecipes, useCreateUserAccount } from "@/lib/react-query/queriesAndMutations";
                import { useNavigate } from "react-router-dom";
                import { Skeleton } from "@/components/ui/skeleton";
                import { useUserContext } from "@/context/AuthContext";
                import { Button } from "@/components/ui/button";

                const Home = () => {
                    const { data: recipes, isPending: isRecipeLoading, isError: isErrorRecipes } = useGetRecentRecipes();
                    const { user } = useUserContext();
                    const navigate = useNavigate();




                    return (
                        <div className="flex flex-1">
                            <div className="home-container">
                                <div className="home-posts">
                                    <h2 className="h3-bold md:h2-bold text-left w-full">My Recipes</h2>

                                    {isRecipeLoading && !recipes ? (
                                        <div className="flex flex-col gap-9">
                                            {Array.from({ length: 3 }).map((_, index) => (
                                                <div key={index} className="flex flex-col space-y-3">
                                                    <Skeleton className="h-[125px] w-full rounded-xl" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-[250px]" />
                                                        <Skeleton className="h-4 w-[200px]" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : isErrorRecipes ? (
                                        <p className="text-red-500 text-center">
                                            Error fetching recipes. Please try again.
                                        </p>
                                    ) : (
                                        /*<ul className="flex flex-col flex-1 gap-9 w-full">
                                            {recipes?.map((recipe: IRecipeMetadata) => (
                                                    <RecipeCard recipe={recipe} />

                                            ))}
                                        </ul>*/
                                        <p>HomeTest</p>

                                    )}
                                </div>
                            </div>
                        </div>
                    );
                };

                export default Home;
