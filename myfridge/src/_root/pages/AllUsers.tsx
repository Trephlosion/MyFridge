
import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const AllUsers = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ Check if the logged-in user is an admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(database, "Users", user.id));
        if (userDoc.exists() && userDoc.data().isAdministrator === true) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    checkAdmin();
  }, [user]);

  // ✅ Fetch all users from Firestore if admin
  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersCollection = collection(database, "Users");
        const snapshot = await getDocs(usersCollection);
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
      setIsLoading(false);
    };

    fetchUsers();
  }, [isAdmin]);

  // ✅ Handle search input and filter users
  useEffect(() => {
    const results = users.filter(
        (user) =>
            user.username?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(results);
  }, [search, users]);

  if (!isAdmin) {
    return (
        <div className="flex-center w-full h-full">
          <p className="text-red-500 text-xl font-semibold">
            Access to this page is restricted.
          </p>
        </div>
    );
  }

  return (
      <div className="p-5">
        <h2 className="text-2xl font-bold mb-4">User Search </h2>

        { /*🔍 Search Bar (Now Fixes Invisible Text Issue) */}
        <input
            type="text"
            placeholder="Search users by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded mb-4 text-black bg-white placeholder-gray-500"
            style={{
              color: "black", // ✅ Ensures text inside input is visible
              backgroundColor: "white", // ✅ Prevents text blending with background
              padding: "10px", // ✅ Adds better spacing
            }}
        />

        {/* 🔹 Display Search Results */}
        <div className="grid grid-cols-3 gap-4">
          {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                  <div
                      key={user.id}
                      className="p-4 border rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    <img
                        src={user.pfp || "/assets/icons/profile-placeholder.svg"}
                        alt="profile"
                        className="w-16 h-16 rounded-full mb-2"
                    />
                    <h3 className="font-semibold">{user.username || "Unknown User"}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
              ))
          ) : (
              <p className="text-gray-500 text-center col-span-3">No users found.</p>
          )}
        </div>
      </div>
  );
};

export default AllUsers;













/*
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
*/




