"use client"

import {useUserContext} from "@/context/AuthContext"; // Adjust the import according to your project structure
import {useRemoveIngredientFromFridge} from "@/lib/react-query/queriesAndMutations";
import {getTopImageForRecipe} from "@/lib/firebase/api.ts";
import {ColumnDef,} from "@tanstack/react-table"

import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Card, CardContent, CardDescription, CardFooter, CardTitle} from "@/components/ui/card.tsx";
import {AspectRatio} from "@/components/ui/aspect-ratio.tsx";
import {useEffect, useState} from "react";
import { usePathname } from "next/navigation";


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Fridge = {
    id: string
    ingredient_name: any

}

const fridgeColumns: ColumnDef<Fridge>[] = [


    {
        accessorKey: "ingredient_name",
        header: "Ingredient Name",
        enableSorting: true,
        cell: ({row}) => {
            const {user: currentUser} = useUserContext();
            const ingredientName = row.original.ingredient_name;
            const [imageUrl, setImageUrl] = useState("/assets/icons/recipe-placeholder.svg");

            useEffect(() => {
                const fetchImage = async () => {
                    const url = await getTopImageForRecipe(ingredientName);
                    setImageUrl(url);
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
                    <CardDescription className="px-3 mt-1"/>
                    <CardFooter className="mt-auto px-5"/>
                </Card>
            );
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const { user: currentUser } = useUserContext();
            const ingredientId = row.original.id;
            const { mutate: removeIngredient } = useRemoveIngredientFromFridge();
            const pathname = usePathname();

            // // Only show the edit button if on the Update Profile Page for the current user.
            // if (pathname !== `/update-profile/${currentUser.id}`) {
            //     return null;
            // }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-fit w-fit p-0">
                            Edit
                            <img src="/assets/icons/edit.svg" alt="edit" className="w-fit h-fit" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={"bg-dark-4 rounded outline-black"}>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Button
                                onClick={() =>
                                    removeIngredient({
                                        fridgeId: currentUser.myFridge,
                                        ingredient: row.original.ingredient_name,
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
    }
]
export default fridgeColumns;
