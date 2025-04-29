// Let's start modular and corrected.
// I'll first give you the rewritten GridWorkshopList.tsx, then WorkshopCard, etc.
// Normalized to use DocumentReference fields properly.

import { Link } from "react-router-dom";
import { WorkshopStats } from "@/components/cards/WorkshopStats";
import { useUserContext } from "@/context/AuthContext";
import { Workshop, IUser } from "@/types";
import { useEffect, useState } from "react";
import { getDoc } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GridWorkshopListProps {
    workshops: Workshop[];
    showUser?: boolean;
    showStats?: boolean;
}

const GridWorkshopList = ({ workshops, showUser = true, showStats = true }: GridWorkshopListProps) => {
    const { user } = useUserContext();
    const [creators, setCreators] = useState<{ [key: string]: IUser | null }>({});

    useEffect(() => {
        const fetchCreators = async () => {
            const creatorData: { [key: string]: IUser | null } = {};

            for (const workshop of workshops) {
                const ref = workshop.userId;
                if (ref && !creators[ref.id]) {
                    try {
                        const userSnap = await getDoc(ref);
                        if (userSnap.exists()) {
                            creatorData[ref.id] = {
                                id: userSnap.id,
                                ...(userSnap.data() as IUser),
                            };
                        } else {
                            creatorData[ref.id] = null;
                        }
                    } catch (error) {
                        console.error("Error fetching creator data:", error);
                        creatorData[ref.id] = null;
                    }
                }
            }

            setCreators((prev) => ({ ...prev, ...creatorData }));
        };

        fetchCreators();
    }, [workshops]);

    return (
        <div className="max-w-screen-xl mx-auto px-4">
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {workshops.map((workshop) => {
                    const creator = creators[workshop.userId?.id];

                    return (
                        <li key={workshop.id} className="relative m-4">
                            <Link to={`/workshop/${workshop.id}`} className="block relative">
                                <div className="polaroid-frame relative w-full">
                                    <img
                                        src={workshop.media_url || "/assets/icons/recipe-placeholder.svg"}
                                        alt="workshop"
                                        className="w-full h-60 object-cover rounded-xl"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-2 text-center bg-white bg-opacity-80">
                                        <p className="text-sm font-semibold">{workshop.title}</p>
                                    </div>
                                </div>
                            </Link>

                            {showUser && creator && (
                                <div className="flex items-center gap-2 p-2">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={creator.pfp || "/assets/icons/profile-placeholder.svg"} />
                                        <AvatarFallback className="bg-white text-black">{creator.username.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-xs text-white">@{creator.username}</p>
                                </div>
                            )}

                            {showStats && (
                                <div className="absolute top-2 right-2">
                                    <WorkshopStats workshop={workshop} userId={user.id} />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default GridWorkshopList;
