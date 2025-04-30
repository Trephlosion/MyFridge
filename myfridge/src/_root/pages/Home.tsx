import {
    AiRecipeCarousel,
    TopUsersCarousel,
    TopWorkshopsCarousel,
    TopChallengesCarousel,
} from "@/components/shared";
import Feed from "@/components/shared/Feed";
import { Separator } from "@/components/ui/separator";
import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import ImageToRecipeForm from "@/components/shared/ImageToRecipeForm.tsx";



const Home = () => {
    const [showImageForm, setShowImageForm] = useState(false);

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

                {/* AI Recommendations */}
                <div>
                    <h2 className="h3-bold md:h2-bold text-left w-full">AI Recommendations</h2>
                    <AiRecipeCarousel />



                    {/*<Button className="shad-button_primary mt-4" onClick={() => setShowImageForm((prev) => !prev)}>
                        {showImageForm ? "Hide Image Upload" : "Generate from Image"}
                    </Button>

                    {showImageForm && <ImageToRecipeForm />}*/}
                </div>

                <Separator />

                {/* My Feed */}
                <Feed />
            </div>
        </div>
    );
};

export default Home;
