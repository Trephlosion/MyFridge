import { GridRecipeList, Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutations.ts";

const LikedRecipes = () => {
    const { data: currentUser } = useGetCurrentUser();

    if (!currentUser)
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );

    return (
        <>
            {currentUser.likedRecipes.length === 0 && (
                <p className="text-light-4">No liked recipes</p>
            )}

            <GridRecipeList recipes={currentUser.likedRecipes} showStats={false} />
        </>
    );
};

export default LikedRecipes;
