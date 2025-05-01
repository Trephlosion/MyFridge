import { useUserContext } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useRemoveIngredientFromFridge } from "@/lib/react-query/queriesAndMutations";
import { DataTable } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";
import {getAllFridgeIngredients} from "@/lib/firebase/api.ts";
import {Button} from "@/components/ui/button.tsx";

type Row = { ingredientName: string };

export default function IngredientsTable() {
    const { user } = useUserContext();
    const fridgeId = user!.myFridge!;

    // fetch the full fridge so we can list out .ingredients[]
    const { data: fridge } = useQuery(["fridge", fridgeId], () =>
        getAllFridgeIngredients(fridgeId) // your existing fetcher
    );

    const { mutate: removeIngredient } = useRemoveIngredientFromFridge();

    // build rows from the ingredients string[]
    const rows: Row[] = fridge?.ingredients.map(name => ({ ingredientName: name })) ?? [];

    // now define columns *inside* the component
    const columns = React.useMemo<ColumnDef<Row>[]>(
        () => [
            { accessorKey: "ingredientName", header: "Ingredient" },
            {
                id: "actions",
                cell: ({ row }) => (
                    <Button
                        variant="destructive"
                        onClick={() =>
                            removeIngredient({
                                fridgeId,
                                ingredientName: row.original.ingredientName,
                            })
                        }
                    >
                        Remove
                    </Button>
                ),
            },
        ],
        [fridgeId, removeIngredient]
    );

    return <DataTable columns={columns} data={rows} />;
}
