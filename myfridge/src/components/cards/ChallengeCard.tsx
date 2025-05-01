import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {UserAvatarRow} from "@/components/shared";
import {Badge} from "@/components/ui/badge.tsx";

const ChallengeCard = ({ challenge }: { challenge: any }) => {
    const deadlineDate = challenge.deadline?.toDate?.();
    const deadlineString = deadlineDate
        ? formatDistanceToNow(deadlineDate, { addSuffix: true })
        : "No Deadline";

    return (
        <>
        <Card className={`flex-center flex-col gap-4 border bg-dark-3 border-dark-4 rounded-[20px] px-5 py-8 relative shadow-md transition-all hover:scale-[1.02] ${
                challenge.deadline?.toDate() < new Date() ? "border-red transition" : challenge.winner ? "border-yellow-500" : "border-dark-4"
            }`}>
            <div className="flex items-center justify-between">
                <CardTitle className="flex-center text-center px-3 pt-2 truncate">{challenge.title}</CardTitle>
            </div>
            <CardHeader>
                <div className="flex items-center gap-2 mt-3">
                    <UserAvatarRow user={challenge.creator} avatarsize={"w-12 h-12"}/>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
                <p className="text-light-4 line-clamp-2">{challenge.description}</p>
                <p className="text-sm text-gray-400 mt-2">
                    Ends {deadlineString}
                </p>

                <Link to={`/challenge/${challenge.id}`}>
                    <Button size="sm" className="w-full mt-3 rounded bg-primary-500 hover:bg-primary-600">
                        View Challenge
                    </Button>
                </Link>
            </CardContent>
            {challenge.deadline?.toDate() < new Date() && (
                <Badge variant="destructive" className="absolute bg-red top-2 right-2">
                    Expired
                </Badge>
            )}

            {challenge.winner && (
                <Badge variant="destructive" className="absolute bg-yellow-500 top-2 right-2">
                    Completed
                </Badge>
            )}
        </Card>

        </>
    );
};

export default ChallengeCard;
