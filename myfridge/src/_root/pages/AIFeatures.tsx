import React from "react";
import AiRecipeCarousel from "@/components/shared/AiRecipeCarousel";
import ImageToRecipeCarousel from "@/components/shared/ImageToRecipeCarousel";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";
import {Link} from "react-router-dom";

const AIFeatures: React.FC = () => (
    <div className="p-6 space-y-10 bg-dark-4">

        <Breadcrumb>
        <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbLink asChild>
                    <Link className={"hover:text-accentColor"} to="/">Home</Link>
                </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbLink>AI Features</BreadcrumbLink>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>

        <h1 className="text-2xl font-bold">AI Features</h1>

        {/* top: fridge-based recipes */}
            <AiRecipeCarousel />

        {/* bottom: image-based recipes */}
            <ImageToRecipeCarousel />

    </div>
);

export default AIFeatures;
