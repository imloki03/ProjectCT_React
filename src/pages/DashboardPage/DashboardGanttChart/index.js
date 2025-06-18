import React, {useEffect, useRef, useState} from 'react';
import "./index.css"
import {ResponsivePie} from "@nivo/pie";
import DateTimePicker from "../../../components/DateTimePicker";
import {useTranslation} from "react-i18next";
import {Dropdown} from "primereact/dropdown";
import {useSelector} from "react-redux";
import getAllPhasesKeyValue from "../../../utils/PhaseUtil";
import Gantt from "frappe-gantt";
import ReactDOMServer from "react-dom/server";
import {savedLanguage} from "../../../config/i18n";
import {Badge} from "primereact/badge";
import {getStatusBadgeColor, getStatusDetails} from "../../PhasePage/PhaseCard";
import {getAllCollabOfProject} from "../../../api/collabApi";

const DashboardGantt = ({phaseTaskList}) => {
    const ganttRef = useRef(null);
    const ganttInstance = useRef(null);

    const [taskList, setTaskList] = useState([]);
    const [ganttTasks, setGanttTasks] = useState([]);

    const [collabs, setCollabs] = useState([]);
    const [phases, setPhases] = useState([]);
    const [currentPhase, setCurrentPhase] = useState(-1)

    const { t } = useTranslation();

    const [startDateFilter, setStartDateFilter] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 12);
        return date;
    });
    const [endDateFilter, setEndDateFilter] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 2);
        return date;
    });

    const projectId = useSelector((state) => state.project.currentProject?.id);

    function sortTasksByStartTime(tasks) {
        const taskMap = new Map();
        tasks.forEach(task => {
            const parentId = task.parentTaskId || null;
            if (!taskMap.has(parentId)) taskMap.set(parentId, []);
            taskMap.get(parentId).push(task);
        });

        taskMap.forEach(taskList => {
            taskList.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        });

        function buildSortedList(parentId = null) {
            const sortedList = [];
            if (taskMap.has(parentId)) {
                for (const task of taskMap.get(parentId)) {
                    sortedList.push(task);
                    sortedList.push(...buildSortedList(task.id)); // Đệ quy thêm task con
                }
            }
            return sortedList;
        }

        return buildSortedList();
    }

    const loadTaskList = async () => {
        try {
            // const response = await getAllPhaseTask(projectId);
            const sortedTasks = sortTasksByStartTime(phaseTaskList);
            const mappedTask = sortedTasks.map((task) => ({
                id: String(task.id),
                name: task.name,
                start: task.startTime.split("T")[0],
                end: task.endTime.split("T")[0],
                description: task.description,
                status: task.status,
                assignee: task.assigneeId,
                phase: task.phaseId,
                dependencies: task.parentTaskId ? String(task.parentTaskId) : "",
            }));

            setTaskList(mappedTask);
            setGanttTasks(mappedTask.filter((task) =>
                (new Date(task.start) >= startDateFilter
                    && new Date(task.start) <= endDateFilter)
                || (new Date(task.end) >= startDateFilter
                    && new Date(task.end) <= endDateFilter)));
        } catch (error){
            console.log(error);
        }
    }

    const loadCollaborators = async () => {
        try {
            const response = await getAllCollabOfProject(projectId);
            const treeData = response.data.map((item) => ({
                key: item.id.toString(),
                data: {
                    id: item.id,
                    userId: item.userId,
                    username: item.user.username,
                    name: item.user.name,
                    avatarURL: item.user.avatarURL,
                    role: item.role.id
                },
                children: []
            }));
            setCollabs(treeData);
        } catch (error) {
            console.error('Failed to fetch collaborators:', error);
        }
    };

    const loadPhases = async () => {
        const allPhases = await getAllPhasesKeyValue(projectId);
        setPhases([{
            label: t("statPage.all"),
            value: -1
        }, ...allPhases]);
    }

    useEffect(() => {
        loadTaskList();
    }, [phaseTaskList]);

    useEffect(() => {
        if (!projectId) return;
        loadPhases();
        loadCollaborators();
    }, [projectId]);

    useEffect(() => {
        const phaseFilterTasks = taskList.filter((task) => currentPhase === -1 || task.phase === currentPhase);
        const dateFilterTasks = phaseFilterTasks.filter(
            (task) => (new Date(task.start) >= startDateFilter
                    && new Date(task.start) <= endDateFilter)
                || (new Date(task.end) >= startDateFilter
                    && new Date(task.end) <= endDateFilter));
        setGanttTasks(dateFilterTasks);
    }, [currentPhase, startDateFilter, endDateFilter]);

    const FIXED_TASK_COUNT = 5;
    const getFixedHeightTasks = (tasks) => {
        if (tasks.length >= FIXED_TASK_COUNT) {
            return tasks;
        }

        const spacersNeeded = FIXED_TASK_COUNT - tasks.length;
        const spacerTasks = Array.from({ length: spacersNeeded }, (_, i) => {
            const today = new Date();
            return {
                id: `spacer-${i}`,
                name: " ",
                start: today.toISOString().split("T")[0],
                end: today.toISOString().split("T")[0],
                progress: 0,
                custom_class: 'invisible-task',
                dependencies: ""
            };
        });

        return [...tasks, ...spacerTasks];
    };

    useEffect(() => {
        if (ganttRef.current && ganttTasks.length >= 0 && collabs.length >0) {
            if (ganttInstance.current) {
                ganttRef.current.innerHTML = "";
            }

            const containerWidth = ganttRef.current.offsetWidth;
            const tasksWithSpacers = getFixedHeightTasks(ganttTasks);

            ganttInstance.current = new Gantt(ganttRef.current, tasksWithSpacers, {
                on_click: (task) => {},
                on_date_change: (task, start, end) =>
                    console.log(`Task ${task.name} changed: ${start} to ${end}`),
                popup: ({ task, set_title, set_subtitle, set_details }) => {
                    set_title(`<strong>${task.name}</strong>`);
                    set_subtitle(`<p>${task.description}</p>`);
                    const detailsHtml = ReactDOMServer.renderToString(<TaskPopup task={task} />);
                    set_details(detailsHtml);
                },
                view_mode: "Day",
                scroll_to: startDateFilter,
                language: savedLanguage,
                width: containerWidth,
            });
        }
    }, [ganttTasks, collabs, t]);

    const TaskPopup = ({ task }) => {
        return (
            <div>
                <Badge value={getStatusDetails(task.status)} style={{ backgroundColor: getStatusBadgeColor(task.status), color: "white", borderRadius: "0.5rem", padding: "3px" }} />
                <p><strong>{collabs.find(item => item.data.id === task.assignee)?.data?.name}</strong></p>
                <p>{t("dashboardPage.ganttChart.startDate")}: {task.start}</p>
                <p>{t("dashboardPage.ganttChart.endDate")}: {task.end}</p>
            </div>
        );
    };

    return (
        <div className="dashboard-gantt-container">
            <div className="dashboard-gantt-title">
                <h3>{t("dashboardPage.ganttChart.title")}</h3>
                <div className={"dashboard-gantt-title-actions"}>
                    <div className="dash-board-datetime-wrapper">
                        <DateTimePicker
                            label={t("dashboardPage.ganttChart.from")}
                            value={startDateFilter}
                            onChange={(e) => setStartDateFilter(e.target.value)}
                        />
                    </div>
                    <div className="dash-board-datetime-wrapper">
                        <DateTimePicker
                            label={t("dashboardPage.ganttChart.to")}
                            value={endDateFilter}
                            onChange={(e) => {setEndDateFilter(e.target.value)}}
                        />
                    </div>
                    <div className={"dashboard-dropdown-container"}>
                        <span>{t("dashboardPage.ganttChart.phase")}: </span>
                        <Dropdown
                            value={currentPhase}
                            selected={currentPhase}
                            options={phases}
                            onChange={(value)=>{setCurrentPhase(value.value)}}
                            className={"dashboard-dropdown"}
                        />
                    </div>
                </div>
            </div>
            <div className="dashboard-gantt-content" ref={ganttRef} style={{ height: '21rem', overflowY: 'auto' }}>
            </div>
        </div>
    );
};

export default DashboardGantt;