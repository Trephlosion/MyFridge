// src/_root/pages/WorkshopDetails.tsx

import { useEffect, useState } from 'react';
import { doc, getDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { database } from "@/lib/firebase/config";
import { useParams } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

const WorkshopDetails = () => {
    const { id } = useParams();
    const { user } = useUserContext();
    const [workshop, setWorkshop] = useState<any>(null);
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);

    const fetchReviewerUsername = async (userId: string) => {
        try {
            const userDoc = await getDoc(doc(database, "Users", userId));
            return userDoc.exists() ? userDoc.data().username : "Unknown";
        } catch (error) {
            console.error("Error fetching username:", error);
            return "Unknown";
        }
    };

    useEffect(() => {
        const fetchWorkshop = async () => {
            if (id) {
                const workshopDoc = await getDoc(doc(database, 'Workshops', id));
                if (workshopDoc.exists()) {
                    setWorkshop({ id: workshopDoc.id, ...workshopDoc.data() });
                }
            }
        };

        const fetchReviews = async () => {
            if (id) {
                const reviewsQuery = query(
                    collection(database, 'workshopReviews'),
                    where("workshopId", "==", id)
                );
                const snapshot = await getDocs(reviewsQuery);
                const reviewsList = await Promise.all(
                    snapshot.docs.map(async (docSnap) => {
                        const data = docSnap.data();
                        const username = await fetchReviewerUsername(data.userId);
                        return { id: docSnap.id, ...data, username };
                    })
                );
                setReviews(reviewsList);
            }
        };

        fetchWorkshop();
        fetchReviews();
    }, [id]);

    const handleSubmitReview = async () => {
        if (!user || !review || rating === 0) return;

        await addDoc(collection(database, 'workshopReviews'), {
            workshopId: id,
            userId: user.id, // store userId here
            comment: review,
            stars: rating,
            createdAt: new Date(),
        });

        setSubmitted(true);
        setReview('');
        setRating(0);

        const reviewsQuery = query(
            collection(database, 'workshopReviews'),
            where("workshopId", "==", id)
        );
        const snapshot = await getDocs(reviewsQuery);
        const reviewsList = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                const username = await fetchReviewerUsername(data.userId);
                return { id: docSnap.id, ...data, username };
            })
        );
        setReviews(reviewsList);
    };

    if (!workshop) return <div className="text-white text-center mt-10">Loading workshop...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto text-white">
            <img
                src={workshop.media_url || 'https://www.food4fuel.com/wp-content/uploads/woocommerce-placeholder-600x600.png'}
                alt={workshop.title}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />

            <h1 className="text-4xl font-bold text-center mt-6">{workshop.title}</h1>

            <div className="flex justify-around text-lg my-4">
                <p><span className="font-semibold">Date:</span> {workshop.date?.toDate?.().toLocaleDateString() || 'N/A'}</p>
                <p><span className="font-semibold">Location:</span> {workshop.location || 'N/A'}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl my-6">
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="leading-relaxed italic">{workshop.description || 'No description provided.'}</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl mb-6">
                <h2 className="text-2xl font-semibold mb-4">Leave a Review</h2>

                <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write your review here..."
                    className="w-full p-3 rounded-md text-black mb-4"
                />

                <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <span
                            key={num}
                            onClick={() => setRating(num)}
                            className={`cursor-pointer text-2xl ${rating >= num ? 'text-yellow-400' : 'text-gray-500'}`}
                        >
                            ★
                        </span>
                    ))}
                </div>

                <button
                    onClick={handleSubmitReview}
                    disabled={submitted}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                >
                    {submitted ? 'Review Submitted' : 'Submit Review'}
                </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
                {reviews.length === 0 ? (
                    <p className="italic text-gray-300">No reviews yet. Be the first to leave one!</p>
                ) : (
                    <ul className="space-y-4">
                        {reviews.map((review) => (
                            <li key={review.id} className="bg-gray-700 p-4 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold text-lg">@{review.username}</h3>
                                    <div className="text-yellow-400 text-sm">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <span key={i}>{i < review.stars ? '★' : '☆'}</span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-200 italic">"{review.comment}"</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(review.createdAt?.toDate?.() || review.createdAt).toLocaleString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default WorkshopDetails;
