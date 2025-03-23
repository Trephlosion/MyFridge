import {Skeleton} from "@/components/ui/skeleton"
// render in a Card format
import {Card, CardContent, CardFooter, CardHeader,} from "@/components/ui/card"


const UserSkeletonCard = () => {
    return (
        <Card className="user-card w-fit-content">
            <CardHeader>
                <Skeleton className={"rounded-full w-28 h-28"} />

                <Skeleton className={"h-4 flex-grow"} />
                <Skeleton className={"h-6 flex-grow"} />


            </CardHeader>
            <CardContent>
                <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
                    <Skeleton className={"h-4 flex-grow"} />
                    <Skeleton className={"h-4 flex-grow"} />
                    <Skeleton className={"h-4 flex-grow"} />
                    <Skeleton className={"h-4 flex-grow"} />
                </div>
            </CardContent>
            <CardFooter>

            </CardFooter>

        </Card>
    )
}
export default UserSkeletonCard
