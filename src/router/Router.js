import {createBrowserRouter} from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import ForgotPasswordPage from "../pages/ForgotPassword";
import TestPage from "../pages/Test";
import LandingPage from "../pages/LandingPage";
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import AuthPage from "../pages/AuthPage";
import ProjectLayout from "../layouts/ProjectLayout";
import UserProfilePage from "../pages/UserProfilePage";
import WorkSpacePage from "../pages/WorkSpace";
import StoragePage from "../pages/StoragePage";
import ChatBoxPage from "../pages/ChatboxPage";
import BacklogPage from "../pages/BacklogPage";
import PhasePage from "../pages/PhasePage";
import TaskPhasePage from "../pages/TaskPhasePage";
import CollabPage from "../pages/CollabPage";
import StatisticPage from "../pages/StatisticPage";
import PageNotFound from "../pages/PageNotFound";
import DashboardPage from "../pages/DashboardPage";
import EditProject from "../pages/EditProjectPage";
import OAuthRedirectPage from "../pages/OAuthRedirectPage";
import VideoRoomPage from "../pages/VideoRoomPage";

export const routeLink = {
    default: '/',
    auth: '/auth',
    forgotPassword: '/forgot-password',
    test: "/test",
    landing: "/landing",
    profile: "/profile",
    project: "/:ownerUsername/:projectName",
    projectTabs: {
        default: "",
        // dashboard: "dashboard",
        editProject: "edit",
        stat: "stat",
        backlog: "backlog",
        phase: "phase",
        taskPhase:"phase/:phaseId",
        chatbox: "chatbox",
        storage: "storage",
        collaborator: "collaborator",
        meeting: "meeting",
    },
    pageNotFound: "/404PageNotFound",
    oauthGithub: "/oauth2/github/redirect",
    oauthGoogle: "/oauth2/google/redirect"
}

const createAppRoutes = (routes) => {
    return createBrowserRouter([...routes, { path: '*', element: <PageNotFound /> }]);
};

export const internalRoute = createAppRoutes([
    {
        path: routeLink.default,
        element: <WorkspaceLayout />,
        children: [
            { path: routeLink.default, element: <WorkSpacePage/> },
            { path: routeLink.profile, element: <UserProfilePage /> },
        ],
    },
    {
        path: routeLink.project,
        element: <ProjectLayout />,
        children: [
            { path: routeLink.projectTabs.default, element: <DashboardPage /> },
            // { path: routeLink.projectTabs.dashboard, element: <DashboardPage/> },
            { path: routeLink.projectTabs.editProject, element: <EditProject/> },
            { path: routeLink.projectTabs.storage, element: <StoragePage /> },
            { path: routeLink.projectTabs.chatbox, element: <ChatBoxPage/> },
            { path: routeLink.projectTabs.backlog, element: <BacklogPage /> },
            { path: routeLink.projectTabs.phase, element: <PhasePage /> },
            { path: routeLink.projectTabs.taskPhase, element: <TaskPhasePage /> },
            { path: routeLink.projectTabs.collaborator, element: <CollabPage /> },
            { path: routeLink.projectTabs.stat, element: <StatisticPage /> },
            { path: routeLink.projectTabs.meeting, element: <VideoRoomPage /> },
        ],
    },
    {
        path: routeLink.default,
        element: <AuthLayout />,
        children: [
            { path: routeLink.oauthGithub, element: <OAuthRedirectPage /> },
            { path: routeLink.oauthGoogle, element: <OAuthRedirectPage /> },
        ]
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
            { path: routeLink.oauthGithub, element: <OAuthRedirectPage /> },
            { path: routeLink.oauthGoogle, element: <OAuthRedirectPage /> },
            { path: routeLink.test, element: <TestPage /> },
        ],
    },
]);