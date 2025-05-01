// RecipeDetails.tsx
import {useEffect, useState} from "react";
import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    DocumentReference,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import {database} from "@/lib/firebase/config";
import {Link, useLocation, useNavigate, useParams} from "react-router-dom";
import {useUserContext} from "@/context/AuthContext";
import {Button} from "@/components/ui/button";
import {IUser, Recipe, UserInfo} from "@/types";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,} from "@/components/ui/carousel";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {multiFormatDateString} from "@/lib/utils";
import {Loader, UserAvatarRow} from "@/components/shared";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const RecipeDetails = () => {
    const {id} = useParams<{ id: string }>();
    const location = useLocation();
    const {user} = useUserContext();
    const navigate = useNavigate();
    const AiUser: IUser = {
        id: "ai-user",
        username: "AI Recipe Generator",
        pfp: "/assets/icons/ai-avatar.svg",
        isVerified: false,
        isCurator: false,
        isAdministrator: false,
    }

    const [isLoading, setIsLoading] = useState(true);
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [usageCount, setUsageCount] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [commentText, setCommentText] = useState("");
    const [loadingComment, setLoadingComment] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [authorData, setAuthorData] = useState<IUser>(AiUser);

    // Determine if this is an AI recipe
    const isAiRecipe = !!recipe?.tags?.includes("AI");

    // Submit a new review
    const handleSubmitReview = async () => {
        if (!rating || !reviewText.trim()) return;
        setReviewLoading(true);
        try {
            const recipeRef = doc(database, "Recipes", id!);
            const userRef = doc(database, "Users", user.id);
            await addDoc(collection(database, "Recipes", id!, "Ratings"), {
                comment: reviewText.trim(),
                stars: rating,
                createdAt: serverTimestamp(),
                recipeId: recipeRef,
                userId: userRef,
            });
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

    // Submit a new comment
    const handleSubmitComment = async () => {
        if (!commentText.trim()) return;
        setLoadingComment(true);
        try {
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
            const userRef = doc(database, "Users", user.id);
            const recipeRef = doc(database, "Recipes", recipe!.id);
            await Promise.all([
                updateDoc(userRef, {comments: arrayUnion(commentRef)}),
                updateDoc(recipeRef, {comments: arrayUnion(commentRef)}),
            ]);
            setCommentText("");
            setDialogOpen(false);
        } catch (error) {
            console.error("Error posting comment:", error);
        } finally {
            setLoadingComment(false);
        }
    };

    // Helper to fetch user info
    const handleGetUserInfo = async (authorId: any): Promise<UserInfo> => {
        try {
            let userRef: DocumentReference;
            if (typeof authorId === "string") userRef = doc(database, "Users", authorId);
            else if (authorId?.id) userRef = doc(database, "Users", authorId.id);
            else userRef = authorId as DocumentReference;
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                const data = snap.data();
                return {
                    id: snap.id,
                    pfp: data.pfp,
                    username: data.username,
                    isVerified: data.isVerified,
                    isCurator: data.isCurator,
                    isAdministrator: data.isAdministrator,
                };
            }
        } catch (err) {
            console.error(err);
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

    // Load recipe: AI from state, else Firestore
    useEffect(() => {
        const stateRecipe = location.state as Recipe | undefined;
        const isAi = !!stateRecipe?.tags?.includes("AI");
        if (isAi && stateRecipe!.id) {
            setRecipe(stateRecipe!);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        (async () => {
            if (!id) return;
            try {
                const snap = await getDoc(doc(database, "Recipes", id));
                if (snap.exists()) setRecipe({id: snap.id, ...snap.data()} as Recipe);
            } catch (e) {
                console.error("Error loading recipe", e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [id, location.state]);

    // Load reviews, comments, author for non-AI
    useEffect(() => {
        if (!recipe || isAiRecipe) return;
        const loadAll = async () => {
            // reviews
            try {
                const snap = await getDocs(
                    query(collection(database, "Recipes", id!, "Ratings"), orderBy("createdAt", "desc"))
                );
                const list = await Promise.all(
                    snap.docs.map(async (ds) => {
                        const d: any = ds.data();
                        const info = await handleGetUserInfo(d.userId);
                        return {
                            id: ds.id,
                            comment: d.comment,
                            stars: d.stars,
                            createdAt: d.createdAt,
                            username: info.username,
                            userPfp: info.pfp,
                        };
                    })
                );
                setReviews(list);
            } catch {
                /* ignore */
            }

            // comments
            try {
                const snap2 = await getDocs(
                    query(
                        collection(database, "Comments"),
                        where("recipe_id", "==", doc(database, "Recipes", id!)),
                        orderBy("created_at", "desc")
                    )
                );
                const list2 = await Promise.all(
                    snap2.docs.map(async (ds) => {
                        const d: any = ds.data();
                        const info = await handleGetUserInfo(d.user_id);
                        return {
                            id: ds.id,
                            content: d.content,
                            createdAt: d.created_at,
                            username: info.username,
                            userPfp: info.pfp,
                        };
                    })
                );
                setComments(list2);
            } catch {
                /* ignore */
            }

            // author
            try {
                let ref: DocumentReference<IUser>;
                if (typeof recipe.author === "string")
                    ref = doc(database, "Users", recipe.author) as DocumentReference<IUser>;
                else ref = recipe.author as DocumentReference<IUser>;
                const snapA = await getDoc(ref);
                if (snapA.exists()) setAuthorData({id: snapA.id, ...(snapA.data() as IUser)});
            } catch {
                /* ignore */
            }
        };
        loadAll();
    }, [recipe, id, isAiRecipe]);

    if (isLoading)
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader/>
            </div>
        );
    if (!recipe)
        return (
            <p className="mt-10 text-center">
                Recipe not found.{" "}
                <Button onClick={() => navigate("/explore")}>Back to Explore</Button>
            </p>
        );

    return (
        <Card className="p-6 w-full mx-auto bg-dark-4 text-white">
            <CardHeader className="text-white">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link className="hover:text-accentColor" to="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link className="hover:text-accentColor" to="/explore">Explore</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbLink>{recipe.title}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <h1 className="text-4xl font-bold text-center mt-6">{recipe.title}</h1>
            </CardHeader>

            <CardContent className="p-6">
                <img
                    src={recipe.mediaUrl || "/assets/icons/recipe-placeholder.svg"}
                    alt={recipe.title}
                    className="w-full h-96 object-cover rounded-2xl shadow-lg"
                />

                <div className="flex items-center justify-center gap-4 my-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                            <UserAvatarRow user={authorData} avatarsize="w-12 h-12"/>
                            {recipe.tags?.map((tag, i) => (
                                <span key={i} className="bg-gray-700 px-2 py-1 rounded-full">
                {tag}
              </span>
                            ))}
                            <p>{recipe.likes?.length || 0} likes</p>
                        </div>
                    </div>
                </div>

                {reviews.length > 0 && (() => {
                    const totalStars = reviews.reduce((sum, r) => sum + r.stars, 0);
                    const avg = (totalStars / reviews.length).toFixed(1);
                    return (
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl font-bold">{avg}</span>
                            <span className="text-sm">({reviews.length} ratings)</span>
                        </div>
                    );
                })()}

                <div className="flex justify-around text-lg my-4">
                    <p><span className="font-semibold">Prep:</span> {recipe.prepTime || "N/A"}</p>
                    <p><span className="font-semibold">Cook:</span> {recipe.cookTime || "N/A"}</p>
                    <p><span className="font-semibold">Yield:</span> {recipe.servings || "N/A"}</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl my-6">
                    <h2 className="text-2xl font-semibold mb-4">Description</h2>
                    <p className="leading-relaxed italic">
                        {recipe.description || "No description provided."}
                    </p>
                </div>

                {/* Ingredients */}
                <div>
                    <h3 className="text-2xl font-semibold mb-2">Ingredients</h3>
                    <ul className="list-disc pl-6">
                        {Array.isArray(recipe.ingredients) ? (
                            recipe.ingredients.map((ing, idx) => (
                                <li key={idx} className="text-lg">{ing}</li>
                            ))
                        ) : (
                            <li className="text-lg">{recipe.ingredients}</li>
                        )}
                    </ul>
                </div>

                {/* Instructions */}
                <div className="mt-6">
                    <h3 className="text-2xl font-semibold mb-2">Instructions</h3>
                    <ol className="list-decimal pl-6">
                        {Array.isArray(recipe.instructions) ? (
                            recipe.instructions.map((ins, idx) => (
                                <li key={idx} className="text-lg">{ins}</li>
                            ))
                        ) : (
                            <li className="text-lg">{recipe.instructions}</li>
                        )}
                    </ol>
                </div>

                {/* Curator/Admin actions */}
                {(user.isCurator || user.isAdministrator) && !isAiRecipe && (
                    <div className="flex flex-col gap-2 mt-3">
                        {user.isAdministrator && (
                            <Button
                                onClick={() =>
                                    navigate(`/recipe-analytics?recipeId=${recipe.id}`, {state: {from: location}})
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded"
                            >
                                Get Analytics
                            </Button>
                        )}
                        {user.isCurator && (
                            <Button
                                onClick={async () => {
                                    const r = doc(database, "Recipes", recipe.id);
                                    await updateDoc(r, {isRecommended: !recipe.isRecommended});
                                    window.location.reload();
                                }}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1 px-3 rounded"
                            >
                                {recipe.isRecommended ? "Unhighlight" : "Highlight as Seasonal"}
                            </Button>
                        )}
                    </div>
                )}

                {!isAiRecipe && (
                    <>
                        {/* Reviews Carousel */}
                        <div className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">Submitted Reviews</h2>
                            {reviews.length > 0 ? (
                                <Carousel className="w-full">
                                    <CarouselContent>
                                        {reviews.map((rev) => (
                                            <CarouselItem key={rev.id} className="flex justify-center">
                                                <Card
                                                    className="max-w-xs bg-dark-2 border border-dark-4 p-5 lg:p-7 w-1/2 rounded-3xl">
                                                    <CardHeader className="flex items-center space-x-3">
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarImage src={rev.userPfp} alt={rev.username}/>
                                                            <AvatarFallback className="bg-white text-black">
                                                                {rev.username.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle>{rev.username}</CardTitle>
                                                            <CardDescription>
                                                                {multiFormatDateString(rev.createdAt.toDate().toString())}
                                                            </CardDescription>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p>{rev.comment}</p>
                                                    </CardContent>
                                                    <CardFooter>
                                                        <div className="flex items-center gap-2 text-yellow-400">
                                                            {Array.from({length: rev.stars}).map((_, i) => <span
                                                                key={i}>★</span>)}
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious/>
                                    <CarouselNext/>
                                </Carousel>
                            ) : (
                                <p className="p-4 text-center">No reviews yet.</p>
                            )}
                        </div>

                        {/* Add Review Dialog */}
                        {user.isCurator && (
                            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                                <DialogTrigger asChild>
                                    <Button className="shad-button_primary">Add Review</Button>
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
                        )}

                        {/* Comments Carousel */}
                        <div className="mt-10">
                            <h2 className="text-2xl font-semibold mb-4">User Comments & Reviews</h2>
                            {comments.length > 0 ? (
                                <Carousel className="w-full">
                                    <CarouselContent>
                                        {comments.map((com) => (
                                            <CarouselItem key={com.id} className="flex justify-center">
                                                <Card className="max-w-xs bg-card bg-dark-4 rounded-3xl">
                                                    <CardHeader className="flex items-center space-x-3">
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarImage src={com.userPfp} alt={com.username}/>
                                                            <AvatarFallback>
                                                                {com.username.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle>{com.username}</CardTitle>
                                                            <CardDescription>
                                                                {multiFormatDateString(com.createdAt.toDate().toString())}
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
                                    <CarouselPrevious/>
                                    <CarouselNext/>
                                </Carousel>
                            ) : (
                                <p className="p-4 text-center">No comments yet.</p>
                            )}
                        </div>

                        {/* Add Comment Dialog */}
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="shad-button_primary">Add Comment</Button>
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

                        {/* Dietary Compliance */}
                        <div className="mt-10 w-full">
                            <h2 className="text-2xl font-bold mb-4">Dietary Compliance Review</h2>
                            {recipe.dietaryComplianceReview || recipe.usageCount !== undefined ? (
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
                                        onClick={async () => {
                                            /* … */
                                        }}
                                        className="shad-button_primary"
                                        disabled={!reviewText.trim() && !usageCount}
                                    >
                                        Submit Dietary Review
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>

            <CardFooter className="p-6">
                <Button
                    onClick={() => navigate(-1)}
                    className="bg-dark-4 hover:bg-red text-white px-4 py-2 rounded-md"
                >
                    ← Back
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RecipeDetails;
