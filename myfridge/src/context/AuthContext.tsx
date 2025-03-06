import {createContext, useContext, useEffect, useState} from "react";
import {AuthContextType, IUser} from "@/types";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase/config";
import {
    onAuthStateChanged, /*browserLocalPersistence,
    createUserWithEmailAndPassword,
    setPersistence,
    signInWithEmailAndPassword,*/ User,
} from "firebase/auth";
import { getCurrentUser, checkAuthUser as fetchAuthUser } from "@/lib/firebase/api";
// import { addDoc, collection, setDoc, doc, getDoc } from "firebase/firestore";



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
    setUser: () => {},
    setIsAuthenticated: () => {},
    checkAuthUser: async () => false as boolean,
};

export const AuthContext = createContext<AuthContextType>(INITIAL_STATE);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUser>(INITIAL_USER);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Function to check and update the authentication state
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

    const navigate = useNavigate();
    // Listen for Firebase authentication changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
                await checkAuthUser();
            } else {
                navigate('/sign-in');
            }
        });

        return () => unsubscribe(); // Clean up listener
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, checkAuthUser }}>
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
