// File: src/_root/pages/AllUsers.tsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UserCard, BaseLoading } from "@/components/shared";
import { IUser } from "@/types";
import {
  useGetUserRecipes,
  useSearchRecipes,
} from "@/lib/react-query/queriesAndMutations";
import { Input } from "@/components/ui/input.tsx";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";

const AllUsers = () => {
  const { toast } = useToast();
  const { user } = useUserContext();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: userRecipes, isLoading: isLoadingUserRecipes } = useGetUserRecipes(user.id);
  const { data: searchResults, isLoading: isSearching } = useSearchRecipes(searchTerm.toLowerCase());
  const [creators, setCreators] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const filteredUsers = creators.filter((creator) =>
    creator.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchUsers = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const usersCollection = collection(database, "Users");
      const snapshot = await getDocs(usersCollection);
      const users = snapshot.docs.map((doc) => {
        const data = doc.data() as IUser;
        return { id: doc.id, ...data };
      });
      setCreators(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsError(true);
      toast({ title: "Something went wrong while fetching users." });
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setIsLoading(false);
    }
  };

/*  const handleCreateTestUsers = async () => {
    const dummyPassword = "Test1234!";
    const testUsers = [];
    for (let i = 1; i <= 5; i++) {
      testUsers.push({
        username: `Admin_Test_${i}`,
        email: `admin${i}@example.com`,
        password: dummyPassword,
        isAdministrator: true,
        isVerified: false,
        isCurator: false,
      });
    }
    for (let i = 1; i <= 5; i++) {
      testUsers.push({
        username: `ContentCreator_Test_${i}`,
        email: `contentcreator${i}@example.com`,
        password: dummyPassword,
        isAdministrator: false,
        isVerified: true,
        isCurator: false,
      });
    }
    for (let i = 1; i <= 5; i++) {
      testUsers.push({
        username: `RecipeCurator_Test_${i}`,
        email: `recipecurator${i}@example.com`,
        password: dummyPassword,
        isAdministrator: false,
        isVerified: false,
        isCurator: true,
      });
    }
    for (let i = 1; i <= 5; i++) {
      testUsers.push({
        username: `Regular_Test_${i}`,
        email: `regular${i}@example.com`,
        password: dummyPassword,
        isAdministrator: false,
        isVerified: false,
        isCurator: false,
      });
    }
    try {
      for (const userData of testUsers) {
        await createUserAccount(userData);
      }
      console.log("Test users created successfully");
    } catch (error) {
      console.error("Error creating test users", error);
    }
  };*/

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isError) {
    toast({ title: "Something went wrong." });
    return null;
  }

  return (
    <div className="common-container">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link className={"hover:text-accentColor"} to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>People</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="user-container">
        {/* Search Bar Spanning Full Width */}
        <div className="mb-4 w-full">
          <Input
            type="text"
            placeholder="Search Users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex justify-between items-center">
          <h2 className="h3-bold md:h2-bold text-left w-full">
            {user?.isAdministrator ? "All Users - Admin View" : "All Users"}
          </h2>
          {(user?.isAdministrator || user?.isVerified) && (
            <>
              {user?.isVerified && (
                <p className="text-sm align-middle text-green-600">Creator View</p>
              )}
            </>
          )}
        </div>
        {isLoading ? (
          <BaseLoading />
        ) : (
          <ul className="user-grid">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-light-3 mt-4">No users found.</p>
            ) : (
              filteredUsers.map((creator) => (
                <li key={creator.id} className="flex-1 min-w-[200px] w-full">
                  <UserCard user={creator} />
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
