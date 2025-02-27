import { Outlet } from "react-router-dom";

const AuthLayout = () => {
    return (
        <div className="auth-layout">
            <div className="auth-container">
                <h1>Welcome</h1>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
