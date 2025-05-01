// pages/RecipeAnalytics.tsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/shared";
import { generateRecipeAnalytics } from "@/lib/firebase/api";
import { AnalyticsResponse } from "@/types";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";

export default function RecipeAnalytics() {
    const navigate = useNavigate();
    const params = new URLSearchParams(useLocation().search);
    const recipeId = params.get("recipeId")!;
    const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await generateRecipeAnalytics(recipeId);
                setAnalytics(data);
            } catch (err) {
                console.error("Analytics error:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [recipeId]);

    if (loading) return <Loader />;
    if (!analytics) return <p className="text-center mt-10">Failed to load analytics.</p>;

    return (
        <div className="max-w-3xl mx-auto mt-10">
            <Card className="recipe-card">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">
                        Recipe Analytics
                    </CardTitle>
                    <h2 className="text-xl text-gray-400 mt-1">{recipeId.title}</h2>
                </CardHeader>

                <CardContent className="space-y-4">
                    <p>
                        <strong>Likes:</strong> {analytics.likes?.length || 0}
                    </p>

                    <p>
                        <strong>Seasonal Status:</strong>{" "}
                        {analytics.isSeasonal ? "🌞 This recipe is highlighted as seasonal." : "❄️ This recipe is not seasonal."}
                    </p>

                    <p>
                        <strong>Approval Status:</strong>{" "}
                        {analytics.isApproved ? "✅ This recipe is approved." : "🚫 This recipe is not yet approved."}
                    </p>

                    <p>
                        <strong>Total Reviews:</strong> {analytics.totalReviews}
                    </p>

                    <p>
                        <strong>Most Recent Review:</strong>{" "}
                        {new Date(analytics.mostRecentReviewDate).toLocaleDateString()}
                    </p>

                    <p>
                        <strong>AI Summary:</strong> Based on recent engagement, this recipe has garnered a notable number of likes,
                        suggesting it's well-received by users. {analytics.isTrending ? "🔥 It is currently trending" : "It is not trending"} and{" "}
                        {analytics.isSeasonal ? "🌞 highlighted as a seasonal favorite" : "not marked as seasonal"}.
                        {analytics.isApproved ? "✅ With official approval," : "🚫 Without official approval,"} it stands as a{" "}
                        {analytics.totalLikes > 10 ? "highly recommended" : "moderately rated"} dish worth exploring.
                        We recommend giving it a try!
                    </p>
                </CardContent>

                <CardFooter>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink>
                                    <Link className="cursor-pointer hover:text-accentColor" to="/">
                                        Home
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink>
                                    <Link className="hover:text-accentColor" to={`/recipes/${recipeId}`}>
                                        {analytics.title} Recipe Details
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink>
                                    Analytics
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </CardFooter>
            </Card>
        </div>
    );
}

