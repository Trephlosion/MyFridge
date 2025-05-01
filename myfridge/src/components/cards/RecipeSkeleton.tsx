import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";

const RecipeSkeleton = () => {
    return (
        <Card className="recipe-card flex flex-col">
            <CardTitle className="flex-center text-center">
                <Skeleton className={"h-4 w-max-[400px] flex"}/>
            </CardTitle>
            <CardHeader className="flex justify-between px-3">
                <div className="flex flex-col items-start gap-3">
                    <Skeleton className={"w-16 h-16 rounded-full flex"}/>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <Skeleton className={"h-3 w-max-max-[400px] flex"}/>
                            <Skeleton className={"w-3 h-2 flex"}/>
                        </div>
                        <Skeleton className={"h-5 w-max-[400px] flex"}/>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-2">
                    <Skeleton className="object-cover w-2/3 h-1/3 rounded-xl flex"/>
            </CardContent>
            <CardDescription className="px-3 mt-1">
                <Skeleton className={"h-5 w-max-[400px] flex"}/>
            </CardDescription>
            <CardFooter className="mt-auto px-5 flex-row" >
                <ul className="inline-flex gap-1 mt-2 items-center">
                    <Skeleton className={"h-2 w-3 flex"}/>
                    <Skeleton className={"h-2 w-3 flex"}/>
                    <Skeleton className={"h-2 w-3 flex"}/>
                </ul>
            </CardFooter>
        </Card>
    )
}
export default RecipeSkeleton
