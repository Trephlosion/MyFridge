"use client"

import { useUserContext } from "@/context/AuthContext"; // Adjust the import according to your project structure
import { useAddIngredientToShoppingList, useRemoveIngredientFromFridge } from "@/lib/react-query/queriesAndMutations";
import { addIngredientToShoppingList, removeIngredientFromFridge  } from "@/lib/firebase/api.ts";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Fridge = {
    id: string
    ingredient_name: string

}

const fridgeColumns: ColumnDef<Fridge>[] = [
    { id: "select",
    header: ({ table }) => (
    <Checkbox
        checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
    />
),
    cell: ({ row }) => (
    <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
    />
),
    enableSorting: false,
    enableHiding: false,
},

    {
        accessorKey: "ingredient_name",
        header: "Ingredient Name",
        enableSorting: true,
        enableHiding: false,
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {

            const { user: currentUser } = useUserContext();
            const ingredientId = row.original.id;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={"bg-dark-4 rounded outline-black"}>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={async () => {
                                await removeIngredientFromFridge(currentUser.id, ingredientId);
                            }}
                        >
                            Remove Ingredient
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={async () => {
                                await addIngredientToShoppingList(currentUser.id, ingredientId);
                            }}
                        >
                            Add to Shopping List
                        </DropdownMenuItem>

                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },

]
export default fridgeColumns;
