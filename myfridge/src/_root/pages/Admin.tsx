import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { database } from "@/lib/firebase/config"; // ✅ Ensure the correct Firestore import
import { Input } from "@/components/ui/input"; // ✅ Ensure correct path
import { Button } from "@/components/ui/button"; // ✅ Ensure correct path

const Admin = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(database, "Users");
                const querySnapshot = await getDocs(usersRef);
                const usersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold mb-4">Admin Panel - User Management</h2>

            {/* ✅ Use the imported Input component */}
            <Input
                type="text"
                placeholder="Search users by email, username, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4 p-2 w-full border border-gray-300 rounded"
            />

            {/* Users List */}
            <div className="bg-white shadow-md rounded-lg p-4">
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-gray-100 border-b">
                        <th className="p-2 text-left">Username</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Verified</th>
                        <th className="p-2 text-left">Admin</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id} className="border-b">
                                <td className="p-2">{user.username || "N/A"}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2">{user.isVerified ? "✅ Yes" : "❌ No"}</td>
                                <td className="p-2">{user.isAdministrator ? "✅ Yes" : "❌ No"}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="p-2 text-center">No users found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* ✅ Use the imported Button component */}
            <Button className="mt-4" onClick={() => console.log("Admin action triggered")}>
                Admin Action
            </Button>
        </div>
    );
};

export default Admin;




















/*
import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
//import { db } from "@/lib/firebase/config"; // Ensure this is your Firestore config
import { database } from "@/lib/firebase/config"; // Ensure this is your Firestore config
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


const Admin = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    // Fetch users from Firestore
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, "Users");
                const querySnapshot = await getDocs(usersRef);
                const usersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    // Filter users based on search input
    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.username?.toLowerCase().includes(search.toLowerCase()) ||
        user.id?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold mb-4">Admin Panel - User Management</h2>

            //{/* Search Bar }
            <Input
                type="text"
                placeholder="Search users by email, username, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4 p-2 w-full border border-gray-300 rounded"
            />

            //{/* Users List }
            <div className="bg-white shadow-md rounded-lg p-4">
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-gray-100 border-b">
                        <th className="p-2 text-left">Username</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Verified</th>
                        <th className="p-2 text-left">Admin</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b">
                                <td className="p-2">{user.username || "N/A"}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2">{user.isVerified ? "✅ Yes" : "❌ No"}</td>
                                <td className="p-2">{user.isAdministrator ? "✅ Yes" : "❌ No"}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="p-2 text-center">No users found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin;
*/