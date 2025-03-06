// import React from 'react'
import { Loader } from "lucide-react";
import RecipeCard from "@/components/shared/RecipeCard";
import { IRecipeMetadata } from "@/types";
import { useGetRecentRecipes } from "@/lib/react-query/queriesAndMutations"; // Replace with your actual query
import { useNavigate } from "react-router-dom";
import {Skeleton} from "@/components/ui/skeleton.tsx";

const Home = () => {
    const { data: recipes, isPending: isRecipeLoading, isError: isErrorRecipes } = useGetRecentRecipes();
    /*const recipes = null;
    const isRecipeLoading = false;
    const isErrorRecipes = false;*/

    return (
        <div className="flex flex-1">
            <div className="home-container">
                <div className="home-posts">
                    <h2 className="h3-bold md:h2-bold text-left w-full">My Recipes</h2>

                    {/* Loading State */}
                    {isRecipeLoading && !recipes ? (
                        <div className="flex justify-center items-center">
                            <Loader className="animate-spin" />
                        </div>
                    ) : isErrorRecipes ? (
                        <p className="text-red-500 text-center">Error fetching recipes. Please try again.</p>
                    ) : (
                        <ul className="flex flex-col flex-1 gap-9 w-full">
                            {recipes?.map((recipe: IRecipeMetadata) => (
                                <li key={recipe.id}>
                                    <div className={"flex flex-col space-y-3"}>
                                    <Skeleton className={"h-[125px] w-full rounded-xl"}/>
                                </div>
                                </li>
                            ))}


                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}
export default Home
