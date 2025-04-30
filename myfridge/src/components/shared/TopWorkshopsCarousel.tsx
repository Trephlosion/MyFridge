import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import {WorkshopCard, UserCardMini} from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import UserCard from "../cards/UserCard.tsx";
import {Workshop} from "@/types";
import {getTopWorkshops} from "@/lib/firebase/api.ts";
const TopWorkshopsCarousel = () => {
    const [topWorkshops, setTopWorkshops] = useState<Workshop[]>([]);
    useEffect(() => {
        const fetchTopData = async () => {
            const [workshops] = await Promise.all([
                getTopWorkshops(3),

            ]);
            setTopWorkshops(workshops);

        };
        fetchTopData();
    }, []);

    return (
        <>
            <h2 className="h3-bold md:h2-bold text-left w-full">Top Workshops</h2>
            <Carousel>
                <CarouselContent>
                    {topWorkshops.map(workshops => (
                        <CarouselItem key={workshops.id} className="md:basis-1/3">
                            <WorkshopCard workshop={workshops}/>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </>
    )
}
export default TopWorkshopsCarousel
