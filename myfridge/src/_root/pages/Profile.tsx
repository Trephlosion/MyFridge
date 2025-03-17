import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { database } from "@/lib/firebase/config";

const Profile = () => {
    const { id } = useParams();
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (!id) {
            console.error("User ID is missing. Redirecting to People tab.");
            navigate("/people");
        }
    }, [id, navigate]);

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

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) {
                setError("User ID is missing.");
                setIsLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(database, "Users", id));
                if (userDoc.exists()) {
                    setCurrentUser(userDoc.data());
                } else {
                    setError("User not found.");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("Failed to fetch user. Please try again.");
            }
            setIsLoading(false);
        };
        fetchUser();
    }, [id]);

    if (!isAdmin && user.id !== id) {
        return (
            <div className="flex-center w-full h-full">
                <p className="text-red-500 text-xl font-semibold">
                    Access to this page is restricted.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return <p className="text-center text-white">Loading user...</p>;
    }

    if (error) {
        return (
            <div className="text-center text-red-500">
                <p>{error}</p>
                <button
                    onClick={() => navigate("/people")}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // ✅ Handle User Deletion
    const handleDeleteUser = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(database, "Users", id));
            alert("User successfully deleted.");
            navigate("/people");
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        }
    };

    // ✅ Handle Role Update
    const handleRoleUpdate = async (role) => {
        try {
            await updateDoc(doc(database, "Users", id), { role });
            alert(`User role updated to ${role}`);
            setCurrentUser((prev) => ({ ...prev, role })); // ✅ Updates role in UI
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update role.");
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-inner_container">
                <div className="flex flex-col items-center relative">
                    <img
                        src={currentUser.pfp || "/assets/icons/profile-placeholder.svg"}
                        alt="profile"
                        className="w-28 h-28 rounded-full"
                    />
                    <h1 className="h3-bold md:h1-semibold">{currentUser.username}</h1>

                    {/* ✅ Display User Role Here */}
                    <p className="text-lg font-medium text-gray-400 mt-1">
                        Role: <span className="text-white">{currentUser.role || "User"}</span>
                    </p>

                    <p className="text-gray-500">@{currentUser.email}</p>
                    <p className="text-sm mt-2">{currentUser.bio}</p>

                    <div className="flex gap-6 mt-4">
                        <p><strong>{currentUser.recipes?.length || 0}</strong> Recipes</p>
                        <p><strong>{currentUser.followers?.length || 0}</strong> Followers</p>
                        <p><strong>{currentUser.following?.length || 0}</strong> Following</p>
                    </div>

                    {/* 🛠️ Settings Button (Only Admins See This) */}
                    {isAdmin && (
                        <div className="absolute top-0 right-0">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                ⚙️
                            </button>

                            {showDropdown && (
                                <div className="absolute bg-white shadow-md rounded p-2 mt-2 w-48 right-0">
                                    <button
                                        onClick={() => navigate(`/update-profile/${id}`)}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-200 text-black"
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                    <button
                                        onClick={handleDeleteUser}
                                        className="block w-full text-left px-4 py-2 hover:bg-red-200 text-black font-semibold"
                                    >
                                        🗑️ Delete User
                                    </button>
                                    <p className="text-gray-500 text-sm px-4 py-2">Change Role:</p>
                                    <button
                                        onClick={() => handleRoleUpdate("User")}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-200 text-black"
                                    >
                                        👤 User
                                    </button>
                                    <button
                                        onClick={() => handleRoleUpdate("Content Creator")}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-200 text-black"
                                    >
                                        🎨 Content Creator
                                    </button>
                                    <button
                                        onClick={() => handleRoleUpdate("Recipe Curator")}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-200 text-black"
                                    >
                                        🍽️ Recipe Curator
                                    </button>
                                    <button
                                        onClick={() => handleRoleUpdate("Admin")}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-200 text-black"
                                    >
                                        🔧 Admin
                                    </button>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;













/*import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { database } from "@/lib/firebase/config";

const Profile = () => {
    const { id } = useParams();
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (!id) {
            console.error("User ID is missing. Redirecting to People tab.");
            navigate("/people");
        }
    }, [id, navigate]);

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

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) {
                setError("User ID is missing.");
                setIsLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(database, "Users", id));
                if (userDoc.exists()) {
                    setCurrentUser(userDoc.data());
                } else {
                    setError("User not found.");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("Failed to fetch user. Please try again.");
            }
            setIsLoading(false);
        };
        fetchUser();
    }, [id]);

    if (!isAdmin && user.id !== id) {
        return (
            <div className="flex-center w-full h-full">
                <p className="text-red-500 text-xl font-semibold">
                    Access to this page is restricted.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return <p className="text-center text-white">Loading user...</p>;
    }

    if (error) {
        return (
            <div className="text-center text-red-500">
                <p>{error}</p>
                <button
                    onClick={() => navigate("/people")}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // ✅ Handle User Deletion
    const handleDeleteUser = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(database, "Users", id));
            alert("User successfully deleted.");
            navigate("/people");
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        }
    };

    // ✅ Handle Role Update
    const handleRoleUpdate = async (role) => {
        try {
            await updateDoc(doc(database, "Users", id), { role });
            alert(`User role updated to ${role}`);
            setCurrentUser((prev) => ({ ...prev, role })); // ✅ Updates role in UI
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update role.");
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-inner_container">
                <div className="flex flex-col items-center relative">
                    <img
                        src={currentUser.pfp || "/assets/icons/profile-placeholder.svg"}
                        alt="profile"
                        className="w-28 h-28 rounded-full"
                    />
                    <h1 className="h3-bold md:h1-semibold">{currentUser.username}</h1>

                    {/* ✅ Display User Role Here }
                    <p className="text-lg font-medium text-gray-400 mt-1">
                        Role: <span className="text-white">{currentUser.role || "User"}</span>
                    </p>

                    <p className="text-gray-500">@{currentUser.email}</p>
                    <p className="text-sm mt-2">{currentUser.bio}</p>

                    <div className="flex gap-6 mt-4">
                        <p><strong>{currentUser.recipes?.length || 0}</strong> Recipes</p>
                        <p><strong>{currentUser.followers?.length || 0}</strong> Followers</p>
                        <p><strong>{currentUser.following?.length || 0}</strong> Following</p>
                    </div>

                    {/* 🛠️ Settings Button (Only Admins See This) }
                    {isAdmin && (
                        <div className="absolute top-0 right-0">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                ⚙️
                            </button>

                            {showDropdown && (
                                <div className="absolute bg-white shadow-md rounded p-2 mt-2 w-48 right-0">
                                    <button
                                        onClick={() => navigate(`/update-profile/${id}`)}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-200 text-black"
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                    <button
                                        onClick={handleDeleteUser}
                                        className="block w-full text-left px-4 py-2 hover:bg-red-200 text-black font-semibold"
                                    >
                                        🗑️ Delete User
                                    </button>
                                    <p className="text-gray-500 text-sm px-4 py-2">Change Role:</p>
                                    <button
                                        onClick={() => handleRoleUpdate("User")}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-200 text-black"
                                    >
                                        👤 User
                                    </button>
                                    <button
                                        onClick={() => handleRoleUpdate("Content Creator")}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-200 text-black"
                                    >
                                        🎨 Content Creator
                                    </button>
                                    <button
                                        onClick={() => handleRoleUpdate("Recipe Curator")}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-200 text-black"
                                    >
                                        🍽️ Recipe Curator
                                    </button>
                                    <button
                                        onClick={() => handleRoleUpdate("Admin")}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-200 text-black"
                                    >
                                        🔧 Admin
                                    </button>
                                </div>
                            )}

                        </div>
            </div>
        </div>
    );
};

export default Profile;
*/




