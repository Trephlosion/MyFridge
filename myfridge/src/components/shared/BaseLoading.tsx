
import UserSkeletonCard from "@/components/cards/UserSkeletonCard.tsx";
// make this render the skeletons in the way that the real components would be rendered
const BaseLoading = () => {
    return (
        <div>
            <h2 className={"text-center flex-col"}>Loading Users...</h2>
            <div className={"user-grid"}>

                {Array.from({ length: 9 }).map((_, index) => (
                    <UserSkeletonCard key={index} />
                ))}

            </div>

        </div>
    )
}
export default BaseLoading
