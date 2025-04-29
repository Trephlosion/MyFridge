import { useEffect, useState, useRef, useCallback } from "react";
import { useUserContext } from "@/context/AuthContext";
import {
    AiRecipeCarousel,
    RecipeCard,
    LoadingRecipe
} from "@/components/shared";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import WorkshopCard from "@/components/cards/WorkshopCard";
import ChallengeCard from "@/components/cards/ChallengeCard";
import UserCard from "@/components/cards/UserCard";
import { getTopUsers, getTopWorkshops, getTopChallenges, getFollowedUsersRecipes } from "@/lib/firebase/api"; // You must implement these.
import { IRecipeMetadata, IUser, Workshop, Challenge } from "@/types";

const Home = () => {
    const { user } = useUserContext();
    const [topUsers, setTopUsers] = useState<IUser[]>([]);
    const [topWorkshops, setTopWorkshops] = useState<Workshop[]>([]);
    const [topChallenges, setTopChallenges] = useState<Challenge[]>([]);
    const [feedRecipes, setFeedRecipes] = useState<IRecipeMetadata[]>([]);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const observerRef = useRef<HTMLDivElement | null>(null);

    // Fetch top items
    useEffect(() => {
        const fetchTopData = async () => {
            const [users, workshops, challenges] = await Promise.all([
                getTopUsers(3),
                getTopWorkshops(3),
                getTopChallenges(3)
            ]);
            setTopUsers(users);
            setTopWorkshops(workshops);
            setTopChallenges(challenges);
        };
        fetchTopData();
    }, []);

    // Fetch feed recipes
    useEffect(() => {
        const fetchFeed = async () => {
            setLoadingMore(true);
            const newRecipes = await getFollowedUsersRecipes(user.id, page);
            setFeedRecipes(prev => [...prev, ...newRecipes]);
            setLoadingMore(false);
        };
        fetchFeed();
    }, [page]);

    // Infinite Scroll Handler
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const target = entries[0];
        if (target.isIntersecting) {
            setPage(prev => prev + 1);
        }
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, { threshold: 1 });
        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [handleObserver]);

    return (
        <div className="flex flex-1">
            <div className="home-container space-y-8">

                <div>
                    <h2 className="h3-bold md:h2-bold text-left w-full">Top Users</h2>
                    <Carousel>
                        <CarouselContent>
                            {topUsers.map(user => (
                                <CarouselItem key={user.id} className="md:basis-1/3">
                                    <UserCard user={user} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>

                <Separator />

                <div>
                    <h2 className="h3-bold md:h2-bold text-left w-full">Top Workshops</h2>
                    <Carousel>
                        <CarouselContent>
                            {topWorkshops.map(workshop => (
                                <CarouselItem key={workshop.id} className="md:basis-1/3">
                                    <WorkshopCard workshop={workshop} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>

                <Separator />

                <div>
                    <h2 className="h3-bold md:h2-bold text-left w-full">Top Challenges</h2>
                    <Carousel>
                        <CarouselContent>
                            {topChallenges.map(challenge => (
                                <CarouselItem key={challenge.id} className="md:basis-1/3">
                                    <ChallengeCard challenge={challenge} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>

                <Separator />

                <div>
                    <h2 className="h3-bold md:h2-bold text-left w-full">AI Recommendations</h2>
                    <AiRecipeCarousel />
                </div>

                <Separator />

                <div>
                    <h2 className="h3-bold md:h2-bold text-left w-full">My Feed</h2>
                    <ul className="flex flex-col flex-1 gap-9 w-full">
                        {feedRecipes.map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                    </ul>
                    <div ref={observerRef} className="flex justify-center py-8">
                        {loadingMore && (
                            <div className="flex flex-col items-center gap-2">
                                <LoadingRecipe /> {/* optional: your animated skeleton */}
                                <p className="text-light-4 text-sm">Loading more recipes...</p>
                            </div>
                        )}
                    </div>
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
