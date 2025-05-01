import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";

const RecipeSkeleton = () => {
    return (
        <Card className="recipe-card flex flex-col">
            <CardTitle className="flex-center text-center">
                <Skeleton className={"h-4 w-[400px]"}/>
            </CardTitle>
            <CardHeader className="flex justify-between px-3">
                <div className="flex flex-col items-start gap-3">
                    <Skeleton className={"w-16 h-16 rounded-full"}/>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <Skeleton className={"h-3 w-[400px]"}/>
                            <Skeleton className={"w-3 h-2"}/>
                        </div>
                        <Skeleton className={"h-5 w-[400px]"}/>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-2">
                    <Skeleton className="object-cover w-[400px] h-[200px] rounded-xl"/>
            </CardContent>
            <CardDescription className="px-3 mt-1">
                <Skeleton className={"h-5 w-[400px]"}/>
            </CardDescription>
            <CardFooter className="mt-auto px-5 flex-row" >
                <ul className="inline-flex gap-1 mt-2 items-center">
                    <Skeleton className={"h-2 w-3"}/>
                    <Skeleton className={"h-2 w-3"}/>
                    <Skeleton className={"h-2 w-3"}/>
                </ul>
            </CardFooter>
        </Card>
    )
}
export default RecipeSkeleton
