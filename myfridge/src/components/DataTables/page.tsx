import { Fridge, fridgeColumns } from "./fridgeColumns.tsx"
import { DataTable } from "./data-table"

async function getData(): Promise<Fridge[]> {
    // Fetch data from your API here.

    // Ingredient name shouuld use a query  to grab the ingredient name from the database
    return [
        {
            id: "728ed52f",
            ingredient_name: "Tomato",
        },
        // ...
    ]
}

const Page = async () => {
    const data = await getData()

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    )
}
export default Page
