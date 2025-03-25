import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDownloadURL, ref } from "firebase/storage";
import { useUserContext } from "@/context/AuthContext";
import { Workshop } from "@/types";
import { storage } from "@/lib/firebase/config";
import WorkshopStats from "@/components/shared/WorkshopStats.tsx";
import { multiFormatDateString } from "@/lib/utils"; // Assuming this helper formats date

type WorkshopCardProps = {
    workshop: Workshop;
};

const WorkshopCard = ({ workshop }: WorkshopCardProps) => {
    const { user } = useUserContext();
    const [imageUrl, setImageUrl] = useState<string>(""); // State for workshop image

    // Fetch workshop image URL from Firebase Storage
    useEffect(() => {
        const fetchImageUrl = async () => {
            if (workshop.pfpId) {
                try {
                    const fileRef = ref(storage, workshop.pfpId); // Use pfpId as storage path
                    const url = await getDownloadURL(fileRef);
                    setImageUrl(url); // Set the fetched URL
                } catch (error) {
                    console.error("Error fetching image URL:", error);
                    setImageUrl("/assets/icons/profile-placeholder.svg"); // Fallback image
                }
            } else {
                setImageUrl("/assets/icons/profile-placeholder.svg"); // Fallback if no pfpId
            }
        };

        fetchImageUrl();
    }, [workshop.pfpId]);

    if (!workshop.userId) return null; // Ensures the workshop has an associated user

    // Convert Firestore Timestamp to Date string
    const formattedDate = multiFormatDateString(workshop.createdAt.toDate().toString());

    return (
        <div className="workshop-card">
            {/* Workshop Header */}
            <div className="flex-between">
                <div className="flex items-center gap-3">
                    {/* Link to Creator's Profile */}
                    <Link to={`/profile/${workshop.userId}`}>
                        <img
                            src={imageUrl || "/assets/icons/profile-placeholder.svg"}
                            alt="creator"
                            className="w-12 lg:h-12 rounded-full"
                        />
                    </Link>
                    {/* User Info */}
                    <div className="flex flex-col">
                        <Link to={`/profile/${workshop.userId}`}>
                            <p className="text-light-1 lg:medium-bold">
                                {user.username}
                            </p>
                        </Link>
                        <div className="flex-center gap-2 text-light-3">
                            <p className="subtle-semibold lg:small-regular">
                                {formattedDate}
                            </p>
                            <p className="subtle-semibold lg:small-regular">
                                {workshop.likes?.length || 0} likes
                            </p>
                        </div>
                    </div>
                </div>
                {/* Edit Workshop Link */}
                {user?.id === workshop.userId && (
                    <Link to={`/update-workshop/${workshop.id}`}>
                        <img
                            src={"/assets/icons/edit.svg"}
                            alt="edit"
                            width={20}
                            height={20}
                        />
                    </Link>
                )}
            </div>

            {/* Workshop Content */}
            <Link to={`/workshops/${workshop.id}`}>
                <div className="small-medium lg:base-medium py-5">
                    <p>{workshop.title}</p>
                    <ul className="flex gap-1 mt-2">
                        {workshop.tags?.map((tag: string, index: number) => (
                            <li
                                key={`${tag}${index}`}
                                className="text-light-3 small-regular"
                            >
                                #{tag}
                            </li>
                        ))}
                    </ul>
                </div>
                <img
                    src={imageUrl || "/assets/icons/profile-placeholder.svg"}
                    alt="workshop image"
                    className="workshop-card_img"
                />
            </Link>
            <WorkshopStats workshop={workshop} userId={user.id} />
        </div>
    );
};

export default WorkshopCard;
