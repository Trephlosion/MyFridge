import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref } from "firebase/storage";
import {
    doc,
    updateDoc,
    getDoc,
    arrayUnion,
    arrayRemove,
} from "firebase/firestore";
import { Workshop } from "@/types";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { multiFormatDateString } from "@/lib/utils";
import { database, storage } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";

type Props = {
    workshop: Workshop;
};

const WorkshopCard = ({ workshop }: Props) => {
    const navigate = useNavigate();
    const { user } = useUserContext();
    const [imageUrl, setImageUrl] = useState<string>("");
    const [enrolled, setEnrolled] = useState(false);
    const [participantsCount, setParticipantsCount] = useState<number>(workshop.participants?.length || 0);

    useEffect(() => {
        const fetchImage = async () => {
            if (workshop.media_url?.startsWith("http")) {
                setImageUrl(workshop.media_url);
            } else if (workshop.media_url) {
                try {
                    const url = await getDownloadURL(ref(storage, workshop.media_url));
                    setImageUrl(url);
                } catch (error) {
                    setImageUrl("/assets/icons/recipe-placeholder.svg");
                }
            } else {
                setImageUrl("/assets/icons/recipe-placeholder.svg");
            }
        };

        const checkEnrollment = async () => {
            if (!user || !workshop.id) return;
            const workshopRef = doc(database, "Workshops", workshop.id);
            const snap = await getDoc(workshopRef);
            const data = snap.data();
            if (data?.participants?.includes(user.id)) {
                setEnrolled(true);
            }
            setParticipantsCount(data?.participants?.length || 0);
        };

        fetchImage();
        checkEnrollment();
    }, [workshop.media_url, user, workshop.id]);

    const handleEnroll = async () => {
        if (!user || !workshop.id) return;
        if (participantsCount >= workshop.maxParticipants) {
            alert("Workshop is full");
            return;
        }

        const refDoc = doc(database, "Workshops", workshop.id);
        await updateDoc(refDoc, {
            participants: arrayUnion(user.id),
        });

        setEnrolled(true);
        setParticipantsCount((prev) => prev + 1);
    };

    const handleUnenroll = async () => {
        if (!user || !workshop.id) return;

        const refDoc = doc(database, "Workshops", workshop.id);
        await updateDoc(refDoc, {
            participants: arrayRemove(user.id),
        });

        setEnrolled(false);
        setParticipantsCount((prev) => Math.max(0, prev - 1));
    };

    return (
        <Card className="recipe-card flex flex-col">
            <CardTitle className="flex-center text-center px-3 pt-2">
                <h1 className="text-lg font-bold">{workshop.title}</h1>
            </CardTitle>

            <CardHeader className="flex items-center justify-between px-3">
                <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={workshop.creatorPfp || "/assets/icons/profile-placeholder.svg"} />
                        <AvatarFallback className="bg-white text-black">
                            {(workshop.creatorUsername || "U").charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <p className="text-light-3 text-sm font-semibold">
                        @{workshop.creatorUsername || "Unknown"}
                    </p>
                </div>
                <p className="text-xs text-gray-500">
                    {multiFormatDateString(workshop.date?.toString() || "")}
                </p>
            </CardHeader>

            <CardContent className="p-2">
                <div
                    onClick={() => navigate(`/workshop/${workshop.id}`)}
                    className="cursor-pointer"
                >
                    <AspectRatio ratio={16 / 9} className="w-full rounded overflow-hidden">
                        <img
                            src={imageUrl}
                            alt={workshop.title}
                            className="object-cover w-full h-full rounded"
                        />
                    </AspectRatio>
                </div>
            </CardContent>

            <CardDescription className="px-3 mt-1 text-sm text-gray-700 line-clamp-2">
                {workshop.description}
            </CardDescription>

            <CardFooter className="mt-auto flex flex-col gap-2 px-3 pb-3">
                <p className="text-sm text-gray-500">Location: {workshop.location}</p>
                {!user?.isVerified && (
                    <>
                        {enrolled ? (
                            <Button onClick={handleUnenroll} className="bg-red-600 hover:bg-red-700 text-white w-full">
                                Unenroll
                            </Button>
                        ) : (
                            <Button onClick={handleEnroll} className="bg-green-600 hover:bg-green-700 text-white w-full">
                                Enroll
                            </Button>
                        )}
                        <p className="text-xs text-gray-400 text-center">
                            Enrolled: {participantsCount} / {workshop.maxParticipants}
                        </p>
                    </>
                )}
            </CardFooter>
        </Card>
    );
};

export default WorkshopCard;
