            import { useUserContext } from "@/context/AuthContext.tsx";

            const { user } = useUserContext();

            export const sidebarLinks = [
                {
                    imgURL: "/assets/icons/home.svg",
                    route: "/",
                    label: "Home",
                },
                {
                    imgURL: "/assets/icons/wallpaper.svg",
                    route: "/explore",
                    label: "Explore",
                },
                {
                    imgURL: "/assets/icons/people.svg",
                    route: "/all-users",
                    label: "People",
                },
                {
                    imgURL: "/assets/icons/bookmark.svg",
                    route: "/saved",
                    label: "Saved",
                },
                {
                    imgURL: "/assets/icons/gallery-add.svg",
                    route: "/create-recipe",
                    label: "Create Recipe",
                },
                ...(user?.isVerified || user?.isAdministrator ? [
                    ...(user?.isAdministrator ? [{
                        imgURL: "/assets/icons/admin.svg",
                        route: "/admin",
                        label: "Admin",
                    }] : []),
                    ...(user?.isVerified ? [{
                        imgURL: "/assets/icons/verified.svg",
                        route: "/workshops",
                        label: "Workshops",
                    }] : []),
                ] : [])
            ];

            export const bottombarLinks = [
                {
                    imgURL: "/assets/icons/home.svg",
                    route: "/",
                    label: "Home",
                },
                {
                    imgURL: "/assets/icons/wallpaper.svg",
                    route: "/explore",
                    label: "Explore",
                },
                {
                    imgURL: "/assets/icons/bookmark.svg",
                    route: "/saved",
                    label: "Saved",
                },
                {
                    imgURL: "/assets/icons/gallery-add.svg",
                    route: "/create-recipe",
                    label: "Create",
                },
                ...(user?.isVerified || user?.isAdministrator ? [
                    ...(user?.isAdministrator ? [{
                        imgURL: "/assets/icons/admin.svg",
                        route: "/admin",
                        label: "Admin",
                    }] : []),
                    ...(user?.isVerified ? [{
                        imgURL: "/assets/icons/verified.svg",
                        route: "/workshops",
                        label: "Workshops",
                    }] : []),
                ] : [])
            ];
