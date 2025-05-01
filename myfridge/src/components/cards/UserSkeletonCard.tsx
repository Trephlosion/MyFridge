import {Skeleton} from "@/components/ui/skeleton.tsx"
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card.tsx"

const UserSkeletonCard = () => {
    return (
        <Card className="flex-center flex-col gap-4 border bg-dark-3 border-dark-4 rounded-[20px] px-5 py-8" style={{ width: "300px", height: "400px" }}>
            <CardHeader>
                <Skeleton className={"rounded-full w-28 h-28"} />
                <Skeleton className={"h-4 flex"} />
                <Skeleton className={"h-6 flex"} />
            </CardHeader>
            <CardContent>
                <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
                    <Skeleton className={"h-4 flex"} />
                    <Skeleton className={"h-4 flex"} />
                    <Skeleton className={"h-4 flex"} />
                    <Skeleton className={"h-4 flex"} />
                    <Skeleton className={"h-4 flex"} />
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className={"h-4 flex"} />
            </CardFooter>
        </Card>
    )
}
export default UserSkeletonCard
