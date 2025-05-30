// Continuing modular fixes. Now WorkshopCard.tsx.
// Normalized to handle DocumentReferences properly for userId, participants, and media_url.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Workshop } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { database, storage } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";
import {UserAvatarRow} from "@/components/shared";

interface WorkshopCardProps {
    workshop: Workshop;
}

const WorkshopCard = ({ workshop }: WorkshopCardProps) => {
    const navigate = useNavigate();
    const { user } = useUserContext();
    const [creator, setCreator] = useState<{ username: string; pfp: string } | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [enrolled, setEnrolled] = useState(false);
    const [participantsCount, setParticipantsCount] = useState(0);

    useEffect(() => {
        const fetchCreatorAndImage = async () => {
            if (workshop.userId) {
                const userSnap = await getDoc(workshop.userId);
                if (userSnap.exists()) {
                    const data = userSnap.data() as { username: string; pfp: string };
                    setCreator({ username: data.username, pfp: data.pfp });
                }
            }

            if (workshop.media_url?.startsWith("http")) {
                setImageUrl(workshop.media_url);
            } else if (workshop.media_url) {
                try {
                    const url = await getDownloadURL(storageRef(storage, workshop.media_url));
                    setImageUrl(url);
                } catch {
                    setImageUrl("/assets/icons/recipe-placeholder.svg");
                }
            }
        };

        const checkEnrollment = async () => {
            if (!user || !workshop.id) return;
            const workshopRef = doc(database, "Workshops", workshop.id);
            const snap = await getDoc(workshopRef);
            const data = snap.data();
            if (data?.participants?.some((ref: any) => ref.id === user.id)) {
                setEnrolled(true);
            }
            setParticipantsCount(data?.participants?.length || 0);
        };

        fetchCreatorAndImage();
        checkEnrollment();
    }, [workshop.id, workshop.media_url, workshop.userId, user]);

    const handleEnroll = async () => {
        if (!user || !workshop.id) return;
        if (participantsCount >= workshop.maxParticipants) {
            alert("Workshop is full");
            return;
        }

        const refDoc = doc(database, "Workshops", workshop.id);
        await updateDoc(refDoc, {
            participants: arrayUnion(doc(database, "Users", user.id)),
        });

        setEnrolled(true);
        setParticipantsCount((prev) => prev + 1);
    };

    const handleUnenroll = async () => {
        if (!user || !workshop.id) return;

        const refDoc = doc(database, "Workshops", workshop.id);
        await updateDoc(refDoc, {
            participants: arrayRemove(doc(database, "Users", user.id)),
        });

        setEnrolled(false);
        setParticipantsCount((prev) => Math.max(0, prev - 1));
    };

    return (
        <Card className="recipe-card flex flex-col">
            <CardTitle className="flex-center text-center px-3 pt-2 truncate">
                <h1 className="text-lg font-bold">{workshop.title}</h1>
            </CardTitle>

            <CardHeader className="flex items-center justify-between px-3">
                <UserAvatarRow user={workshop.userId} />
                <div className="flex items-center gap-1 text-xs text-gray-500">

                    <p>{participantsCount} participants</p>
                </div>
            </CardHeader>

            <CardContent className="p-2">
                <div onClick={() => navigate(`/workshop/${workshop.id}`)} className="cursor-pointer">
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
                            <Button onClick={handleUnenroll} className="bg-red transition hover:bg-dark-3 text-white w-full">
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
