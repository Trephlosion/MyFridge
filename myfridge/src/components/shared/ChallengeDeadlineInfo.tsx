import { formatDistanceToNow } from "date-fns";

const ChallengeDeadlineInfo = ({ deadline }: { deadline: any }) => {
    if (!deadline?.toDate) return null;

    const deadlineDate = deadline.toDate();
    const isExpired = deadlineDate.getTime() < Date.now();
    const timeLeft = formatDistanceToNow(deadlineDate, { addSuffix: true });

    return (
        <div className="text-center mt-4">
            {isExpired ? (
                <p className="text-red-500 font-semibold">Challenge closed</p>
            ) : (
                <p className="text-light-3">Ends {timeLeft}</p>
            )}
        </div>
    );
};

export default ChallengeDeadlineInfo;
