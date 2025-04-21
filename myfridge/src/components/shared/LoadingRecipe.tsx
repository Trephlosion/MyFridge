import RecipeSkeleton from "../cards/RecipeSkeleton.tsx"


const LoadingRecipe = () => {
    return (
        <div >
            <h2 className={"flex-col flex text-center"}>
                Loading recipes...
            </h2>

            <div >

                {Array.from({ length: 9 }).map((_, index) => (
                    <RecipeSkeleton key={index} />
                ))}

            </div>

        </div>
    )
}
export default LoadingRecipe
