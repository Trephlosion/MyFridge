import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { UserCardMini } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
const TopUsersCarousel = () => {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        // Query the "Users" collection for the top 3 most followed users using "followersCount"
        const q = query(
            collection(database, "Users"),
            orderBy("followersCount", "desc"),
            limit(3)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
        });
        return () => unsubscribe();
    }, []);

    if (!users.length) return <p>No top users available.</p>;

    return (
        <Carousel opts={{ align: "start" }} className="w-full max-w-sm">
            <CarouselContent>
                {users.map(user => (
                    <CarouselItem key={user.id} className="w-full h-fit">
                        <UserCardMini user={user} />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    )
}
export default TopUsersCarousel
