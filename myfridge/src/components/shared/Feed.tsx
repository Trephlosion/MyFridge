import { useEffect, useRef } from "react";
import { useUserContext } from "@/context/AuthContext";
import { RecipeCard } from "@/components/shared";
import { useGetInfiniteFeed } from "@/lib/react-query/queriesAndMutations";
import LoadingRecipe from "@/components/shared/LoadingRecipe";
import { Loader } from "@/components/shared";

const Feed = () => {
    const { user } = useUserContext();
    const observerRef = useRef<HTMLDivElement | null>(null);




    // ✅ Always call hooks unconditionally
    const {
        data,
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useGetInfiniteFeed(user.id);

    const feedRecipes = data?.pages.flat() || [];

    // Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1 }
        );

        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);


    if (!user.id) {
        return <p className="text-center text-red-500">User not logged in</p>;
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full w-full py-12">
                <Loader />
            </div>
        );
    }

    if (feedRecipes.length === 0 && !isFetchingNextPage) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 mt-10 text-light-4 text-sm">
                <p>No recipes found from users you follow.</p>
                <p>Start following users to see their recipes here!</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h2 className="h3-bold md:h2-bold text-left w-full mb-4">My Feed</h2>

            <ul className="flex flex-col flex-1 gap-9 w-full">
                {feedRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </ul>

            <div ref={observerRef} className="h-10" />

            {isFetchingNextPage && (
                <div className="flex justify-center py-6">
                    <LoadingRecipe />
                </div>
            )}

            {!hasNextPage && feedRecipes.length > 0 && (
                <p className="text-center text-sm text-light-4 mt-6">
                    You’ve reached the end of your feed 🎉
                </p>
            )}
        </div>
    );
};

export default Feed;
