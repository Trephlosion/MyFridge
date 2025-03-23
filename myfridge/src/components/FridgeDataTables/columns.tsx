"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Fridge = {
    id: string
    ingredient_name: string


}

export const columns: ColumnDef<Fridge>[] = [
    {
        accessorKey: "ingredient_name",
        header: "Ingredient Name",
    },

]
