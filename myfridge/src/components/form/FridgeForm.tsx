import { useState, useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";
import { useGetAllFridgeIngredients, useAddIngredient, useCreateIngredient } from "@/lib/react-query/queriesAndMutations";
import { DataTable, FridgeColumns } from "@/components/DataTables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useLocation, useNavigate } from "react-router-dom";
import { addIngredientToFridge, createNewIngredient, getIngredientByName } from "@/lib/firebase/api";

const FridgeForm = () => {
    const { user } = useUserContext(); // Authenticated user context
    const { pathname } = useLocation();
    const [ingredientName, setIngredientName] = useState("");
    const [myFridge, setMyFridge] = useState([]);
    const [confirmationMessage, setConfirmationMessage] = useState("");
    const { data: fridge, refetch } = useGetAllFridgeIngredients(user.id);
    const navigate = useNavigate();

    const handleAddIngredient = async () => {
        // Validate the ingredient name (must be one word, start with a capital letter, and contain no numbers)
        if (!validateName(ingredientName)) {
            alert("Invalid ingredient name. It must be one word, start with a capital letter, and contain no numbers.");
            return;
        }

        // Check if the ingredient already exists in the fridge (myFridge is now an array of strings)
        if (myFridge.includes(ingredientName)) {
            alert("Ingredient already exists in your fridge.");
            return;
        }

        try {
            // Update the user's fridge document in Firebase by adding the ingredient string to the ingredients array.
            await addIngredientToFridge(user.id, ingredientName);

            // Update local state to reflect the change, so that the table re-renders with the new ingredient.
            const updatedFridge = [...myFridge, ingredientName];
            setMyFridge(updatedFridge);
            setConfirmationMessage("Ingredient added to your fridge.");
        } catch (error) {
            console.error("Error adding ingredient:", error);
            alert("Failed to add ingredient. Please try again.");
        }

        // Clear the confirmation message after 3 seconds
        setTimeout(() => {
            setConfirmationMessage("");
        }, 3000);
    };


    useEffect(() => {
        if (fridge) {
            setMyFridge(fridge);
        }
    }, [fridge]);

    const validateName = (name: string) => {
        const nameRegex = /^[A-Z][a-zA-Z]*$/;
        return nameRegex.test(name);
    };



    return (
        <div>
            {myFridge.length === 0 ? (
                <>
                    <p className="text-light-4">No current Ingredients</p>
                    <DataTable columns={FridgeColumns} data={[]} />
                </>
            ) : (
                <>
                    <h1 className="h3-bold text-dark-1">Edit MyFridge</h1>
                    <DataTable
                        columns={FridgeColumns}
                        data={myFridge.map((ingredient, index) => ({
                            id: index.toString(),
                            ingredient_name: ingredient,
                        }))}
                    />
                </>
            )}

            {/* Show confirmation message */}
            {confirmationMessage && (
                <p className="text-green-500">{confirmationMessage}</p>
            )}

            {/* Show Sheet component only if the current path is /update-profile/${user.id} */}
            {pathname === `/update-profile/${user.id}` && (
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className={"shad-button_dark_4"}>Add Ingredient</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Add an Ingredient</SheetTitle>
                            <SheetDescription>
                                Add an ingredient to your fridge. This will help us provide you with better recipes.
                                Make sure to add ingredients you have at home.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Ingredient Name
                                </Label>
                                <Input
                                    id="name"
                                    value={ingredientName}
                                    onChange={(e) => setIngredientName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button type="button" className={"shad-button_dark_4"} onClick={handleAddIngredient}>
                                    Add Ingredient
                                </Button>
                            </SheetClose>
                            <Button
                                type="button"
                                className="shad-button_dark_4"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            )}
        </div>
    );
};

export default FridgeForm;
