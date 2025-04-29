// Now modularly fixing WorkshopStats.tsx (normalized, minimal changes needed)

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Workshop } from "@/types";
import { useLikeWorkshop, useSaveWorkshop, useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";
import { checkIsLiked } from "@/lib/utils";

interface WorkshopStatsProps {
    workshop: Workshop;
    userId: string;
}

const WorkshopStats = ({ workshop, userId }: WorkshopStatsProps) => {
    const location = useLocation();

    const [likes, setLikes] = useState<string[]>(workshop.likes || []);
    const [isSaved, setIsSaved] = useState(false);

    const { mutate: likeWorkshop } = useLikeWorkshop();
    const { mutate: saveWorkshop } = useSaveWorkshop();
    const { data: currentUser } = useGetCurrentUser();

    const savedWorkshopRecord = currentUser?.savedWorkshops?.find(
        (record: { workshopId: string }) => record.workshopId === workshop.id
    );

    useEffect(() => {
        setIsSaved(!!savedWorkshopRecord);
    }, [currentUser, savedWorkshopRecord]);

    const handleLikeWorkshop = (e: React.MouseEvent<HTMLImageElement>) => {
        e.stopPropagation();

        let updatedLikes = [...likes];
        if (updatedLikes.includes(userId)) {
            updatedLikes = updatedLikes.filter((id) => id !== userId);
        } else {
            updatedLikes.push(userId);
        }
        setLikes(updatedLikes);

        likeWorkshop({ workshopId: workshop.id, likesArray: updatedLikes });
    };

    const handleSaveWorkshop = (e: React.MouseEvent<HTMLImageElement>) => {
        e.stopPropagation();

        if (savedWorkshopRecord) {
            setIsSaved(false);
            // Optionally, trigger delete save workshop mutation
        } else {
            saveWorkshop({ userId: userId, workshopId: workshop.id });
            setIsSaved(true);
        }
    };

    const containerStyles = location.pathname.startsWith("/profile") ? "w-full" : "";

    return (
        <div className={`flex justify-between items-center z-20 ${containerStyles}`}>
            <div className="flex gap-2 mr-5">
                <img
                    src={checkIsLiked(likes, userId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
                    alt="like"
                    width={20}
                    height={20}
                    onClick={handleLikeWorkshop}
                    className="cursor-pointer"
                />
                <p className="small-medium lg:base-medium">{likes.length}</p>
            </div>

            <div className="flex gap-2">
                <img
                    src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
                    alt="save"
                    width={20}
                    height={20}
                    className="cursor-pointer"
                    onClick={handleSaveWorkshop}
                />
            </div>
        </div>
    );
};

export { WorkshopStats };
