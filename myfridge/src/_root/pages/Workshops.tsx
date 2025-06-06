// Modularly fixing Workshops.tsx (normalized for DocumentReferences)
import { useState, useEffect } from "react";
import {Link, useNavigate} from "react-router-dom";
import { collection, getDocs,} from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Workshop } from "@/types";
import WorkshopCard from "@/components/cards/WorkshopCard";
import useDebounce from "@/hooks/useDebounce";
import { useSearchWorkshops } from "@/lib/react-query/queriesAndMutations";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";

const Workshops = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 500);
    const shouldShowSearchResults = searchValue !== "";
    const shouldShowNoWorkshops = !shouldShowSearchResults && workshops.length === 0;
    const { data: searchedWorkshops = [], isLoading: isSearching } = useSearchWorkshops(debouncedSearch);

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, "Workshops"));
                const workshopsList: Workshop[] = [];

                for (const docSnap of querySnapshot.docs) {
                    const data = docSnap.data();

                    workshopsList.push({
                        id: docSnap.id,
                        ...data,
                    } as Workshop);
                }

                const upcomingWorkshops = workshopsList
                    .filter(w => w.date?.seconds && new Date(w.date.seconds * 1000) > new Date())
                    .sort((a, b) => (a.date.seconds - b.date.seconds));

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

    return (
        <div className="p-5">

            <div className={"text-white"}>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink>
                                <Link className={"hover:text-accentColor"} to="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink>Workshops</BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Explore Workshops</h2>
                {user?.isVerified && (
                    <button
                        onClick={() => navigate("/create-workshop")}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                    >
                        + Create Workshop
                    </button>
                )}
            </div>

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
                    searchedWorkshops.map((workshop) => (
                        <WorkshopCard key={workshop.id} workshop={workshop} />
                    ))
                ) : shouldShowNoWorkshops ? (
                    <p className="col-span-full text-center text-gray-500">No upcoming workshops</p>
                ) : (
                    workshops.map((workshop) => (
                        <WorkshopCard key={workshop.id} workshop={workshop} />
                    ))
                )}
            </div>
        </div>
    );
};

export default Workshops;
