import { useEffect, useState } from "react";
import { getDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ChallengeSubmissionsPanel = ({ submissions }: { submissions: any[] }) => {
    const [recipes, setRecipes] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecipes = async () => {
            if (!submissions) return;
            try {
                const recipesData = await Promise.all(
                    submissions.map(async (ref) => {
                        const snap = await getDoc(ref);
                        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
                    })
                );
                setRecipes(recipesData.filter(Boolean));
            } catch (error) {
                console.error("Failed to load submissions:", error);
            }
        };

        fetchRecipes();
    }, [submissions]);

    if (!submissions || submissions.length === 0) {
        return <p className="text-light-4 mt-3">No submissions yet.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {recipes.map((recipe) => (
                <Card key={recipe.id} className="cursor-pointer" onClick={() => navigate(`/recipes/${recipe.id}`)}>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">{recipe.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-light-3 line-clamp-2">{recipe.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};


export default ChallengeSubmissionsPanel;
