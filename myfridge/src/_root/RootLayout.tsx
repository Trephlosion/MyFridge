import {Outlet} from "react-router-dom";
import {Bottombar, LeftSidebar, Topbar} from "@/components/shared";

const RootLayout = ()=> {
    return (
        <div className="w-full md:flex">
            <Topbar />

            <LeftSidebar />

            <section className={"flex flex-1 h-screen"}>
                <Outlet />
            </section>

            <Bottombar />
        </div>
    )
}

export default RootLayout
