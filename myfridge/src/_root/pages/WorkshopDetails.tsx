import React, { useEffect, useState } from 'react';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { database } from "@/lib/firebase/config";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";

const WorkshopDetails = () => {
    const { id } = useParams();
    const { user } = useUserContext();
    const [workshop, setWorkshop] = useState<any>(null); // You can specify a more detailed type for the workshop
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchWorkshop = async () => {
            if (id) {
                const workshopDoc = await getDoc(doc(database, 'Workshops', id));
                if (workshopDoc.exists()) {
                    setWorkshop({ id: workshopDoc.id, ...workshopDoc.data() });
                }
            }
        };
        fetchWorkshop();
    }, [id]);

    const handleSubmitReview = async () => {
        if (!user || !review || rating === 0) return;

        await addDoc(collection(database, 'workshopReviews'), {
            workshopId: id,
            userId: user.username,
            comment: review,
            stars: rating,
            createdAt: new Date(),
        });

        setSubmitted(true);
        setReview('');
        setRating(0);
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
                <p><span className="font-semibold">Date:</span> {workshop.date || 'N/A'}</p>
                <p><span className="font-semibold">Time:</span> {workshop.time || 'N/A'}</p>
                <p><span className="font-semibold">Duration:</span> {workshop.duration || 'N/A'}</p>
                <p><span className="font-semibold">Location:</span> {workshop.location || 'N/A'}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl my-6">
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="leading-relaxed italic">{workshop.description || 'No description provided.'}</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl">
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
        </div>
    );
};

export default WorkshopDetails;
