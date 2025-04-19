import React, {useEffect, useState} from 'react';
import './index.css'
import {ProgressBar} from "primereact/progressbar";
import {useFetchProject} from "../../hooks/useFetchProject";
import {useSelector} from "react-redux";
import {getAllProjects} from "../../api/projectApi";
import {getAllCollabOfProject} from "../../api/collabApi";
import { AvatarGroup } from 'primereact/avatargroup';
import Avatar from "../../components/Avatar";
import {useBreadcrumb} from "../../contexts/BreadCrumbContext";
import {routeLink} from "../../router/Router";
import {Avatar as PrimeAvatar} from "primereact/avatar";
import {Tooltip} from "primereact/tooltip";
import BarProgress from "../../components/BarProgress";
import {getAllPhaseTask, getTasksInBacklog, getTasksInPhase, getTaskStatistic} from "../../api/taskApi";
import {getAllPhases} from "../../api/phaseApi";
import getAllCollabsKeyValue from "../../utils/CollabUtil";
import DashboardProjectCard from "./DashboardProjectCard";
import DashboardCollabAndTaskStatus from "./DashboardCollabAndTaskStatus";
import DashboardTaskCard from "./DashboardTaskCard";
import DashboardPriorityCard from "./DashboardPriorityCard";
import DashboardGantt from "./DashboardGanttChart";
import DashboardProgress from "./DashboardProgressCard";
import DashboardProgressCard from "./DashboardProgressCard";
import DashboardTaskTimeAllocation from "./DashboardTaskTimeAllocation";
import {Dropdown} from "primereact/dropdown";
import { useTranslation } from 'react-i18next'; // Import the translation hook

const DashboardPage = () => {
    const { t } = useTranslation(); // Initialize the translation hook
    const fetchProject = useFetchProject();
    const project = useSelector((state) => state.project.currentProject);
    const user = useSelector((state) => state.user.currentUser);
    const projectId = project?.id;
    const [collaborators, setCollaborators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [phaseTasks, setPhaseTasks] = useState([]);
    const [allTasksInProject, setAllTasksInProject] = useState([]);
    const [rawTaskStatus, setRawTaskStatus] = useState([]);
    const [phases, setPhases] = useState([]);
    const { setBreadcrumbs } = useBreadcrumb();

    const fetchAllProjectData = async () => {
        setLoading(true);
        try {
            const [projectCollabs, phaseTasksList, stat, phaseList, backlogTasks] = await Promise.all([
                getAllCollabOfProject(project.id),
                getAllPhaseTask(projectId),
                getTaskStatistic(projectId),
                getAllPhases(projectId),
            ]);

            setCollaborators(projectCollabs.data);
            setPhaseTasks(phaseTasksList.data);
            setRawTaskStatus(stat.data);
            setPhases(phaseList.data);
        } catch (error) {
            console.error(t('dashboardPage.errors.fetchProjectData'), error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, []);

    useEffect(() => {
        if (project && user) {
            fetchAllProjectData();

            const projectPath = routeLink.project
                .replace(":ownerUsername", project?.ownerUsername)
                .replace(":projectName", project?.name.replaceAll(" ", "_"));

            setBreadcrumbs([
                { label: project?.name, url: projectPath },
                { label: "Dashboard", url: `${projectPath}/${routeLink.projectTabs.dashboard}` }
            ]);
        }
    }, [project]);
    const [selectedCollabId, setSelectedCollabId] = useState(null);
    const collaboratorOptions = collaborators.map(collab => ({
        label: collab.user.name,
        value: collab
    }));
    useEffect(() => {
        if (user && collaborators.length > 0 && !selectedCollabId) {
            const currentUserCollab = collaborators.find(c => c.userId === user.id);
            if (currentUserCollab) {
                setSelectedCollabId(currentUserCollab);
            }
        }
    }, [user, collaborators]);

    //process
    const activeCollabId = selectedCollabId?.id || collaborators.find(c => c.userId === user.id)?.id;

    const sortedTask = [...phaseTasks]
        .sort((a, b) => new Date(a.endTime) - new Date(b.endTime))
        .filter(t => t.assigneeId === activeCollabId);

    const sortedTaskGantt = [...phaseTasks]
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .filter(t => t.assigneeId === activeCollabId);

    return (
        loading ? <BarProgress/> : (
            <div className={"dashboard-container"}>
                <div className={"dashboard-welcome"}>
                    <div className={"dashboard-welcome-avatar"}>
                        <Avatar label={project?.name} image={project?.avatarURL} shape={"square"} customSize={"7rem"}/>
                    </div>
                    <div className={"dashboard-welcome-content"}>
                        <h1>{t('dashboardPage.welcome', { name: user.name })}</h1>
                        <div className={"dashboard-welcome-sub-content"}>
                            {!user.username === project.ownerUsername ?
                                <div>{t('dashboardPage.ownerMotivation')}</div> :
                                <div>{t('dashboardPage.collaboratorMessage')}</div>
                            }
                            {user.username === project.ownerUsername &&
                                <div>
                                    <Dropdown
                                        value={selectedCollabId}
                                        options={collaboratorOptions}
                                        onChange={(e) => setSelectedCollabId(e.value)}
                                        placeholder={t('dashboardPage.dropdown.placeholder')}
                                        optionLabel="label"
                                        className="dashboard-dropdown"
                                    />
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className={"dashboard-first-row"}>
                    <DashboardProjectCard project={project} collaborators={collaborators}
                                          rawTaskStatus={rawTaskStatus} phases={phases}  user={selectedCollabId?.user || user}/>
                    <DashboardCollabAndTaskStatus  collaborators={collaborators} rawTaskStatus={rawTaskStatus}/>
                </div>
                <div className={"dashboard-second-row"}>
                    <div className={"dashboard-second-row-big-card"}>
                        <DashboardGantt phaseTaskList={sortedTaskGantt}/>
                    </div>
                    <div className={"dashboard-second-row-small-card"}>
                        <DashboardProgressCard taskList={phaseTasks} collaborators={collaborators} currentUser={selectedCollabId?.user || user}
                                               project={project}/>
                    </div>
                </div>
                <div className={"dashboard-third-row"}>
                    <div className={"dashboard-third-row-card"}>
                        <DashboardTaskCard taskList={sortedTask}/>
                    </div>
                    <div className={"dashboard-third-row-card"}>
                        <DashboardPriorityCard taskList={sortedTask}/>
                    </div>
                    <div className={"dashboard-third-row-card"}>
                        <DashboardTaskTimeAllocation taskList={sortedTaskGantt} phaseList={phases}/>
                    </div>
                </div>
            </div>
        )
    );
};

export default DashboardPage;