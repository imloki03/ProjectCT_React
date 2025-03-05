import {Link, Outlet} from "react-router-dom";
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

const WorkspaceLayout = () => {
    const menuRef = useRef(null);
    const [projects, setProjects] = useState([]);
    const { t } = useTranslation();

    const itemRenderer = (item, options) => (
        <a className="flex align-items-center cursor-pointer workspace-custom-menu-item" onClick={options.onClick}>
            {item.icon && <span className={`${item.icon} text-primary`} />}
            <span className={`mx-2 ${item.items && 'font-semibold'}`}>{item.label}</span>
        </a>
    );

    const projectTaskRenderer = (item, options) => (
        <a className="flex align-items-center cursor-pointer workspace-custom-menu-item" onClick={options.onClick}>
            <Avatar
                label={item.label}
                image={item.img}
                customSize={"1.3rem"}
            />
            <span className={`mx-2 ${item.items && 'font-semibold'}`}
                  style={{color: "#c9b2c9"}}
            >
                {item.label}
            </span>
        </a>
    );

    const taskRenderer = (item, options) => (
        <a className=" flex flex-column cursor-pointer workspace-custom-menu-item ml-0"
           onClick={options.onClick}
           style={{color: "#b6b6b6"}}
        >
            <div className=" flex flex-row ">
                {item.icon && <span className={`${item.icon} text-primary`} />}
                <span className={`mx-2 ${item.items && 'font-semibold'}`}>{item.label}</span>
            </div>
            <small className="pl-4">
                {t("workspaceLayout.to")}: {" "}
                {item.dl
                    ? new Date(item.dl).toLocaleString("en-GB", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    })
                    : "Not provided"}
            </small>
        </a>
    );

    const projectRenderer = (item, options) => (
        <a className="flex align-items-center cursor-pointer workspace-custom-menu-item" onClick={options.onClick}>
            <Avatar
                label={item.label}
                image={item.img}
                customSize={"1.4rem"}
            />
            <span className={`mx-2 ${item.items && 'font-semibold'}`}
                  style={{color: "#d2c5d2"}}
            >
                <strong>{item.owner}</strong>/{item.label}
            </span>
        </a>
    );

    const dueTasks = [
        {
            label: t("workspaceLayout.dueTasks"),
            icon: 'pi pi-calendar',
            template: itemRenderer,
            expanded: true,
            items: [
                {
                    label: 'Project Name',
                    img: "https://img.myloview.com/posters/project-icon-700-183025333.jpg",
                    template: projectTaskRenderer,
                    expanded: true,
                    items: [
                        {
                            label: 'Task name 1',
                            icon: 'pi pi-angle-right',
                            dl: "2025-02-18 15:24:54.025444",
                            template: taskRenderer,
                        },
                        {
                            label: 'Task name 2',
                            icon: 'pi pi-angle-right',
                            dl: "2025-02-18 15:24:54.025444",
                            template: taskRenderer,
                        }
                    ]
                },
                {
                    label: 'Inbox',
                    template: projectTaskRenderer,
                    expanded: true,
                    items: [
                        {
                            label: 'Task name 1',
                            icon: 'pi pi-angle-right',
                            dl: "2025-02-18 15:24:54.025444",
                            template: taskRenderer,
                        }
                    ]
                }
            ]
        }
    ];

    const overDueTasks = [
        {
            label: t("workspaceLayout.overdueTasks"),
            icon: 'pi pi-calendar-clock',
            template: itemRenderer,
            expanded: true,
            items: [
                {
                    label: 'Project Name',
                    img: "https://img.myloview.com/posters/project-icon-700-183025333.jpg",
                    template: projectTaskRenderer,
                    expanded: true,
                    items: [
                        {
                            label: 'Task name 1',
                            icon: 'pi pi-angle-right',
                            dl: "2025-02-18 15:24:54.025444",
                            template: taskRenderer,
                        },
                        {
                            label: 'Task name 2',
                            icon: 'pi pi-angle-right',
                            dl: "2025-02-18 15:24:54.025444",
                            template: taskRenderer,
                        }
                    ]
                },
                {
                    label: 'Inbox',
                    template: projectTaskRenderer,
                    expanded: true,
                    items: [
                        {
                            label: 'Task name 1',
                            icon: 'pi pi-angle-right',
                            dl: "2025-02-18 15:24:54.025444",
                            template: taskRenderer,
                        }
                    ]
                }
            ]
        }
    ];

    const getProjectList = async () => {
        try {
            const projects = await getAllProjects();
            console.log(projects)
            setProjects(projects.data);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        getProjectList();
    }, []);

    const projectList = [
        {
            label: t("workspaceLayout.yourProjects"),
            icon: 'pi pi-folder-open',
            template: itemRenderer,
            expanded: true,
            items: projects.map((project) => ({
                label: project.name,
                owner: project.ownerUsername,
                img: project.avatarURL,
                template: projectRenderer,
                expanded: true,
            })),
        }
    ];

    const menuItems = [
        { label: t("workspaceLayout.editProfile"), icon: "pi pi-user-edit", command: () => console.log("Edit Profile") },
        { label: t("workspaceLayout.logout"), icon: "pi pi-sign-out", command: () => console.log("Logging out...") }
    ];

    return (
        <NotificationProvider>
            <LoadingProvider>
                <BreadcrumbProvider>
                    <div className="workspace-layout-container">
                        <div className="workspace-layout-nav">
                            <div className="floating-container">
                                <div className="blurred-circle large"></div>
                            </div>
                            <Link to="/">
                                <img src={LogoWithName} alt="Logo" className="nav-logo"/>
                            </Link>

                            <PanelMenu model={dueTasks} className="workspace-custom-menu" />
                            <PanelMenu model={overDueTasks} className="workspace-custom-menu" />
                            <PanelMenu model={projectList} className="workspace-custom-menu" />
                        </div>
                        <div className="workspace-layout-content">
                            <div className="workspace-layout-header">
                                <Breadcrumbs/>
                                <div className="workspace-layout-header-action">
                                    <i className="pi pi-bell" style={{ fontSize: '1.3rem' }}></i>
                                    <div>
                                        <Avatar
                                            label="Loki"
                                            customSize={"1.6rem"}
                                            onClick={(e) => menuRef.current.toggle(e)}
                                        />
                                        <Menu model={menuItems} popup ref={menuRef} />
                                    </div>
                                </div>
                            </div>
                            <div className="workspace-layout-outline">
                                <Outlet/>
                            </div>
                        </div>
                    </div>
                </BreadcrumbProvider>
            </LoadingProvider>
        </NotificationProvider>
    );
};

export default WorkspaceLayout;
