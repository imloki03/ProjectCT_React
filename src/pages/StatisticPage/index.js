import React, {useEffect, useState} from "react";
import "./index.css"
import GanttChart from "./GanttChart";
import {useFetchProject} from "../../hooks/useFetchProject";
import {useSelector} from "react-redux";
import {getAllPhaseTask, getTaskStatistic} from "../../api/taskApi";
import TaskStatusPieChart from "./TaskStatusPieChart";
import TaskTypePieChart from "./TaskTypePieChart";
import {getAllPhases} from "../../api/phaseApi";
import BurndownChart from "./BurndownChart";
import getAllCollabsKeyValue from "../../utils/CollabUtil";
import TaskAllocationChart from "./TaskAllocationChart";
import TaskTimeAllocationChart from "./TaskTimeAllocationChart";
import DelayedTaskChart from "./DelayedTaskChart";
import {useBreadcrumb} from "../../contexts/BreadCrumbContext";
import {routeLink} from "../../router/Router";
import {useTranslation} from "react-i18next";

const StatisticPage = () => {
    const fetchProject = useFetchProject();

    const [phaseTasks, setPhaseTasks] = useState([]);
    const [taskStatus, setTaskStatus] = useState([]);
    const [phases, setPhases] = useState([]);
    const [collabs, setCollabs] = useState([]);

    const project = useSelector((state) => state.project.currentProject);
    const projectId = useSelector((state) => state.project.currentProject?.id);

    const { t } = useTranslation();
    const { setBreadcrumbs } = useBreadcrumb();

    useEffect(() => {
        const projectPath = routeLink.project.replace(":ownerUsername", project?.ownerUsername)
            .replace(":projectName", project?.name.replaceAll(" ", "_"));

        setBreadcrumbs([
            {label: project?.name, url: projectPath},
            {label: t("statPage.stat"), url: projectPath + "/" + routeLink.projectTabs.stat}
        ]);
    }, [projectId]);

    useEffect(() => {
        fetchProject();
    }, []);

    useEffect(() => {
        if (!projectId) return;
        loadData();
    }, [projectId]);

    const loadData = async () => {
        const phaseTasksList = await getAllPhaseTask(projectId);
        setPhaseTasks(phaseTasksList.data);
        const stat = await getTaskStatistic(projectId);
        setTaskStatus([
            {
                "id": t("statPage.upComing"),
                "label": t("statPage.upComing"),
                "value": stat.data.upcoming,
                "color": "#caccce"
            },
            {
                "id": t("statPage.toDo"),
                "label": t("statPage.toDo"),
                "value": stat.data.toDo,
                "color": "hsl(195,97%,53%)"
            },
            {
                "id": t("statPage.inProgress"),
                "label": t("statPage.inProgress"),
                "value": stat.data.inProgress,
                "color": "hsl(30,92%,56%)"
            },
            {
                "id": t("statPage.done"),
                "label": t("statPage.done"),
                "value": stat.data.completed,
                "color": "hsl(112,92%,53%)"
            }
        ])

        const phaseList = await getAllPhases(projectId);
        setPhases(phaseList.data);

        const cl = await getAllCollabsKeyValue(projectId);
        setCollabs(cl);
    }

    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <GanttChart phaseTaskList={phaseTasks}/>
            <div style={{display: "flex", flexDirection: "row", height: "28rem"}}>
                <TaskStatusPieChart taskStat={taskStatus}/>
                <TaskTypePieChart taskList={phaseTasks}/>
            </div>
            <BurndownChart phases={phases} taskList={phaseTasks}/>
            <div style={{display: "flex", flexDirection: "row", height: "28rem"}}>
                <TaskAllocationChart collabs={collabs} taskList={phaseTasks}/>
                <TaskTimeAllocationChart collabs={collabs} taskList={phaseTasks}/>
            </div>
            <DelayedTaskChart collabs={collabs} taskList={phaseTasks} />
        </div>
    )
}

export default StatisticPage;