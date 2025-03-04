import { Outlet } from "react-router-dom";
import {LoadingProvider} from "../../contexts/LoadingContext";
import {NotificationProvider} from "../../contexts/NotificationContext";

const AuthLayout = () => {
    return (
        <NotificationProvider>
            <LoadingProvider>
                <Outlet />
            </LoadingProvider>
        </NotificationProvider>
    );
};

export default AuthLayout;
