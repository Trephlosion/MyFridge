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
        <ul className="grid-container">
            {workshops.map((workshop) => {
                const creator = creators[workshop.userId];

                return (
                    <li key={workshop.id} className="relative min-w-80 h-80">
                        {/* Link to Workshop Details */}
                        <Link to={`/workshops/${workshop.id}`} className="grid-workshop_link">
                            <img
                                src={workshop.pfpId || "/assets/icons/profile-placeholder.svg"}
                                alt="workshop"
                                className="h-full w-full object-cover"
                            />
                        </Link>

                        {/* User Info and Stats */}
                        <div className="grid-workshop_user">
                            {showUser && creator && (
                                <div className="flex items-center justify-start gap-2 flex-1">
                                    <img
                                        src={creator.pfp || "/assets/icons/profile-placeholder.svg"}
                                        alt="creator"
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <p className="line-clamp-1">
                                        <Link to={`/profile/${creator.id}`}>@{creator.username}</Link>
                                    </p>
                                </div>
                            )}
                            {showStats && <WorkshopStats workshop={workshop} userId={user.id} />} {/* Replace with the correct stats component */}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default GridWorkshopList;
