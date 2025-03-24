"use client"

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
import { useUserContext } from "@/context/AuthContext"; // Adjust the import according to your project structure
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
import {DataTableColumnHeader} from "@/components/DataTables/DataTableColumnHeader.tsx";
import {addIngredientToShoppingList, removeIngredientFromFridge} from "@/lib/firebase/api.ts";
import { useNavigate } from "react-router-dom";
// Inside your component



// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Admin = {
    id: string
    username: string
    email: string
    role: string
    created_at: Date


}

const adminColumns: ColumnDef<Admin>[] = [

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
            aria-label={`Select ${row.values.username}`}
        />
    ),
},


    {
    accessorKey: "username",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Username" />
    ),
},
    {
        accessorKey: "email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
    },
    {
        accessorKey: "role",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Role" />
        ),
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created At" />
        ),
    },

    {
        accessorKey: "actions",
        header: "Actions",
        cell: ({row}) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => (`/profile/${row.original.id}`)}
                        >
                            View User Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                        <DropdownMenuItem

                        >
                            Change Admin Role
                        </DropdownMenuItem>
                        <DropdownMenuItem

                        >
                            Change Creator Role
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                            Change Curator Role
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                            Ban User
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                            Deactivate User
                        </DropdownMenuItem>

                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    }
]

export default adminColumns;
