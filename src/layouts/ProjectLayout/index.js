import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import "./index.css";
import {LoadingProvider} from "../../contexts/LoadingContext";
import {NotificationProvider} from "../../contexts/NotificationContext";
import LogoWithName from "../../assets/images/logo_with_name.png";
import {PanelMenu} from "primereact/panelmenu";
import {Badge} from "primereact/badge";
import Avatar from "../../components/Avatar";
import {BreadcrumbProvider, Breadcrumbs} from "../../contexts/BreadCrumbContext";
import {useEffect, useRef, useState} from "react";
import {Menu} from "primereact/menu";
import {useTranslation} from "react-i18next";
import {logout} from "../../redux/slices/userSlice";
import {routeLink} from "../../router/Router";
import {useDispatch, useSelector} from "react-redux";
import Drawer from "./Drawer";
import AssitantICon from "../../assets/icons/assistant_icon.png";
import AssistantChat from "../../components/AssistantChat";
import LanguageSelector from "../../components/LanguageSelector";
import {askNotificationPermission, onMessageListener, refreshFcmToken} from "../../config/firebaseConfig";
import {OverlayPanel} from "primereact/overlaypanel";
import {TabView, TabPanel} from "primereact/tabview";
import {
    getAllNotificationsOfUser,
    getAllReadNotificationsOfUser,
    getAllUnReadNotificationsOfUser
} from "../../api/notiApi";
import NotificationBell from "../../components/NotificationBell";

const ProjectLayout = () => {
    const menuRef = useRef(null);
    const op = useRef(null);
    const location = useLocation();
    const [projects, setProjects] = useState([]);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerTitle, setDrawerTitle] = useState('');
    const [drawerContent, setDrawerContent] = useState(null);
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);

    const [unreadNotifications, setUnreadNotifications] = useState([]);
    const [readNotifications, setReadNotifications] = useState([]);

    const openDrawer = (title = 'Details', content = null) => {
        setDrawerTitle(title);
        setDrawerContent(content);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setDrawerTitle(null);
        setDrawerContent(null);
        setIsDrawerOpen(false);
    }

    const user = useSelector((state) => state.user.currentUser);

    const pathSegments = location.pathname.split("/");
    const activeRoute = pathSegments.length > 2 ? pathSegments[3] : "";

    const handleLogout = async () => {
        dispatch(logout());
        localStorage.removeItem("token");
        await refreshFcmToken();
        navigate(routeLink.default);
    };

    const menuItems = [
        { label: t("workspaceLayout.editProfile"), icon: "pi pi-user-edit", command: () => navigate(routeLink.profile) },
        { label: t("workspaceLayout.logout"), icon: "pi pi-sign-out", command: () => handleLogout() }
    ];

    const items = [
        { label: "Dashboard", icon: "pi pi-th-large", command: () => navigate(routeLink.projectTabs.default), className: activeRoute === routeLink.projectTabs.default ? "active-menu-item" : "" },
        { label: "Statistic", icon: "pi pi-chart-bar", command: () => navigate(routeLink.projectTabs.stat), className: activeRoute === routeLink.projectTabs.stat ? "active-menu-item" : "" },
        { label: "Backlog", icon: "pi pi-list", command: () => navigate(routeLink.projectTabs.backlog), className: activeRoute === routeLink.projectTabs.backlog ? "active-menu-item" : "" },
        { label: "Phase", icon: "pi pi-sitemap", command: () => navigate(routeLink.projectTabs.phase), className: activeRoute === routeLink.projectTabs.phase ? "active-menu-item" : "" },
        { label: "Chatbox", icon: "pi pi-comments", command: () => navigate(routeLink.projectTabs.chatbox), className: activeRoute === routeLink.projectTabs.chatbox ? "active-menu-item" : "" },
        { label: "Meeting", icon: "pi pi-video", command: () => navigate(routeLink.projectTabs.meeting), className: activeRoute === routeLink.projectTabs.meeting ? "active-menu-item" : "" },
        { label: "Storage", icon: "pi pi-folder", command: () => navigate(routeLink.projectTabs.storage), className: activeRoute === routeLink.projectTabs.storage ? "active-menu-item" : "" },
        { label: "Collaborator", icon: "pi pi-users", command: () => navigate(routeLink.projectTabs.collaborator), className: activeRoute === routeLink.projectTabs.collaborator ? "active-menu-item" : "" },
    ];

    return (
        <NotificationProvider>
            <LoadingProvider>
                <BreadcrumbProvider>
                    <div className="project-layout-container">
                        <div className="project-layout-nav">
                            <div className="floating-container">
                                <div className="blurred-circle large"></div>
                            </div>
                            <Link to="/">
                                <img src={LogoWithName} alt="Logo" className="nav-logo"/>
                            </Link>
                            <PanelMenu model={items} className="project-custom-menu" />
                        </div>
                        <div className={`project-layout-content ${isDrawerOpen ? 'drawer-open' : ''}`}>
                            <div className="project-layout-header">
                                <Breadcrumbs />
                                <div className="project-layout-header-action">
                                    <LanguageSelector />
                                    <NotificationBell/>
                                    <div>
                                        <Avatar
                                            label={user?.name}
                                            image={user?.avatarURL}
                                            customSize={"1.6rem"}
                                            onClick={(e) => menuRef.current.toggle(e)}
                                        />
                                        <Menu model={menuItems} popup ref={menuRef} />
                                    </div>
                                </div>
                            </div>
                            <div className="project-layout-outline">
                                <Outlet context={{ openDrawer, closeDrawer, isDrawerOpen }} />
                            </div>
                        </div>
                        <Drawer
                            isOpen={isDrawerOpen}
                            title={drawerTitle}
                            content={drawerContent}
                            onClose={() => closeDrawer()}
                        />
                    </div>
                    {
                        activeRoute !== routeLink.projectTabs.chatbox &&
                        <div
                            style={{
                                position: "fixed",
                                bottom: "1.5rem",
                                right: "1.5rem",
                                backgroundImage: `url(${AssitantICon})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                borderRadius: "50%",
                                width: "3.2rem",
                                height: "3.2rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                cursor: "pointer",
                                zIndex: 1000
                            }}
                            onClick={() => setIsAssistantOpen(true)}
                        />
                    }
                    {isAssistantOpen && <AssistantChat onClose={() => setIsAssistantOpen(false)} />}
                </BreadcrumbProvider>
            </LoadingProvider>
        </NotificationProvider>
    );
};

export default ProjectLayout;
