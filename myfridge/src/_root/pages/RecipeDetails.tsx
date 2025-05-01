// RecipeDetails.tsx
import { useEffect, useState} from "react";
import { doc, getDoc, addDoc, collection, getDocs, query, orderBy, where, serverTimestamp, updateDoc, arrayUnion, DocumentReference} from "firebase/firestore";
import { database} from "@/lib/firebase/config";
import {useParams, useLocation, useNavigate, Link} from "react-router-dom";
import { useUserContext} from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {UserInfo, Recipe, IUser} from "@/types";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {multiFormatDateString} from "@/lib/utils.ts";
import {Loader, UserAvatarRow} from "@/components/shared";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";

const RecipeDetails = () => {
    const {id} = useParams<{ id: string }>();
    const location = useLocation();
    const {user} = useUserContext();
    const navigate = useNavigate();
    const [isloading, setIsLoading] = useState(true);
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [usageCount, setUsageCount] = useState<number>(0);
    const [reviews, setReviews] = useState<any[]>([]);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [reviewText, setReviewText]       = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState("");
    const [loadingComment, setLoadingComment] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);


    useEffect(() => {
        console.log("🚩 user flags:", {
            isCurator: user.isCurator,
            isAdministrator: user.isAdministrator,
        });
    }, [user]);


    // Handler to submit the review
    const handleSubmitReview = async () => {
        if (!rating || !reviewText.trim()) return;
        setReviewLoading(true);
        try {
            const recipeRef = doc(database, "Recipes", id!);
            const userRef   = doc(database, "Users", user.id);

            await addDoc(
                collection(database, "Recipes", id!, "Ratings"),
                {
                    comment:   reviewText.trim(),
                    stars:     rating,
                    createdAt: serverTimestamp(),
                    recipeId:  recipeRef,  // now a DocumentReference
                    userId:    userRef,    // now a DocumentReference
                }
            );

            setSubmitted((s) => !s);
            setShowReviewDialog(false);
            setReviewText("");
            setRating(0);
        } catch (err) {
            console.error("Error submitting review:", err);
        } finally {
            setReviewLoading(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim()) return;
        setLoadingComment(true);
        try {
            // 1) create the comment doc
            const commentData = {
                content: commentText.trim(),
                created_at: serverTimestamp(),
                recipe_id: doc(database, "Recipes", recipe!.id),
                user_id: doc(database, "Users", user.id),
                workshop_id: null,
            };
            const commentRef = await addDoc(
                collection(database, "Comments"),
                commentData
            );

            // 2) append to user's comments array
            const userRef = doc(database, "Users", user.id);
            // 3) append to recipe's comments array
            const recipeRef = doc(database, "Recipes", recipe!.id);

            await Promise.all([
                updateDoc(userRef, { comments: arrayUnion(commentRef) }),
                updateDoc(recipeRef, { comments: arrayUnion(commentRef) }),
            ]);

            // reset & close
            setCommentText("");
            setDialogOpen(false);
        } catch (error) {
            console.error("Error posting comment:", error);
        } finally {
            setLoadingComment(false);
        }
    };

    const handleGetUserInfo = async (authorId: any): Promise<UserInfo> => {
        try {

            console.log("Fetching user info for authorId:", authorId);
            let userRef: DocumentReference;

            if (typeof authorId === "string") {
                userRef = doc(database, "Users", authorId);
            } else if (
                typeof authorId === "object" &&
                "id" in authorId &&
                typeof authorId.id === "string"
            ) {
                userRef = doc(database, "Users", authorId.id);
            } else {
                userRef = authorId as DocumentReference;
            }

            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                return {
                    id: userSnap.id,
                    pfp: data.pfp,
                    username: data.username,
                    isVerified: data.isVerified,
                    isCurator: data.isCurator,
                    isAdministrator: data.isAdministrator,
                };
            }
        } catch (err) {
            console.error("Error fetching user info:", err);
        }

        return {
            pfp: "/assets/icons/profile-placeholder.svg",
            username: "Unknown",
            id: "",
            isVerified: false,
            isCurator: false,
            isAdministrator: false,
        };
    };

    // fetch comments for this recipe
    useEffect(() => {
        const fetchComments = async () => {
            if (!id) return;
            const commentsQuery = query(
                collection(database, "Comments"),
                where("recipe_id", "==", doc(database, "Recipes", id)),
                orderBy("created_at", "desc")
            );
            const snap = await getDocs(commentsQuery);
            const list = await Promise.all(
                snap.docs.map(async (docSnap) => {
                    const data: any = docSnap.data();
                    const userInfo = await handleGetUserInfo(data.user_id);
                    return {
                        id: docSnap.id,
                        content: data.content,
                        createdAt: data.created_at,
                        username: userInfo.username,
                        userPfp: userInfo.pfp,
                    };
                })
            );
            setComments(list);
        };
        fetchComments();
    }, [id]);

    // Fetch recipe data (either from location.state or Firestore)
    useEffect(() => {
        // Try to pull the recipe out of location.state (only valid for AI recipes)
        const stateRecipe = location.state as Recipe
        const isAiRecipe = !!stateRecipe?.tags?.includes("AI")

        if (isAiRecipe && stateRecipe.id) {
            // For AI recipes, use the in‐memory object
            setRecipe(stateRecipe)
            setIsLoading(false)
        } else {
            // For all non-AI recipes, fetch from Firestore by ID
            const fetchRecipe = async () => {
                if (!id) return
                try {
                    const docRef = doc(database, "Recipes", id)
                    const snap = await getDoc(docRef)
                    if (snap.exists()) {
                        setRecipe({ id: snap.id, ...snap.data() } as Recipe)
                    } else {
                        console.warn(`No recipe found with ID ${id}`)
                    }
                } catch (err) {
                    console.error("Error loading recipe:", err)
                } finally {
                    setIsLoading(false)
                }
            }
            fetchRecipe()
        }
    }, [id, location.state])

    // Fetch reviews from the "Ratings" subcollection for this recipe
    useEffect(() => {
    const fetchReviews = async () => {
        if (!id) return;
        try {
            const reviewsQuery = query(
                collection(database, "Recipes", id, "Ratings"),
                orderBy("createdAt", "desc")
            );
            const reviewsSnap = await getDocs(reviewsQuery);

            // ← enriched snippet here
            const enriched = await Promise.all(
                reviewsSnap.docs.map(async (docSnap) => {
                    const data: any = docSnap.data();
                    const info = await handleGetUserInfo(data.userId);
                    return {
                        id:        docSnap.id,
                        comment:   data.comment,
                        stars:     data.stars,
                        createdAt: data.createdAt,
                        username:  info.username,
                        userPfp:   info.pfp,
                    };
                })
            );
            setReviews(enriched);

        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    fetchReviews();
}, [id, submitted]);


    const [authorData, setAuthorData] = useState<IUser>();

    useEffect(() => {
        const loadAuthor = async () => {
            if (!recipe || recipe.tags?.includes("AI")) return;

            // normalize to a DocumentReference<IUser>
            let authorRef: DocumentReference<IUser>;
            if (typeof recipe.author === "string") {
                authorRef = doc(database, "Users", recipe.author) as DocumentReference<IUser>;
            } else {
                authorRef = recipe.author as DocumentReference<IUser>;
            }

            try {
                const snap = await getDoc(authorRef);
                if (snap.exists()) {
                    // snap.data() already contains all IUser fields
                    const data = snap.data() as IUser;
                    setAuthorData({ id: snap.id, ...data });
                } else {
                    console.warn("No user found at", authorRef.path);
                }
            } catch (err) {
                console.error("Error fetching author info:", err);
            }
        };

        loadAuthor();
    }, [recipe]);



    if (isloading) return (<>
        <p className="text-center text-light-4 mt-10">Loading Recipe...</p>
        <div className="flex justify-center items-center h-screen">
            <Loader />
        </div>
    </>);

    if (!recipe) return (<>
        <p className="text-center text-light-4 mt-10">You shouldn't be here. Visit this page by clicking on a recipe card.</p>
        <Button
            onClick={() => navigate("/explore")}
            className="mb-4 text-sm text-yellow-400 hover:bg-red transition"
        >
            ← Back to Explore
        </Button>
    </>);

    return (
        <>
                <div className="p-6 w-full mx-auto bg-dark-4 text-white">
                    <div className={"text-white"}>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink >
                                        <Link className={"hover:text-accentColor"} to="/">Home</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink >
                                        <Link className={"hover:text-accentColor"} to="/explore">Explore</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink>{recipe?.title}</BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <img
                        src={recipe.mediaUrl || "/assets/icons/recipe-placeholder.svg"}
                        alt={recipe.title}
                        className="w-full h-96 object-cover rounded-2xl shadow-lg"
                    />

                    <h1 className="text-4xl font-bold text-center mt-6">{recipe.title}</h1>

                    <div className="flex items-center justify-center gap-4 my-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                <UserAvatarRow user={authorData} avatarsize={"w-12 h-12"} />

                                {recipe.tags?.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-700 px-2 py-1 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}

                                <p>{recipe.likes?.length || 0} likes</p>
                            </div>
                        </div>
                    </div>

                    <>
                        {user.isCurator && (
                            <div className="flex flex-row gap-2 mt-3">
                                <Button
                                    onClick={() =>
                                        navigate(`/recipe-analytics?recipeId=${recipe.id}`, {
                                            state: { from: location },
                                        })
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded"
                                >
                                    Get Analytics
                                </Button>

                                <Button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const recipeRef = doc(database, "Recipes", recipe.id);
                                        const updatedHighlight = !recipe.isRecommended;

                                        await updateDoc(recipeRef, {
                                            isRecommended: updatedHighlight,
                                        });

                                        window.location.reload(); // refresh to show updated state
                                    }}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1 px-3 rounded"
                                >
                                    {recipe.isRecommended ? "Unhighlight" : "Highlight as Seasonal"}
                                </Button>
                            </div>
                        )}

                        {reviews.length > 0 && (() => {
                            const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
                            const averageRating = (totalStars / reviews.length).toFixed(1);
                            return (
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xl font-bold">{averageRating}</span>
                                    <span className="text-sm">({reviews.length} ratings)</span>
                                </div>
                            );
                        })()}
                </>
                    <div className="flex justify-around text-lg my-4">
                        <p>
                            <span className="font-semibold">Prep:</span> {recipe.prepTime || "N/A"}
                        </p>
                        <p>
                            <span className="font-semibold">Cook:</span> {recipe.cookTime || "N/A"}
                        </p>
                        <p>
                            <span className="font-semibold">Yield:</span> {recipe.servings || "N/A"}
                        </p>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl my-6">
                        <h2 className="text-2xl font-semibold mb-4">Description</h2>
                        <p className="leading-relaxed italic">
                            {recipe.description || "No description provided."}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-semibold mb-2">Ingredients</h3>
                        <ul className="list-disc pl-6">
                            {recipe.ingredients &&
                                recipe.ingredients.map((ingredient, index) => (
                                    <li key={index} className="text-lg">
                                        {ingredient}
                                    </li>
                                ))}
                        </ul>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-2xl font-semibold mb-2">Instructions</h3>
                        <ol className="list-decimal pl-6">
                            {recipe.instructions.map((instruction: string, index: number) => (
                                        <li key={index} className="text-lg">
                                            {instruction}
                                        </li>
                                    ))}
                        </ol>
                    </div>

                    <div className={"flex flex-col justify-center items-center mt-6"}>
                        <div className={"flex flex-col items-center"}>

                            {/* Render review section only for curators */}
                            {user?.isCurator && (
                                <>
                                    {/* Add Review Button + Dialog */}
                                    <div className="flex justify-center mt-6">
                                        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                                            <DialogTrigger asChild>
                                                <Button className={"shad-button_primary "}>Add Review</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Leave a Review</DialogTitle>
                                                    <DialogDescription>
                                                        Pick a star rating and write your thoughts on this recipe.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                {/* Star picker */}
                                                <div className="flex items-center gap-2 mb-4">
                                                    {[1, 2, 3, 4, 5].map((num) => (
                                                        <span
                                                            key={num}
                                                            onClick={() => setRating(num)}
                                                            className={`cursor-pointer text-3xl ${
                                                                rating >= num ? "text-yellow-400" : "text-gray-500"
                                                            }`}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                {/* Review text area */}
                                                <Textarea
                                                    value={reviewText}
                                                    onChange={(e) => setReviewText(e.target.value)}
                                                    placeholder="Write your review here…"
                                                    className="w-full h-24 mb-4"
                                                />
                                                <DialogFooter>
                                                    <Button
                                                        onClick={handleSubmitReview}
                                                        disabled={!rating || !reviewText.trim() || reviewLoading}
                                                    >
                                                        {reviewLoading ? "Submitting…" : "Submit Review"}
                                                    </Button>
                                                    <DialogClose asChild>
                                                        <Button variant="outline" className="ml-2">
                                                            Cancel
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </>
                            )}

                            {/* Reviews Section */}
                            <h2 className="text-2xl font-semibold mb-4">Submitted Reviews</h2>
                            {/* Horizontal carousel to display submitted reviews */}
                            {reviews.length > 0 ? (
                                <Carousel className="w-full">
                                    <CarouselContent>
                                        {reviews.map((rev) => (
                                            <CarouselItem key={rev.id} className="flex justify-center">
                                                <Card className="max-w-xs bg-dark-2 border border-dark-4 p-5 lg:p-7 w-1/2 rounded-3xl">
                                                    <CardHeader className="flex items-center space-x-3">
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarImage src={rev.userPfp} alt={rev.username} />
                                                            <AvatarFallback className={"bg-white text-black"}>
                                                                {rev.username.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle>{rev.username}</CardTitle>
                                                            <CardDescription>
                                                                {multiFormatDateString(
                                                                    rev.createdAt.toDate().toString()
                                                                )}
                                                            </CardDescription>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p>{rev.comment}</p>
                                                    </CardContent>
                                                    <CardFooter>
                                                        <div className="flex items-center gap-2 text-yellow-400 size-2">
                                                            {Array.from({ length: rev.stars }).map((_, i) => (
                                                                <span key={i}>★</span>
                                                            ))}
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            ) : (
                                <p className="p-4 text-center">No reviews yet.</p>
                            )}
                        </div>

                        <div className={"flex flex-col items-center ml-6"}>

                            <h2 className="text-2xl font-semibold mb-4">User Comments & Reviews</h2>
                            {/* Horizontal carousel to display submitted reviews */}
                            {comments.length > 0 ? (
                                <Carousel className="w-full">
                                    <CarouselContent>
                                        {comments.map((com) => (
                                            <CarouselItem key={com.id} className="flex justify-center">
                                                <Card className="max-w-xs bg-card bg-dark-4 rounded-3xl">
                                                    <CardHeader className="flex items-center space-x-3">
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarImage src={com.userPfp} alt={com.username} />
                                                            <AvatarFallback>
                                                                {com.username.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle>{com.username}</CardTitle>
                                                            <CardDescription>
                                                                {multiFormatDateString(
                                                                    com.createdAt.toDate().toString()
                                                                )}
                                                            </CardDescription>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p>{com.content}</p>
                                                    </CardContent>
                                                </Card>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            ) : (
                                <p className="p-4 text-center">No comments yet.</p>
                            )}

                            {/*–– Add Comment Button + Dialog ––*/}
                            <div className="flex justify-center mt-6">
                                <Dialog open={dialogOpen} onOpenChange={setDialogOpen} >
                                    <DialogTrigger asChild>
                                        <Button className={"shad-button_primary"}>Add Comment</Button>
                                    </DialogTrigger>
                                    <DialogContent className={"user-card bg-dark-4 text-white"}>
                                        <DialogHeader>
                                            <DialogTitle>Add a Comment</DialogTitle>
                                            <DialogDescription>
                                                Share your thoughts with the community.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <Textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Write your comment here…"
                                            className="w-full h-32 mb-4 bg-dark-3 text-white"
                                        />

                                        <DialogFooter>
                                            <Button className={"shad-button_primary"}
                                                onClick={handleSubmitComment}
                                                disabled={!commentText.trim() || loadingComment}
                                            >
                                                {loadingComment ? "Posting…" : "Post Comment"}
                                            </Button>
                                            <DialogClose asChild>
                                                <Button variant="outline" className="ml-2">
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {/* Dietary Compliance Review Section */}
                        <div className="mt-10 w-full">
                            <h2 className="text-2xl font-bold mb-4">Dietary Compliance Review</h2>

                            {recipe?.dietaryComplianceReview || recipe?.usageCount !== undefined ? (
                                <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                                    {recipe.dietaryComplianceReview && (
                                        <p className="text-light-3 whitespace-pre-line">
                                            {recipe.dietaryComplianceReview}
                                        </p>
                                    )}
                                    {recipe.usageCount !== undefined && (
                                        <p className="text-light-3">
                                            Number of Times Used: <strong>{recipe.usageCount}</strong>
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic mb-4">
                                    No dietary compliance review submitted yet.
                                </p>
                            )}

                            {/* Only visible to Recipe Curators */}
                            {user.isCurator && (
                                <div className="mt-6 space-y-4">
                                    <Textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Enter dietary compliance review here..."
                                        className="w-full bg-dark-3 text-white h-32"
                                    />
                                    <input
                                        type="number"
                                        value={usageCount}
                                        onChange={(e) => setUsageCount(parseInt(e.target.value))}
                                        placeholder="Enter number of times used"
                                        className="w-full bg-dark-3 text-white h-12 px-4 rounded-md"
                                    />
                                    <Button
                                        className="shad-button_primary"
                                        onClick={async () => {
                                            try {
                                                const recipeRef = doc(database, "Recipes", recipe.id);
                                                await updateDoc(recipeRef, {
                                                    dietaryComplianceReview: reviewText.trim(),
                                                    usageCount: usageCount,
                                                });
                                                setSubmitted(!submitted); // trigger re-fetch
                                                alert("Dietary compliance review and usage count submitted!");
                                                setReviewText(""); // clear input
                                                setUsageCount(0);
                                            } catch (error) {
                                                console.error("Error submitting dietary compliance review:", error);
                                                alert("Failed to submit review.");
                                            }
                                        }}
                                        disabled={!reviewText.trim() && !usageCount}
                                    >
                                        Submit Dietary Review
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center mt-6">
                            <Button
                                onClick={() => window.history.back()}
                                className="bg-dark-4 hover:bg-red text-white px-4 py-2 rounded-md"
                            >
                                Back
                            </Button>
                        </div>

                    </div>


                </div>

        </>
        )
    }

export default RecipeDetails;
