// RecipeAnalytics.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { database } from '@/lib/firebase/config';

const RecipeAnalytics = () => {
    const location = useLocation();
    const recipeId = new URLSearchParams(location.search).get('recipeId');
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchAnalyticsReport = async () => {
        try {
            if (!recipeId) {
                setReport('No recipe ID provided.');
                return;
            }

            // Get the recipe document
            const recipeRef = doc(database, 'Recipes', recipeId);
            const recipeSnap = await getDoc(recipeRef);

            if (!recipeSnap.exists()) {
                setReport('Recipe not found.');
                return;
            }

            const recipeData = recipeSnap.data();
            const recipeTitle = recipeData.title || 'Unknown Title';
            const recipeCreatedAt = recipeData.createdAt?.toDate?.().toLocaleDateString?.() || 'Unknown Date';

            // Get all ratings for this recipe
            const ratingsQuery = query(
                collection(database, 'Ratings'),
                where('recipeId', '==', recipeId)
            );
            const snapshot = await getDocs(ratingsQuery);
            const ratingsData = snapshot.docs.map(doc => doc.data());

            // Format ratings into readable string
            const formattedRatings = ratingsData.map((r, i) => {
                const date = r.createdAt?.toDate?.().toLocaleDateString?.() ?? 'Unknown Date';
                return `Rating ${i + 1}:
- Stars: ${r.stars}
- Comment: "${r.comment}"
- Date: ${date}
- User ID: ${r.userId}`;
            }).join('\n');

            const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
            const prompt = `
You are a data analyst helping a chef understand how their recipe is performing.
Below is the data for the recipe.

**Recipe Name:** ${recipeTitle}
**Created At:** ${recipeCreatedAt}

Each rating includes: stars (1–5), comment, createdAt, and userId.

Ratings:
${formattedRatings}

Please summarize:
- The overall sentiment
- Common themes in comments
- Constructive suggestions
- Positive highlights

Format the report in readable, clear paragraphs.
            `;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${openAiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are an analytical and helpful assistant.' },
                        { role: 'user', content: prompt },
                    ],
                    temperature: 0.7,
                    max_tokens: 1000,
                }),
            });

            const data = await response.json();
            const message = data.choices?.[0]?.message?.content;

            setReport(message || 'Failed to generate report.');
        } catch (error) {
            console.error('Error generating analytics report:', error);
            setReport('An error occurred while generating the report.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalyticsReport();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto text-left">
            <h1 className="text-2xl font-semibold mb-4">AI-Generated Recipe Analytics</h1>
            {loading ? <p>Generating report...</p> : <pre className="whitespace-pre-wrap">{report}</pre>}
        </div>
    );
};

export default RecipeAnalytics;

