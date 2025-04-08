import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";

import { AuthContextType, IUser, INotification } from "@/types";
import { auth, database } from "@/lib/firebase/config";
import { checkAuthUser as fetchAuthUser } from "@/lib/firebase/api";

// Initial user state
export const INITIAL_USER: IUser = {
    id: "",
    username: "",
    email: "",
    pfp: "",
    bio: "",
    isPrivate: false,
    isVerified: false,
    isAdministrator: false,
    followers: [],
    following: [],
    likedRecipes: [],
    recipes: [],
    posts: [],
    comments: [],
    myFridge: "",
    createdAt: new Date(),
    updatedAt: new Date(),
};

const INITIAL_STATE: AuthContextType = {
    user: INITIAL_USER,
    isLoading: false,
    isAuthenticated: false,
    notifications: [],
    setUser: () => {},
    setIsAuthenticated: () => {},
    checkAuthUser: async () => false,
    setNotifications: () => {},
};

export const AuthContext = createContext<AuthContextType>(INITIAL_STATE);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUser>(INITIAL_USER);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [notifications, setNotifications] = useState<INotification[]>([]);

    const navigate = useNavigate();

    const checkAuthUser = async (): Promise<boolean> => {
        setIsLoading(true);
        try {
            const currentUser = await fetchAuthUser();
            if (currentUser) {
                setUser(currentUser);
                return true;
            } else {
                setUser(INITIAL_USER);
                return false;
            }
        } catch (error) {
            console.error("Error checking authentication state:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
                await checkAuthUser();
            } else {
                setUser(INITIAL_USER);
                navigate("/sign-in");
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // 👇 Listen for notifications in Firestore
    useEffect(() => {
        if (!user?.id) return;

        const q = query(
            collection(database, "Notifications"),
            where("userId", "==", user.id),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotifications = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as INotification[];

            setNotifications(fetchedNotifications);
        });

        return () => unsubscribe();
    }, [user?.id]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user?.id,
                isLoading,
                checkAuthUser,
                notifications,
                setUser,
                setIsAuthenticated: () => {},
                setNotifications,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useUserContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useUserContext must be used within an AuthProvider");
    }
    return context;
};
