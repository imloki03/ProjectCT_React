import {createBrowserRouter} from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/Login";
import RegisterPage from "../pages/Register";
import ForgotPasswordPage from "../pages/ForgotPassword";
import TestPage from "../pages/Test";
import LandingPage from "../pages/LandingPage";

export const routeLink = {
    default: '/',
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    test: "/test",
    landing: "/landing",
}

const createAppRoutes = (routes) => {
    return createBrowserRouter([...routes]);
};

export const externalRoute = createAppRoutes([
    {
        path: routeLink.landing,
        element: <LandingPage />,
    },
    {
        path: routeLink.default,
        element: <AuthLayout />,
        children: [
            { path: routeLink.default, element: <LoginPage /> },
            { path: routeLink.login, element: <LoginPage /> },
            { path: routeLink.register, element: <RegisterPage /> },
            { path: routeLink.forgotPassword, element: <ForgotPasswordPage /> },
            { path: routeLink.test, element: <TestPage /> },
        ],
    },
]);