import { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where} from "firebase/firestore";
import { database } from "@/lib/firebase/config";

const MyRecipes = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserRecipes = async () => {
            try {
                if (!user || !user.id) return;
                const q = query(
                    collection(database, "Recipes"),
                    where("author", "==", database.doc(`Users/${user.id}`))
                );
                const querySnapshot = await getDocs(q);
                const userRecipes = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setRecipes(userRecipes);
            } catch (error) {
                console.error("Error fetching user recipes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRecipes();
    }, [user]);

    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold mb-4 text-center">My Recipes</h2>
            {loading ? (
                <p className="text-center">Loading...</p>
            ) : recipes.length === 0 ? (
                <p className="text-center">You haven't created any recipes yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {recipes.map((recipe) => (
                        <div
                            key={recipe.id}
                            className="border rounded p-4 shadow-md bg-white cursor-pointer hover:shadow-lg"
                            onClick={() => navigate(`/recipe/${recipe.id}`)}
                        >
                            <img
                                src={
                                    recipe.media_url ||
                                    "https://www.food4fuel.com/wp-content/uploads/woocommerce-placeholder-600x600.png"
                                }
                                alt={recipe.title}
                                className="w-full h-40 object-cover rounded"
                            />
                            <h3 className="text-lg font-bold text-black mt-2">{recipe.title}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyRecipes;
