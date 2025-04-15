import RecipeForm from "@/components/form/RecipeForm.tsx";

const CreateRecipe = () => {


    return (
        <div className="flex flex-1">
            <div className="common-container">
                <div className="max-w-5l flex-start gap-3 justify-start h-full">
                    <img
                        src="/assets/icons/add-post.svg"
                        alt="Create Recipe"
                        width={36}
                        height={36}
                    />
                    <h2 className="h3-bold md:h2-bold text-left w-full">Create Recipe</h2>
                </div>

                <RecipeForm /> {/* ✅ Pass function to RecipeForm */}
            </div>
        </div>
    );
};

export default CreateRecipe;
