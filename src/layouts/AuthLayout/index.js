import { Outlet } from "react-router-dom";
import {LoadingProvider} from "../../contexts/LoadingContext";
import {NotificationProvider} from "../../contexts/NotificationContext";

const AuthLayout = () => {
    return (
        <NotificationProvider>
            <LoadingProvider>
                <div className="auth-layout">
                    <div className="auth-container">
                        <h1>Welcome</h1>
                        <Outlet />
                    </div>
                </div>
            </LoadingProvider>
        </NotificationProvider>
    );
};

export default AuthLayout;
