import React from "react";
import AiRecipeCarousel from "@/components/shared/AiRecipeCarousel";
import ImageToRecipeCarousel from "@/components/shared/ImageToRecipeCarousel";

const AIFeatures: React.FC = () => (
    <div className="p-6 space-y-10">
        <h1 className="text-2xl font-bold">AI Features</h1>

        {/* top: fridge-based recipes */}
        <section className={"flex w-full"}>
            <AiRecipeCarousel />
        </section>

        {/* bottom: image-based recipes */}
        <section className={"flex w-full"}>
            <ImageToRecipeCarousel />
        </section>
    </div>
);

export default AIFeatures;
