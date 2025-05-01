import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ChallengeCard } from "@/components/shared";
import { Challenge } from "@/types";
import { getTopChallenges } from "@/lib/firebase/api.ts";

const TopChallengesCarousel = () => {

    const [topChallenges, setTopChallenges] = useState<Challenge[]>([]);

    useEffect(() => {
        const fetchTopData = async () => {
            const [challenges] = await Promise.all([
                getTopChallenges(3),

            ]);
            setTopChallenges(challenges);

        };
        fetchTopData();
    }, []);

    return (
        <>
            <h2 className="h3-bold md:h2-bold text-left w-full">Top Challenges</h2>
            <Carousel>
                <CarouselContent>
                    {topChallenges.map(challenges => (
                        <CarouselItem key={challenges.id} className="md:basis-1/3">
                            <ChallengeCard challenge={challenges}/>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </>
    )
}
export default TopChallengesCarousel
