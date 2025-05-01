import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {UserAvatarRow} from "@/components/shared";

const ChallengeCard = ({ challenge }: { challenge: any }) => {
    const deadlineDate = challenge.deadline?.toDate?.();
    const deadlineString = deadlineDate
        ? formatDistanceToNow(deadlineDate, { addSuffix: true })
        : "No Deadline";

    return (
        <Card className="recipe-card flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex-center text-center px-3 pt-2 truncate">{challenge.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <UserAvatarRow user={challenge.creator}/>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
                <p className="text-light-4 line-clamp-2">{challenge.description}</p>
                <p className="text-sm text-gray-400 mt-2">
                    Ends {deadlineString}
                </p>

                <Link to={`/challenge/${challenge.id}`}>
                    <Button size="sm" className="w-full mt-3">
                        View Challenge
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
};

export default ChallengeCard;
