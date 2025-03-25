import { Link } from "react-router-dom";
import { WorkshopStats } from "@/components/shared/WorkshopStats"; // Replace with the correct stats component for workshops
import { useUserContext } from "@/context/AuthContext";
import { Workshop, IUser } from "@/types";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { database } from "@/lib/firebase/config";

type GridWorkshopListProps = {
    workshops: Workshop[]; // List of workshops
    showUser?: boolean;
    showStats?: boolean;
};

const GridWorkshopList = ({
                              workshops,
                              showUser = true,
                              showStats = true,
                          }: GridWorkshopListProps) => {
    const { user } = useUserContext();

    // Local state to hold user details
    const [creators, setCreators] = useState<{ [key: string]: IUser | null }>({});

    // Fetch creator data from Firestore
    useEffect(() => {
        const fetchCreators = async () => {
            const creatorData: { [key: string]: IUser | null } = {};

            for (const workshop of workshops) {
                if (workshop.userId && !creators[workshop.userId]) {
                    try {
                        const userDocRef = doc(database, "User", workshop.userId);
                        const userSnap = await getDoc(userDocRef);

                        if (userSnap.exists()) {
                            creatorData[workshop.userId] = {
                                id: userSnap.id,
                                ...(userSnap.data() as IUser),
                            };
                        } else {
                            creatorData[workshop.userId] = null;
                        }
                    } catch (error) {
                        console.error("Error fetching creator data:", error);
                        creatorData[workshop.userId] = null;
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
                    const creator = creators[workshop.userId];

                    return (
                        <li key={workshop.id} className="relative m-4">
                            {/* Link to Workshop Details */}
                            <Link to={`/workshops/${workshop.id}`} className="block relative">
                                {/* Polaroid Frame */}
                                <div className="polaroid-frame relative w-full">
                                    <img
                                        src={workshop.pfpId || "/assets/icons/profile-placeholder.svg"}
                                        alt="workshop"
                                        className="w-full h-auto object-cover rounded-xl"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-2 text-center bg-white opacity-80">
                                        <p className="text-sm font-semibold">{workshop.title}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* User Info and Stats */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 flex items-center justify-between">
                                {showUser && creator && (
                                    <div className="flex items-center gap-2 flex-1">
                                        <img
                                            src={creator.pfp || "/assets/icons/profile-placeholder.svg"}
                                            alt="creator"
                                            className="w-100 h-100 rounded-full"
                                        />
                                        <p className="line-clamp-1">
                                            {user.username}
                                        </p>
                                    </div>
                                )}
                                {showStats && <WorkshopStats workshop={workshop} userId={user.id} />}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default GridWorkshopList;
