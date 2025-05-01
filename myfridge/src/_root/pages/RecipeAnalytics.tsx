// pages/RecipeAnalytics.tsx
import { useEffect, useState } from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
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
    const location = useLocation();

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
                    <CardTitle> {analytics.title} Recipe Analytics</CardTitle>

                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        <strong>Average Rating:</strong> {analytics.averageRating.toFixed(1)}
                    </p>
                    <p>
                        <strong>Total Reviews:</strong> {analytics.totalReviews}
                    </p>
                    <div>
                        <strong>Rating Distribution:</strong>
                        <ul className="list-disc list-inside ml-4">
                            {Object.entries(analytics.ratingCounts).map(([star, count]) => (
                                <li key={star}>
                                    {star} ★ – {count}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p>
                        <strong>Most Recent Review:</strong>{" "}
                        {new Date(analytics.mostRecentReviewDate).toLocaleDateString()}
                    </p>

                    <p>
                        <strong>Overview:</strong> {analytics.overview}
                    </p>
                </CardContent>
                <CardFooter>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink >
                                    <Link className="cursor-pointer hover:text-accentColor" to="/">
                                        Home
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink >
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
