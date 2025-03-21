
import UserSkeletonCard from "@/components/shared/UserSkeletonCard.tsx";
// make this render the skeletons in the way that the real components would be rendered
const BaseLoading = () => {
    return (
        <div>
            <div className={"user-grid"}>

                {Array.from({ length: 9 }).map((_, index) => (
                    <UserSkeletonCard key={index} />
                ))}

            </div>

        </div>
    )
}
export default BaseLoading
