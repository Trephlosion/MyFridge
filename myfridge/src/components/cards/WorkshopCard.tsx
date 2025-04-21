// src/components/cards/WorkshopCard.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { database, storage } from "@/lib/firebase/config";
import { Workshop } from "@/types";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { multiFormatDateString } from "@/lib/utils";

type Props = {
    workshop: Workshop;
};

const WorkshopCard = ({ workshop }: Props) => {
    const navigate = useNavigate();
    const [creator, setCreator] = useState<any>({
        pfp: "/assets/icons/profile-placeholder.svg",
        username: "Unknown",
    });

    const [imageUrl, setImageUrl] = useState<string>("");

    useEffect(() => {
        const fetchCreator = async () => {
            try {
                let userRef;

                if (typeof workshop.userId === "string") {
                    userRef = doc(database, "Users", workshop.userId);
                } else if (workshop.userId && typeof workshop.userId === "object" && "_key" in workshop.userId) {
                    userRef = workshop.userId;
                } else {
                    console.warn("❌ Invalid userId:", workshop.userId);
                    return;
                }

                const creatorSnap = await getDoc(userRef);

                if (creatorSnap.exists()) {
                    const data = creatorSnap.data();
                    setCreator({
                        pfp: data.pfp || "/assets/icons/profile-placeholder.svg",
                        username: data.username || "Unknown",
                    });
                } else {
                    console.warn("User doc not found");
                }
            } catch (err) {
                console.error("Error fetching creator info:", err);
            }
        };

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

        console.log("🧪 Received workshop.userId:", workshop.userId);
        fetchCreator();
        fetchImage();
    }, [workshop]);

    const formattedDate = multiFormatDateString(
        workshop.date instanceof Date
            ? workshop.date
            : typeof workshop.date?.toDate === "function"
                ? workshop.date.toDate()
                : new Date(workshop.date)
    );

    return (
        <Card className="recipe-card flex flex-col">
            <CardTitle className="flex-center text-center px-3 pt-2">
                <h1 className="text-lg font-bold">{workshop.title}</h1>
            </CardTitle>

            <CardHeader className="flex items-center justify-between px-3">
                <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={creator.pfp} />
                        <AvatarFallback className="bg-white text-black">
                            {creator.username.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <p className="text-light-3 text-sm font-semibold">@{creator.username}</p>
                </div>
                <p className="text-xs text-gray-500">{formattedDate}</p>
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

            <CardFooter className="mt-auto px-3 pb-3">
                <p className="text-sm text-gray-500">Location: {workshop.location}</p>
            </CardFooter>
        </Card>
    );
};

export default WorkshopCard;