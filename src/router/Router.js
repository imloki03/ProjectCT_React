import {createBrowserRouter} from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/Login";
import RegisterPage from "../pages/Register";
import ForgotPasswordPage from "../pages/ForgotPassword";

export const routeLink = {
    default: '/',
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
}

const createAppRoutes = (routes) => {
    return createBrowserRouter([...routes]);
};

export const externalRoute = createAppRoutes([
    {
        path: routeLink.default,
        element: <AuthLayout />,
        children: [
            { path: routeLink.default, element: <LoginPage /> },
            { path: routeLink.login, element: <LoginPage /> },
            { path: routeLink.register, element: <RegisterPage /> },
            { path: routeLink.forgotPassword, element: <ForgotPasswordPage /> },
        ],
    },
]);