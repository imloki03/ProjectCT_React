import {createBrowserRouter} from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import ForgotPasswordPage from "../pages/ForgotPassword";
import TestPage from "../pages/Test";
import LandingPage from "../pages/LandingPage";
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import AuthPage from "../pages/AuthPage";
import ProjectLayout from "../layouts/ProjectLayout";
import WorkSpacePage from "../pages/WorkSpace";

export const routeLink = {
    default: '/',
    auth: '/auth',
    forgotPassword: '/forgot-password',
    test: "/test",
    landing: "/landing",
    project: "/project",
}

const createAppRoutes = (routes) => {
    return createBrowserRouter([...routes]);
};

export const internalRoute = createAppRoutes([
    {
        path: routeLink.default,
        element: <WorkspaceLayout />,
        children: [
            { path: routeLink.default, element: <WorkSpacePage/> },
        ],
    },
    {
        path: routeLink.default,
        element: <ProjectLayout />,
        children: [
            { path: routeLink.project, element: <TestPage /> },
        ],
    },
]);

export const externalRoute = createAppRoutes([
    {
        path: routeLink.default,
        element: <LandingPage />,
    },
    {
        path: routeLink.default,
        element: <AuthLayout />,
        children: [
            { path: routeLink.auth, element: <AuthPage /> },
            { path: routeLink.forgotPassword, element: <ForgotPasswordPage /> },
            { path: routeLink.test, element: <TestPage /> },
        ],
    },
]);