import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types"; // Define a User type for Firebase-compatible data

type UserCardProps = {
    user: IUser; // Replace with a Firebase-compatible user type
};

const UserCard = ({ user }: UserCardProps) => {
    return (
        <Link to={`/profile/${user.id}`} className="user-card">
            {/* User Profile Picture */}
            <img
                src={user.pfp || "/assets/icons/profile-placeholder.svg"} // Use 'pfp' for Firebase field
                alt="creator"
                className="rounded-full w-14 h-14"
            />

            {/* User Information */}
            <div className="flex-center flex-col gap-1">
                <p className="small-regular text-light-3 text-center line-clamp-1">
                    @{user.username} {/* Username */}
                </p>
            </div>

            {/* Follow Button */}
            <Button type="button" size="sm" className="shad-button_primary px-5">
                Follow
            </Button>
        </Link>
    );
};

export default UserCard;
