import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";

const RecipeSkeleton = () => {
    return (
        <Card className="recipe-card">
            <CardTitle className={"flex-center text-center"}>
                <Skeleton className={"h-5 flex-grow"}/>
            </CardTitle>
            <CardHeader className="flex-between">
                <div className="flex items-center gap-3">
                    <Skeleton className={"w-12 lg:h-12 rounded-full"} />
                    <div className="flex flex-col">
                            <Skeleton className={"h-4 flex-grow"}/>
                        <div className="flex-center gap-2 text-light-3">
                            <Skeleton className={"h-8 flex-grow"}/>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardDescription>
                <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
                    <Skeleton className={"h-4 flex-grow"} />
                    <Skeleton className={"h-4 flex-grow"} />
                </div>
            </CardDescription>
            <CardContent className="small-medium lg:base-medium py-2.5">
                    <Skeleton className={"h-8 w-2/3 flex-grow"} />
            </CardContent>
            <CardFooter className={"flex-col"}>
                <Skeleton className={"h-4 w-1/3 flex-grow"}/>
                <ul className="flex-row gap-1 mt-2">
                        <li className="text-light-3 small-regular">
                            <Skeleton className={"h-4 w-1/5 flex-grow"}/>
                            <Skeleton className={"h-4 w-1/5 flex-grow"}/>
                            <Skeleton className={"h-4 w-1/5 flex-grow"}/>
                            <Skeleton className={"h-4 w-1/5 flex-grow"}/>
                        </li>
                </ul>
            </CardFooter>
        </Card>
    )
}
export default RecipeSkeleton
