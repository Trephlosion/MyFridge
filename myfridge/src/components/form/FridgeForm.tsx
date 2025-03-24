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
    const [refresh, setRefresh] = useState(false);
    const { data: fridge, refetch } = useGetAllFridgeIngredients(user.id);
    // const addIngredientMutation = useAddIngredient();
    // const createIngredientMutation = useCreateIngredient();
    const navigate = useNavigate();

    useEffect(() => {
        if (refresh) {
            refetch();
            setRefresh(false);
        }
    }, [refresh, refetch]);

    const validateName = (name: string) => {
        const nameRegex = /^[A-Z][a-zA-Z]*$/;
        return nameRegex.test(name);
    };

    const handleAddIngredient = async () => {
        if (!validateName(ingredientName)) {
            alert("Invalid ingredient name. It must be one word, start with a capital letter, and contain no numbers.");
            return;
        }


        // Check if ingredient already exists
        const existingIngredient = await getIngredientByName(ingredientName);
        if (existingIngredient) {
            // Add ingredient to user's fridge
            const existingInFridge = fridge?.find((item) => item.ingredientId.id === existingIngredient.id);
            if (existingInFridge) {
                alert("Ingredient already exists in your fridge.");
            } else {
                await addIngredientToFridge(user.id, existingIngredient.id);
                alert("Ingredient added to your fridge.");
                setRefresh(true);
            }
        } else {
            // Create new ingredient document
            await createNewIngredient(ingredientName);
            const newIngredient = await getIngredientByName(ingredientName);
            await addIngredientToFridge(user.id, newIngredient.id);
            alert("New ingredient created and added to your fridge.");
            setRefresh(true);
        }    };

    return (
        <div>
            {Array.isArray(fridge) && fridge.length === 0 ? (
                <>
                    <p className="text-light-4">No current Ingredients</p>
                    <DataTable columns={FridgeColumns} data={[]} />
                </>
            ) : (
                <>
                    <h1 className="h3-bold text-dark-1">Edit MyFridge</h1>
                    <DataTable columns={FridgeColumns} data={fridge} />
                </>
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
