import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { UserCardMini } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import UserCard from "../cards/UserCard.tsx";
import {IUser} from "@/types";
import { getTopUsers} from "@/lib/firebase/api.ts";
const TopUsersCarousel = () => {
    const [topUsers, setTopUsers] = useState<IUser[]>([]);
    useEffect(() => {
        const fetchTopData = async () => {
            const [users] = await Promise.all([
                getTopUsers(3),

            ]);
            setTopUsers(users);

        };
        fetchTopData();
    }, []);

    return (
        <>
        <h2 className="h3-bold md:h2-bold text-left w-full">Top Users</h2>
    <Carousel>
        <CarouselContent>
            {topUsers.map(user => (
                <CarouselItem key={user.id} className="md:basis-1/3">
                    <UserCard user={user} />
                </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
    </Carousel>
        </>
    )
}
export default TopUsersCarousel
