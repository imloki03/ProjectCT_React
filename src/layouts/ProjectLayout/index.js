import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import "./index.css"
import {LoadingProvider} from "../../contexts/LoadingContext";
import {NotificationProvider, useNotification} from "../../contexts/NotificationContext";
import LogoWithName from "../../assets/images/logo_with_name.png";
import {PanelMenu} from "primereact/panelmenu";
import {Badge} from "primereact/badge";
import Avatar from "../../components/Avatar";
import {BreadcrumbProvider, Breadcrumbs} from "../../contexts/BreadCrumbContext";
import {useEffect, useRef, useState} from "react";
import {Menu} from "primereact/menu";
import {getAllProjects} from "../../api/projectApi";
import {useTranslation} from "react-i18next";
import {logout} from "../../redux/slices/userSlice";
import {routeLink} from "../../router/Router";
import {useDispatch, useSelector} from "react-redux";

const ProjectLayout = () => {
    const menuRef = useRef(null);
    const location = useLocation();
    const [projects, setProjects] = useState([]);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const user = useSelector((state) => state.user.currentUser);

    const pathSegments = location.pathname.split("/");
    const activeRoute = pathSegments.length > 2 ? pathSegments[3] : "";

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem("token");
        navigate(routeLink.default)
    }

    const menuItems = [
        { label: t("workspaceLayout.editProfile"), icon: "pi pi-user-edit", command: () => navigate(routeLink.profile) },
        { label: t("workspaceLayout.logout"), icon: "pi pi-sign-out", command: () => handleLogout() }
    ];

    const items = [
        { label: "Dashboard", icon: "pi pi-th-large", command: () => navigate(routeLink.projectTabs.dashboard), className: activeRoute === routeLink.projectTabs.dashboard ? "active-menu-item" : "" },
        { label: "Statistic", icon: "pi pi-chart-bar", command: () => navigate(routeLink.projectTabs.stat), className: activeRoute === routeLink.projectTabs.stat ? "active-menu-item" : "" },
        { label: "Backlog", icon: "pi pi-list", command: () => navigate(routeLink.projectTabs.backlog), className: activeRoute === routeLink.projectTabs.backlog ? "active-menu-item" : "" },
        { label: "Phase", icon: "pi pi-sitemap", command: () => navigate(routeLink.projectTabs.phase), className: activeRoute === routeLink.projectTabs.phase ? "active-menu-item" : "" },
        { label: "Chatbox", icon: "pi pi-comments", command: () => navigate(routeLink.projectTabs.chatbox), className: activeRoute === routeLink.projectTabs.chatbox ? "active-menu-item" : "" },
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
                        <div className="project-layout-content">
                            <div className="project-layout-header">
                                <Breadcrumbs/>
                                <div className="project-layout-header-action">
                                    <i className="pi pi-bell" style={{ fontSize: '1.3rem' }}></i>
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
                                <Outlet/>
                            </div>
                        </div>
                    </div>
                </BreadcrumbProvider>
            </LoadingProvider>
        </NotificationProvider>
    );
};

export default ProjectLayout;
