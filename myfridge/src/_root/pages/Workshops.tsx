import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { GridWorkshopList } from "@/components/shared";
import { useSearchWorkshops } from "@/lib/react-query/queriesAndMutations";
import { Workshop } from "@/types";
import { database } from "@/lib/firebase/config";
import { collection, getDocs } from "firebase/firestore";

export type SearchResultProps = {
    searchedWorkshops: Workshop[] | undefined;
};

const SearchResults = ({ searchedWorkshops }: SearchResultProps) => {
    if (!searchedWorkshops || searchedWorkshops.length === 0) {
        return <p className="text-light-4 mt-10 text-center w-full">No workshops found</p>;
    }
    return <GridWorkshopList workshops={searchedWorkshops} />;
};

const Workshops = () => {
    const { ref, inView } = useInView();
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 500);
    const { data: searchedWorkshops } = useSearchWorkshops(debouncedSearch);

    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, "workshops"));

                const workshopsList = querySnapshot.docs.map(doc => {
                    const data = doc.data();

                    // Ensure date is properly parsed
                    const parsedDate = data.date?.seconds
                        ? new Date(data.date.seconds * 1000)  // If Firestore Timestamp
                        : new Date(data.date);               // If stored as a string

                    return {
                        id: doc.id,
                        ...data,
                        date: parsedDate, // Ensure date is a JS Date object
                    };
                }) as Workshop[];

                // Filter out past workshops and sort by date
                const upcomingWorkshops = workshopsList
                    .filter(workshop => workshop.date > new Date()) // Only future workshops
                    .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort soonest first

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

    if (isLoading) {
        return <div className="flex flex-col items-center justify-center min-h-screen w-full"><p>Loading workshops...</p></div>;
    }

    if (isError) {
        return <div className="flex flex-col items-center justify-center min-h-screen w-full"><p>Error loading workshops. Please try again later.</p></div>;
    }

    const shouldShowSearchResults = searchValue !== "";
    const shouldShowWorkshops = !shouldShowSearchResults && workshops.length === 0;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full">
            <div className="w-full max-w-5xl px-4">
                <h2 className="h3-bold md:h2-bold text-center w-full">Search Workshops</h2>
                <div className="flex gap-1 px-4 w-full max-w-md mx-auto rounded-lg bg-dark-4">
                    <img src="/assets/icons/search.svg" width={24} height={24} alt="search" />
                    <Input
                        type="text"
                        placeholder="Search"
                        className="workshops-search"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col items-center w-full max-w-5xl mt-16 mb-7">
                <h3 className="body-bold md:h3-bold text-center">Upcoming Workshops</h3>
            </div>

            <div className="flex flex-wrap justify-center gap-9 w-full max-w-5xl">
                {shouldShowSearchResults ? (
                    <SearchResults searchedWorkshops={searchedWorkshops} />
                ) : shouldShowWorkshops ? (
                    <p className="text-light-4 mt-10 text-center w-full">No upcoming workshops</p>
                ) : (
                    <GridWorkshopList workshops={workshops} />
                )}
            </div>
        </div>
    );
};

export default Workshops;
