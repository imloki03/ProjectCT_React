import React, {useEffect, useRef, useState} from "react";
import ReactDOMServer from "react-dom/server";
import "./index.css"
import {getAllPhaseTask} from "../../../api/taskApi";
import {useSelector} from "react-redux";
import Gantt from "frappe-gantt";
import {savedLanguage} from "../../../config/i18n";
import {Badge} from "primereact/badge";
import {getStatusBadgeColor, getStatusDetails} from "../../PhasePage/PhaseCard";
import BasicButton from "../../../components/Button";
import DropDownField from "../../../components/DropDownField";
import {getAllPhases} from "../../../api/phaseApi";
import getAllPhasesKeyValue, {sortPhaseByStartDate} from "../../../utils/PhaseUtil";
import {taskType} from "../../../constants/TaskType";
import DateTimePicker from "../../../components/DateTimePicker";
import {useTranslation} from "react-i18next";

const GanttChart = ({ phaseTaskList }) => {
    const ganttRef = useRef(null);
    const ganttInstance = useRef(null);

    const [taskList, setTaskList] = useState([]);
    const [ganttTasks, setGanttTasks] = useState([]);

    const [phases, setPhases] = useState([]);
    const [currentPhase, setCurrentPhase] = useState(-1)

    const { t } = useTranslation();

    const [startDateFilter, setStartDateFilter] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date;
    });
    const [endDateFilter, setEndDateFilter] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
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

    useEffect(() => {
        if (ganttRef.current && ganttTasks.length >= 0) {
            if (ganttInstance.current) {
                ganttRef.current.innerHTML = "";
            }

            ganttInstance.current = new Gantt(ganttRef.current, ganttTasks, {
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
            });
        }
    }, [ganttTasks, t]);

    const TaskPopup = ({ task }) => {
        return (
            <div>
                <Badge value={getStatusDetails(task.status)} style={{ backgroundColor: getStatusBadgeColor(task.status), color: "white", borderRadius: "0.5rem", padding: "3px" }} />
                <p>{t("statPage.startDate")}: {task.start}</p>
                <p>{t("statPage.endDate")}: {task.end}</p>
            </div>
        );
    };
    
    return (
        <div className="pb-2">
            <div className="gantt-chart-filter">
                <DropDownField
                    label={t("statPage.phaseFilter")}
                    selected={currentPhase}
                    options={phases}
                    onChange={(value)=>{setCurrentPhase(value.value)}}
                    style={{width: "30%"}}
                />
                <div className="gantt-date-filter">
                    <DateTimePicker
                        label={t("statPage.from")}
                        value={startDateFilter}
                        onChange={(e) => {
                            setStartDateFilter(e.target.value)
                        }}
                    />
                    <DateTimePicker
                        label={t("statPage.to")}
                        value={endDateFilter}
                        onChange={(e) => {
                            setEndDateFilter(e.target.value)
                        }}
                    />
                </div>
            </div>
            <div ref={ganttRef}></div>
        </div>
    )
}

export default GanttChart;