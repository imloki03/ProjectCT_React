import {Link, Outlet, useNavigate} from "react-router-dom";
import "./index.css"
import {LoadingProvider} from "../../contexts/LoadingContext";
import {NotificationProvider, useNotification} from "../../contexts/NotificationContext";
import LogoWithName from "../../assets/images/logo_with_name.png";
import {PanelMenu} from "primereact/panelmenu";
import {Badge} from "primereact/badge";
import Avatar from "../../components/Avatar";
import {BreadcrumbProvider, Breadcrumbs} from "../../contexts/BreadCrumbContext";
import {useEffect, useMemo, useRef, useState} from "react";
import {Menu} from "primereact/menu";
import {getAllProjects} from "../../api/projectApi";
import {useTranslation} from "react-i18next";
import {routeLink} from "../../router/Router";
import {useDispatch, useSelector} from "react-redux";
import {logout} from "../../redux/slices/userSlice";
import {getAssignedTasks} from "../../api/taskApi";
import AssitantICon from "../../assets/icons/assistant_icon.png"
import AssistantChat from "../../components/AssistantChat";
import LanguageSelector from "../../components/LanguageSelector";
import UpdateOAuth from "../../components/UpdateOAuth";

const WorkspaceLayout = () => {
    const menuRef = useRef(null);
    const [projects, setProjects] = useState([]);
    const [rawTaskData, setRawTaskData] = useState([]);
    // const [dueTaskList, setDueTaskList] = useState();
    const [overdueTaskList, setOverdueTaskList] = useState();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isAssistantOpen, setIsAssistantOpen] = useState(false);

    const user = useSelector((state) => state.user.currentUser);
    const updated = useSelector((state) => state.user.oAuthUpdated);

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
            <small
                className="pl-4"
                style={{ color: item.dl && new Date(item.dl) < new Date() ? "red" : "inherit" }}
            >
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

    const overDueTasks = [
        {
            label: t("workspaceLayout.overdueTasks"),
            icon: 'pi pi-calendar-clock',
            template: itemRenderer,
            expanded: true,
            items: [],
        }
    ];

    const getAssignedTaskList = async () => {
        try {
            const response = await getAssignedTasks();
            setRawTaskData(response.data);
        } catch (e) {
            console.log(e);
        }
    }

    const dueTaskList = useMemo(() => ([
        {
            label: t("workspaceLayout.dueTasks"),
            icon: 'pi pi-calendar',
            template: itemRenderer,
            expanded: true,
            items: rawTaskData.map(project => ({
                label: project.project.name,
                img: project.project.avatarURL,
                template: projectTaskRenderer,
                expanded: true,
                items: project.taskList
                    .filter(task => !task.parentTaskId)
                    .map(task => ({
                        label: task.name,
                        icon: 'pi pi-angle-right',
                        dl: task.endTime,
                        projectName: project.project.name,
                        owner: project.project.ownerUsername,
                        phaseId: task.phaseId,
                        command: () => {
                            navigate(routeLink.project.replace(":ownerUsername", project.project.ownerUsername)
                                    .replace(":projectName", project.project.name.replaceAll(" ", "_"))
                                + "/phase/" + task.phaseId
                            );
                        },
                        template: taskRenderer
                    }))
            }))
        }
    ]), [rawTaskData, t]);

    const getProjectList = async () => {
        try {
            const response = await getAllProjects();
            if (JSON.stringify(response.data) !== JSON.stringify(projects)) {
                setProjects(response.data);
            }
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        getAssignedTaskList();
        getProjectList();
    }, []);

    const projectList = useMemo(() => [
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
                command: () => {
                    navigate(routeLink.project.replace(":ownerUsername", project.ownerUsername)
                            .replace(":projectName", project.name.replaceAll(" ", "_")));
                },
                expanded: true,
            })),
        }
    ],[projects, t]);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem("token");
        navigate(routeLink.default)
    }

    const menuItems = [
        { label: t("workspaceLayout.editProfile"), icon: "pi pi-user-edit", command: () => navigate(routeLink.profile) },
        { label: t("workspaceLayout.logout"), icon: "pi pi-sign-out", command: () => handleLogout() }
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

                            <PanelMenu model={dueTaskList} className="workspace-custom-menu" />
                            {/*<PanelMenu model={overdueTaskList} className="workspace-custom-menu" />*/}
                            <PanelMenu model={projectList} className="workspace-custom-menu" />
                        </div>
                        <div className="workspace-layout-content">
                            <div className="workspace-layout-header">
                                <Breadcrumbs/>
                                <div className="workspace-layout-header-action">
                                    <LanguageSelector/>
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
                            <div className="workspace-layout-outline">
                                <Outlet/>
                            </div>
                        </div>
                    </div>
                    <div style={{
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
                        onClick={()=>setIsAssistantOpen(true)}
                    >
                    </div>
                    {isAssistantOpen && <AssistantChat onClose={() => setIsAssistantOpen(false)}/>}
                    {!updated && <UpdateOAuth/>}
                </BreadcrumbProvider>
            </LoadingProvider>
        </NotificationProvider>
    );
};

export default WorkspaceLayout;
