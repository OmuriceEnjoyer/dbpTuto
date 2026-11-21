import {Outlet} from "react-router-dom";

export function LayoutLogin() {
    return (
        <div>
            <main>
                <Outlet />
            </main>
        </div>
    );
}