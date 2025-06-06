import RecipeSkeleton from "../cards/RecipeSkeleton.tsx"


const LoadingRecipe = () => {
    return (
        <div >
            <h2 className={"grid-cols-3 flex text-center"}>
                Loading recipes...
            </h2>

            <div className={"grid grid-cols-3 gap-4 w-full "} >

                {Array.from({ length: 9 }).map((_, index) => (
                    <RecipeSkeleton key={index} />
                ))}

            </div>

        </div>
    )
}
export default LoadingRecipe
