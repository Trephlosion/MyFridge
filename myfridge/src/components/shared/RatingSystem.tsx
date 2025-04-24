import React from 'react'
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";


const RatingSystem = () => {
    return (
        <div className="bg-gray-900 p-6 rounded-xl mt-6">
            <div className="grid w-full gap-2">
                <h2 className="text-2xl font-semibold mb-4">Leave a Review</h2>
                <Textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write your review here..."
                    className="w-full p-3 rounded-md text-black mb-4 bg-gray-200"
                />

                <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <span
                            key={num}
                            onClick={() => setRating(num)}
                            className={`cursor-pointer text-2xl ${
                                rating >= num ? "text-yellow-400" : "text-gray-500"
                            }`}
                        >
                  ★
                </span>
                    ))}
                </div>

                <Button
                    onClick={handleSubmitReview}
                    disabled={submitted}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                >
                    {submitted ? "Review Submitted" : "Submit Review"}
                </Button>

            </div>
        </div>
    )
}
export default RatingSystem
