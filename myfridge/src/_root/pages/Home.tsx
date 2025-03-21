    import { Loader } from "lucide-react";
    import BaseRecipeCard from "@/components/shared/BaseRecipeCard.tsx";
    import { IRecipeMetadata } from "@/types";
    import { useGetRecentRecipes } from "@/lib/react-query/queriesAndMutations";
    import { useNavigate } from "react-router-dom";
    import { Skeleton } from "@/components/ui/skeleton";
    import { useUserContext } from "@/context/AuthContext";  // imported user context
    import { Button } from "@/components/ui/button";
    import {
        Carousel,
        CarouselContent,
        CarouselItem,
        CarouselNext,
        CarouselPrevious,
    } from "@/components/ui/carousel"


    const Home = () => {
        const { data: recipes, isPending: isRecipeLoading, isError: isErrorRecipes } = useGetRecentRecipes();
        const { user } = useUserContext();  // get the current user
        const navigate = useNavigate();

        // Function to log all recipes in console
        const handleShowAllRecipes = () => {
            console.log("All Recipes:", recipes);

        };

        return (
            <div className="flex flex-1">
                <div className="home-container">
                    <div className="home-posts">
                        <h2 className="h3-bold md:h2-bold text-left w-full">Featured Recipes</h2>
                         {/*Loading State*/}
                        {isRecipeLoading && !recipes ? (
                            <div className="flex flex-col gap-9">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="flex flex-col space-y-3">
                                    {/* SKELETONS */}
                                    </div>
                                ))}
                            </div>
                        ) : isErrorRecipes ? (
                            <p className="text-red-500 text-center">Error fetching recipes. Please try again.</p>
                        ) : (


                            <ul className="flex flex-col flex-1 gap-9 w-full">
                                {recipes?.map((recipe: IRecipeMetadata) => (
                                    <li key={recipe.id}>
                                        <BaseRecipeCard recipe={recipe} />
                                    </li>
                                ))}
                            </ul>
                        )}


                    </div>
                </div>
            </div>
        );
    };

    export default Home;
