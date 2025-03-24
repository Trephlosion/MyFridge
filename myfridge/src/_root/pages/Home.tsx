import { Loader } from "lucide-react";
import BaseRecipeCard from "@/components/shared/BaseRecipeCard.tsx";
import { IRecipeMetadata } from "@/types";
import { useGetRecentRecipes } from "@/lib/react-query/queriesAndMutations";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserContext } from "@/context/AuthContext"; // imported user context
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { UserCardMini } from "@/components/shared";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { Separator } from "@/components/ui/separator.tsx";

const Home = () => {
    const { data: recipes, isPending: isRecipeLoading, isError: isErrorRecipes } = useGetRecentRecipes();
    const { user } = useUserContext(); // get the current user
    const navigate = useNavigate();

    // Move the hooks inside the Home component
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(database, "Users");
                const querySnapshot = await getDocs(usersRef);
                const usersData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    const topUsers = [...users]
        .sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0))
        .slice(0, 3);

    // Function to log all recipes in console
    const handleShowAllRecipes = () => {
        console.log("All Recipes:", recipes);
    };

    return (
        <div className="flex flex-1">
            <div className="home-container">
                <div className="home-posts">
                    <h2 className="h3-bold md:h2-bold text-left w-full">Featured Recipes</h2>
                    {/* Loading State */}
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
                        <>
                            <div className="flex flex-col gap-9">
                                <h2>Our Top Users</h2>
                                <Carousel
                                    opts={{
                                        align: "start",
                                    }}
                                    className="w-full max-w-sm"
                                >
                                    <CarouselContent>
                                        {topUsers.map((user) => (
                                            <CarouselItem key={user.id} className="basis-1/3">
                                                <UserCardMini user={user} />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <h2 className="h3-bold md:h2-bold text-left w-full">Recent Recipes</h2>
                                <Button onClick={handleShowAllRecipes}>Show All</Button>
                            </div>
                            <ul className="flex flex-col flex-1 gap-9 w-full">
                                {recipes?.map((recipe: IRecipeMetadata) => (
                                    <li key={recipe.id}>
                                        <BaseRecipeCard recipe={recipe} />
                                    </li>
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
