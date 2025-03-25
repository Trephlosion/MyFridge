import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { checkIsLiked } from "@/lib/utils";
import {
    useLikeWorkshop,
    useSaveWorkshop,
    useGetCurrentUser,
} from "@/lib/react-query/queriesAndMutations";
import { Workshop } from "@/types";  // Ensure this import is correct



type WorkshopStatsProps = {
    workshop: Workshop;
    userId: string;
};

const WorkshopStats = ({ workshop, userId }: WorkshopStatsProps) => {
    const location = useLocation();

    // Initialize likes list from Firestore
    const [likes, setLikes] = useState<string[]>(workshop.likes || []);
    const [isSaved, setIsSaved] = useState(false);

    // React Query hooks for liking and saving workshops
    const { mutate: likeWorkshop } = useLikeWorkshop();
    const { mutate: saveWorkshop } = useSaveWorkshop();
    //const { mutate: deleteSaveWorkshop } = useDeleteSavedWorkshop();
    const { data: currentUser } = useGetCurrentUser();

    // Check if the workshop is already saved
    const savedWorkshopRecord = currentUser?.savedWorkshops?.find(
        (record: { workshopId: string }) => record.workshopId === workshop.id
    );

    useEffect(() => {
        setIsSaved(!!savedWorkshopRecord);
    }, [currentUser, savedWorkshopRecord]);

    const handleLikeWorkshop = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.stopPropagation();

        let likesArray = [...likes];
        if (likesArray.includes(userId)) {
            // Remove like
            likesArray = likesArray.filter((id) => id !== userId);
        } else {
            // Add like
            likesArray.push(userId);
        }
        setLikes(likesArray);

        // Update likes in Firestore
        likeWorkshop({ workshopId: workshop.id, likesArray });
    };

    const handleSaveWorkshop = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.stopPropagation();

        if (savedWorkshopRecord) {
            // Delete saved workshop
            setIsSaved(false);
            //deleteSaveWorkshop(savedWorkshopRecord.id);
        } else {
            // Save workshop
            saveWorkshop({ userId: userId, workshopId: workshop.id });
            setIsSaved(true);
        }
    };

    const containerStyles = location.pathname.startsWith("/profile") ? "w-full" : "";

    return (

            <div className={`flex justify-between items-center z-20 ${containerStyles}`}>
                {/* Likes Section */}
                <div className="flex gap-2 mr-5">
                    <img
                        src={`${
                            checkIsLiked(likes, userId)
                                ? "/assets/icons/liked.svg"
                                : "/assets/icons/like.svg"
                        }`}
                        alt="like"
                        width={20}
                        height={20}
                        onClick={(e) => handleLikeWorkshop(e)}
                        className="cursor-pointer"
                    />
                    <p className="small-medium lg:base-medium">{likes.length}</p>
                </div>

                {/* Save Section */}
                <div className="flex gap-2">
                    <img
                        src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
                        alt="save"
                        width={20}
                        height={20}
                        className="cursor-pointer"
                        onClick={(e) => handleSaveWorkshop(e)}
                    />
                </div>
            </div>
            );
            };

            export {WorkshopStats}; // Exporting WorkshopStats
