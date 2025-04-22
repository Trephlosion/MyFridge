import { useEffect, useState } from "react"; import { useNavigate } from "react-router-dom"; import { getDownloadURL, ref } from "firebase/storage"; import { Workshop } from "@/types"; import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription, } from "@/components/ui/card"; import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; import { AspectRatio } from "@/components/ui/aspect-ratio"; import { multiFormatDateString } from "@/lib/utils"; import { storage } from "@/lib/firebase/config";

type Props = { workshop: Workshop; };

const WorkshopCard = ({ workshop }: Props) => { const navigate = useNavigate(); const [imageUrl, setImageUrl] = useState<string>("");

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

        fetchImage();
    }, [workshop.media_url]);

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

            <CardFooter className="mt-auto px-3 pb-3">
                <p className="text-sm text-gray-500">Location: {workshop.location}</p>
            </CardFooter>
        </Card>
    );
};

export default WorkshopCard;