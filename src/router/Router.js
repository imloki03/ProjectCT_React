import {createBrowserRouter} from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import ForgotPasswordPage from "../pages/ForgotPassword";
import TestPage from "../pages/Test";
import LandingPage from "../pages/LandingPage";
import AuthPage from "../pages/AuthPage";

export const routeLink = {
    default: '/',
    auth: '/auth',
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
            { path: routeLink.default, element: <AuthPage /> },
            { path: routeLink.auth, element: <AuthPage /> },
            { path: routeLink.forgotPassword, element: <ForgotPasswordPage /> },
            { path: routeLink.test, element: <TestPage /> },
        ],
    },
]);