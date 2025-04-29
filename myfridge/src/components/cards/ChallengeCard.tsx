import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const ChallengeCard = ({ challenge }: { challenge: any }) => {
    const deadlineDate = challenge.deadline?.toDate?.();
    const deadlineString = deadlineDate
        ? formatDistanceToNow(deadlineDate, { addSuffix: true })
        : "No Deadline";

    return (
        <Card className="flex flex-col justify-between bg-dark-4 hover:scale-[1.02] transition">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg truncate">{challenge.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={challenge.creatorData?.pfp || "/assets/icons/profile-placeholder.svg"} />
                        <AvatarFallback>{challenge.creatorData?.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-light-3">@{challenge.creatorData?.username}</p>
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
