import {
    AiRecipeCarousel,
    RecipeCard,
    TopUsersCarousel,
    UserCardMini,
    UserSkeletonCard
} from "@/components/shared";
import { IRecipeMetadata } from "@/types";
import {
    useGetRecentRecipes,
    useCreateUserAccount
} from "@/lib/react-query/queriesAndMutations";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator.tsx";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext
} from "@/components/ui/carousel";

import LoadingRecipe from "@/components/shared/LoadingRecipe.tsx";

const Home = () => {
    const {
        data: recipes,
        isPending: isRecipeLoading,
        isError: isErrorRecipes
    } = useGetRecentRecipes();
    const { user } = useUserContext();
    const navigate = useNavigate();



    return (
        <div className="flex flex-1">
            <div className="home-container">



                <div>
                    {/* Top Users */}
                    <h2 className="h3-bold md:h2-bold text-left w-full">Top Users</h2>
                    <TopUsersCarousel />
                </div>

                <Separator />

                <div>{/* Seasonal Recipes */}</div>

                <Separator />

                <div>
                    {/* Load AI Recommended Recipes */}
                    <h2 className="h3-bold md:h2-bold text-left w-full">AI Recommendations</h2>
                    <AiRecipeCarousel />
                </div>

                <Separator />

                <div className="home-posts">
                    {/* Users Feed */}
                    {isRecipeLoading && !recipes ? (
                        <div className="flex flex-col gap-9">
                            <LoadingRecipe />
                        </div>
                    ) : isErrorRecipes ? (
                        <p className="text-red-500 text-center">
                            Error fetching recipes. Please try again.
                        </p>
                    ) : (
                        <>
                            <h2 className="h3-bold md:h2-bold text-left w-full">MyFeed</h2>
                            <ul className="flex flex-col flex-1 gap-9 w-full">
                                {recipes?.map((recipe: IRecipeMetadata) => (
                                    <RecipeCard key={recipe.id} recipe={recipe} />
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;











/*import {AiRecipeCarousel, RecipeCard, TopUsersCarousel, UserCardMini, UserSkeletonCard} from "@/components/shared";
import {IRecipeMetadata} from "@/types";
import {useGetRecentRecipes, useCreateUserAccount} from "@/lib/react-query/queriesAndMutations";
import {useNavigate} from "react-router-dom";
import {Skeleton} from "@/components/ui/skeleton";
import {useUserContext} from "@/context/AuthContext";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator.tsx";
import {Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext} from "@/components/ui/carousel";

import LoadingRecipe from "@/components/shared/LoadingRecipe.tsx";

const Home = () => {
    const {data: recipes, isPending: isRecipeLoading, isError: isErrorRecipes} = useGetRecentRecipes();
    const {user} = useUserContext();
    const navigate = useNavigate();


    return (
        <div className="flex flex-1">
            <div className="home-container">

                <div>
                    {/*  Top Users  *}
                    <h2 className="h3-bold md:h2-bold text-left w-full">Top Users</h2>
                    <TopUsersCarousel/>

                </div>

                <Separator/>

                <div>
                    {/*  Seasonal Recipes   }
                </div>

                <Separator/>

                <div>
                    {/*Load AI Reccommended Recipes}
                    <h2 className="h3-bold md:h2-bold text-left w-full">AI Reccommendations</h2>
                    <AiRecipeCarousel/>
                </div>

                <Separator/>

                <div className="home-posts">
                    {/*Users Feed*


                    {isRecipeLoading && !recipes ? (
                        <div className="flex flex-col gap-9">
                            <LoadingRecipe/>
                        </div>
                    ) : isErrorRecipes ? (
                        <p className="text-red-500 text-center">
                            Error fetching recipes. Please try again.
                        </p>
                    ) : (
                        <>
                            <h2 className="h3-bold md:h2-bold text-left w-full">MyFeed</h2>
                            <ul className="flex flex-col flex-1 gap-9 w-full">
                                {recipes?.map((recipe: IRecipeMetadata) => (
                                    <RecipeCard key={recipe.id} recipe={recipe}/>
                                ))}
                            </ul>
                        </>

                        )}
                </div>
            </div>
        </div>
    );
};

export default Home;
*/
