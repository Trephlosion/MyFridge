import { useToast } from "@/hooks/use-toast";
import { Loader, UserCard } from "@/components/shared";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { ExpandedUser } from "@/types";

const AllUsers = () => {
  const { toast } = useToast();
  const [creators, setCreators] = useState<ExpandedUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // Fetch all users from Firestore
  const fetchUsers = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const usersCollection = collection(database, "User");
      const snapshot = await getDocs(usersCollection);
      const users = snapshot.docs.map((doc) => {
        const data = doc.data() as ExpandedUser;
        return { id: doc.id, ...data };
      });
      setCreators(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsError(true);
      toast({ title: "Something went wrong while fetching users." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isError) {
    toast({ title: "Something went wrong." });
    return null;
  }

  return (
      <div className="common-container">
        <div className="user-container">
          <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
          {isLoading ? (
              <Loader />
          ) : (
              <ul className="user-grid">
                {creators.map((creator) => (
                    <li key={creator.id} className="flex-1 min-w-[200px] w-full">
                      <UserCard user={creator} />
                    </li>
                ))}
              </ul>
          )}
        </div>
      </div>
  );
};

export default AllUsers;
