import { useUserContext } from "@/context/AuthContext";
import { useRemoveIngredientFromFridge } from "@/lib/react-query/queriesAndMutations";
import { getTopImageForRecipe } from "@/lib/firebase/api";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {DocumentReference} from "firebase/firestore";

export type Fridge = {
    id: string;
    ingredient_name: string;
};

const IngredientCard = ({ ingredientName }: { ingredientName: string }) => {
    const [imageUrl, setImageUrl] = useState("/assets/icons/recipe-placeholder.svg");

    useEffect(() => {
        const fetchImage = async () => {
            const url = await getTopImageForRecipe(ingredientName);
            if (url) setImageUrl(url);
        };
        fetchImage();
    }, [ingredientName]);

    return (
        <Card className="recipe-card flex flex-col transition-all hover:scale-[1.02]">
            <CardTitle className="flex-center text-center">
                <h1 className="text-lg font-bold">{ingredientName}</h1>
            </CardTitle>
            <CardContent className="p-2">
                <AspectRatio ratio={16 / 9} className="w-full rounded overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={ingredientName}
                        className="object-cover w-full h-full rounded"
                    />
                </AspectRatio>
            </CardContent>
            <CardDescription className="px-3 mt-1" />
            <CardFooter className="mt-auto px-5" />
        </Card>
    );
};

const fridgeColumns: ColumnDef<Fridge>[] = [
    {
        accessorKey: "ingredient_name",
        header: "Ingredient Name",
        enableSorting: true,
        cell: ({ row }) => {
            return <IngredientCard ingredientName={row.original.ingredient_name} />;
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const { user: currentUser } = useUserContext();
            const ingredientName = row.original.ingredient_name;
            const { mutate: removeIngredient } = useRemoveIngredientFromFridge();
            const location = useLocation();

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-fit w-fit p-0">
                            Edit
                            <img src="/assets/icons/edit.svg" alt="edit" className="w-fit h-fit ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-dark-4 rounded outline-black">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Button
                                variant="destructive"
                                onClick={() =>
                                    removeIngredient({
                                        fridgeId: currentUser.myFridge,
                                        ingredient: ingredientName,
                                    })
                                }
                            >
                                Remove Ingredient
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default fridgeColumns;
