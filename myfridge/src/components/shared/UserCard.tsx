import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface StatBlockProps {
    value: string | number;
    label: string;
}

const StatBlock = ({ value, label }: StatBlockProps) => (
    <div className="flex-center gap-2">
        <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
        <p className="small-medium lg:base-medium text-light-2">{label}</p>
    </div>
);

type UserCardProps = {
    user: IUser; // Replace with a Firebase-compatible user type
};

const UserCard = ({ user }: UserCardProps) => {
    return (

    //TODO: CHANGE TO USE THE CARD FORMAT COMPONENT
        <Card className="user-card">
            <CardHeader>
                <Link to={`/profile/${user.id}`}>
                    {/* User Profile Picture */}
                    <img
                        src={user.pfp || "/assets/icons/profile-placeholder.svg"} // Use 'pfp' for Firebase field
                        alt="creator"
                        className="rounded-full w-28 h-28"
                    />
                </Link>
                {/* Show "verified" text for content creators */}
                {user?.isVerified && (
                    <p className="small-regular text-center line-clamp-1 text-green-600">verified</p>
                )}

                {/* User Information */}
                <div className="flex-center flex-col gap-1">
                    <p className="small-regular text-light-3 text-center line-clamp-1">
                        @{user.username} {/* Username */}
                    </p>

                </div>

            </CardHeader>
            <CardContent>
                <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
                    <StatBlock value={user.recipes.length || 0} label="Recipes" />
                    <StatBlock value={user.posts.length || 0} label={"Posts"} />
                    <StatBlock value={user.followers.length || 0} label="Followers" />
                    <StatBlock value={user.following.length || 0} label="Following" />
                </div>
            </CardContent>
                <CardFooter>
                    {/* Follow Button */}
                    <Button type="button" size="sm" className="shad-button_primary px-5">
                        Follow
                    </Button>
                </CardFooter>

        </Card>
    );
};

export default UserCard;
