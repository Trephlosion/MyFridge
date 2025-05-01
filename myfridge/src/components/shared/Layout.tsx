// src/components/ui/Layout.tsx
import React, { ReactNode } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Pagination } from "@/components/ui/pagination";
import { useLocation, Link } from "react-router-dom";

type LayoutProps = {
    children: ReactNode;
    pagination?: {
        currentPage: number;
        onPageChange: (page: number) => void;
        totalPages: number;
    };
};

const Layout: React.FC<LayoutProps> = ({ children, pagination }) => {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter(Boolean);

    return (
        <div className="p-6">
            {/* Breadcrumbs */}
            <Breadcrumb className="mb-4">
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {pathnames.map((segment, idx) => {
                    const to = `/${pathnames.slice(0, idx + 1).join("/")}`;
                    const isLast = idx === pathnames.length - 1;
                    return (
                        <BreadcrumbItem key={to}>
                            {isLast ? (
                                <span>{decodeURIComponent(segment)}</span>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link to={to}>{decodeURIComponent(segment)}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    );
                })}
            </Breadcrumb>

            {/* Page Content */}
            <div className="min-h-[60vh]">{children}</div>

            {/* Pagination if provided */}
            {pagination && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        total={pagination.totalPages}
                        current={pagination.currentPage}
                        onChange={pagination.onPageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default Layout;
