import {createContext, useContext, useEffect, useState} from "react";
import {AuthContextType, IUser, INotification} from "@/types";
import {useNavigate} from "react-router-dom";
import {auth, database} from "@/lib/firebase/config";
import {onAuthStateChanged, signOut, User,} from "firebase/auth";
import {checkAuthUser as fetchAuthUser} from "@/lib/firebase/api";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";

// Initial user state
export const INITIAL_USER: IUser = {
    id:                         "",
    username:                   "",
    email:                      "",
    pfp:                        "",
    bio:                        "",

    isPrivate:                  false,   // Privacy setting
    isVerified:                 false,   // Creator status
    isAdministrator:            false,   // Admin status
    isDeactivated:              false,   // Account status
    isCurator:                  false,
    isBanned:                   false,


    followers:                  [],      // Array of follower IDs
    following:                  [],      // Array of following IDs
    likedRecipes:               [],      // Array of liked recipe IDs
    recipes:                    [],      // Array of uploaded recipe IDs
    posts:                      [],      // Array of uploaded post IDs
    comments:                   [],      // Array of comment IDs

    myFridge:                   "",      // Fridge IDs
    createdAt:                  new Date(),
    updatedAt:                  new Date(),
};

const INITIAL_STATE = {
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
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<INotification[]>([]);
    // Function to check and update the authentication state
    const checkAuthUser = async (): Promise<boolean> => {
        setIsLoading(true);
        try {
            const currentUser = await fetchAuthUser();
            if (currentUser) {
                // Prevent login if user is deactivated.
                if (currentUser.isDeactivated) {
                    await signOut(auth);
                    setUser(INITIAL_USER);
                    return false;
                }
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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
                await checkAuthUser();
            } else {
                navigate("/sign-in");
            }
        });

        return () => unsubscribe(); // Clean up listener
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
