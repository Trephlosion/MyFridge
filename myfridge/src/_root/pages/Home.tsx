import {
    TopUsersCarousel,
    TopWorkshopsCarousel,
    TopChallengesCarousel,
} from "@/components/shared";
import Feed from "@/components/shared/Feed";
import { Separator } from "@/components/ui/separator";

const Home = () => {

    return (
        <div className="flex flex-1">
            <div className="home-container space-y-10">

                {/* Top Users */}
                <div>
                    <TopUsersCarousel />
                </div>

                <Separator />

                {/* Top Workshops */}
                <div>
                    <TopWorkshopsCarousel />
                </div>

                <Separator />

                {/* Top Challenges */}
                <div>
                    <TopChallengesCarousel />
                </div>

                <Separator />

                {/* My Feed */}
                <Feed />
            </div>
        </div>
    );
};

export default Home;
