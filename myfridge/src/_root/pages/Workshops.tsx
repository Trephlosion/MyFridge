import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserWorkshops, useSearchWorkshops } from "@/lib/react-query/queriesAndMutations";
import { Input } from "@/components/ui/input";
import { Workshop } from "@/types";
import useDebounce from "@/hooks/useDebounce";
import { GridWorkshopList } from "@/components/shared";
import { database } from "@/lib/firebase/config";
import { collection, getDocs, orderBy, limit } from "firebase/firestore";

const Workshops = () => {
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 500);
    const { data: searchedWorkshops = [], isLoading: isSearching } = useSearchWorkshops(debouncedSearch);

    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, "Workshops"));

                const workshopsList = querySnapshot.docs.map(doc => {
                    const data = doc.data();

                    let parsedDate: Date | null = null;

                    if (data.date?.seconds) {
                        parsedDate = new Date(data.date.seconds * 1000);
                    } else if (typeof data.date === "string") {
                        parsedDate = new Date(data.date);
                    }

                    return {
                        id: doc.id,
                        ...data,
                        date: parsedDate || new Date(),
                    } as Workshop;
                });

                const upcomingWorkshops = workshopsList
                    .filter(workshop => workshop.date && workshop.date > new Date())
                    .sort((a, b) => a.date.getTime() - b.date.getTime());

                setWorkshops(upcomingWorkshops);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching workshops:", error);
                setIsError(true);
                setIsLoading(false);
            }
        };

        fetchWorkshops();
    }, []);

    const shouldShowSearchResults = searchValue !== "";
    const shouldShowWorkshops = !shouldShowSearchResults && workshops.length === 0;

    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold mb-4 text-center">Explore Workshops</h2>

            <div className="flex justify-center mb-4 gap-4">
                <Input
                    type="text"
                    placeholder="Search workshops..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 p-2 border border-gray-300 rounded"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {isLoading || isSearching ? (
                    <p className="col-span-full text-center">Loading workshops...</p>
                ) : isError ? (
                    <p className="col-span-full text-center text-gray-500">Error loading workshops. Please try again later.</p>
                ) : shouldShowSearchResults ? (
                    <GridWorkshopList workshops={searchedWorkshops} />
                ) : shouldShowWorkshops ? (
                    <p className="col-span-full text-center text-gray-500">No upcoming workshops</p>
                ) : (
                    workshops.map((workshop) => {
                        const workshopTitle = workshop?.title || "Untitled Workshop";
                        const { id, title, media_url } = workshop;
                        return (
                            <div
                                key={id}
                                className="border rounded p-4 shadow-md bg-white cursor-pointer transition-transform transform hover:scale-105"
                                onClick={() => navigate(`/workshop/${id}`)}
                            >
                                <img
                                    src={media_url || "https://via.placeholder.com/300x200"}
                                    alt={workshopTitle}
                                    className="w-full h-40 object-cover rounded"
                                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/300x200")}
                                />
                                <h3 className="text-lg font-bold text-black mt-2">{workshopTitle}</h3>
                                <p className="text-sm text-black italic">Created by: {workshop.author?.username || "Unknown Creator"}</p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Workshops;
