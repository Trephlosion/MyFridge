import React, { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AllUsers = () => {
  const { user } = useUserContext();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      try {
        const userDoc = await getDocs(collection(database, "Users"));
        const currentUser = userDoc.docs.find((doc) => doc.id === user.id);
        if (currentUser?.data().isAdministrator) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdmin();
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(database, "Users"));
      const fetchedUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(fetchedUsers);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchLower = search.toLowerCase();
    return (
        user.username?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleChangeRole = async (userId: string, newRole: string) => {
    await updateDoc(doc(database, "Users", userId), {
      role: newRole,
    });
    setUsers((prev) =>
        prev.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
        )
    );
    setActiveDropdown(null);
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteDoc(doc(database, "Users", userId));
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  return (
      <div className="p-6 text-white">
        <h1 className="text-3xl font-bold mb-4">User Search</h1>
        <Input
            type="text"
            placeholder="Search users by username or email..."
            className="mb-4 w-full bg-white text-black border border-gray-300 rounded px-4 py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />

        <div className="overflow-x-auto">
          <table className="min-w-full border border-white">
            <thead>
            <tr className="bg-white text-black">
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Username</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Actions</th>
            </tr>
            </thead>
            <tbody>
            {filteredUsers.map((otherUser) => (
                <tr key={otherUser.id} className="text-center border-b">
                  <td className="p-2 border">{otherUser.email}</td>
                  <td className="p-2 border">{otherUser.username}</td>
                  <td className="p-2 border">{otherUser.role || "User"}</td>

                  <td className="p-2 relative">
                    <Button
                        className="bg-blue-500 text-white"
                        onClick={() =>
                            setActiveDropdown(
                                activeDropdown === otherUser.id ? null : otherUser.id
                            )
                        }
                    >
                      Options
                    </Button>

                    {activeDropdown === otherUser.id && (
                        <div className="absolute z-10 right-0 mt-2 bg-white rounded shadow p-2 text-black w-48">
                          {isAdmin ? (
                              <>
                                <button
                                    className="block w-full text-left py-1 hover:bg-gray-100"
                                    onClick={() => handleChangeRole(otherUser.id, "User")}
                                >
                                  Set as User
                                </button>
                                <button
                                    className="block w-full text-left py-1 hover:bg-gray-100"
                                    onClick={() =>
                                        handleChangeRole(otherUser.id, "Content Creator")
                                    }
                                >
                                  Set as Content Creator
                                </button>
                                <button
                                    className="block w-full text-left py-1 hover:bg-gray-100"
                                    onClick={() =>
                                        handleChangeRole(otherUser.id, "Recipe Curator")
                                    }
                                >
                                  Set as Recipe Curator
                                </button>
                                <button
                                    className="block w-full text-left py-1 hover:bg-red-100 text-red-600"
                                    onClick={() => handleDeleteUser(otherUser.id)}
                                >
                                  Delete User
                                </button>
                              </>
                          ) : (
                              <>
                                <button
                                    className="block w-full text-left py-1 hover:bg-gray-100"
                                    onClick={() => {
                                      // Handle follow/unfollow logic (stub)
                                      alert("Follow/Unfollow action placeholder");
                                      setActiveDropdown(null);
                                    }}
                                >
                                  Follow / Unfollow
                                </button>
                                <button
                                    className="block w-full text-left py-1 hover:bg-gray-100"
                                    onClick={() => navigate(`/profile/${otherUser.id}`)}
                                >
                                  View User Profile
                                </button>
                              </>
                          )}
                        </div>
                    )}
                  </td>
                </tr>
            ))}
            </tbody>

          </table>
          {filteredUsers.length === 0 && (
              <p className="text-center mt-4 text-gray-400">No users found.</p>
          )}
        </div>
      </div>
  );
};

export default AllUsers;








/*
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

        { /*🔍 Search Bar (Now Fixes Invisible Text Issue) }
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

        {/* 🔹 Display Search Results }
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
*/












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




