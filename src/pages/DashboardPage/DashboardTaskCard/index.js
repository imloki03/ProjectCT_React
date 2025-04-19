import React, { useState } from 'react';
import "./index.css";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Paginator } from "primereact/paginator";
import { getDateAndTime } from "../../../utils/DateTimeUtil";
import taskIcon from "../../../assets/icons/dashboard_task_type_icon.png";
import storyIcon from "../../../assets/icons/dashboard_story_type_icon.png";
import bugIcon from "../../../assets/icons/dashboard_bug_type_icon.png";
import { useTranslation } from "react-i18next";

const DashboardTaskCard = ({ taskList }) => {
    const { t } = useTranslation();
    const [mode, setMode] = useState("In-progress");
    const [first, setFirst] = useState(0);
    const rows = 2;

    const modes = [
        { name: t("dashboardPage.taskCard.statusOptions.inProgress"), value: "In-progress" },
        { name: t("dashboardPage.taskCard.statusOptions.overdue"), value: "Overdue" },
    ];

    const getIconByType = (type) => {
        const normalizedType = type.toUpperCase();

        if (normalizedType === "STORY") {
            return storyIcon;
        } else if (normalizedType === "TASK") {
            return taskIcon;
        } else if (normalizedType === "BUG") {
            return bugIcon;
        }

        return taskIcon;
    };

    const filteredTasks = taskList.filter((t) => {
        const now = new Date();
        const end = new Date(t.endTime);

        if (mode === "Overdue") {
            return t.status === "IN_PROGRESS" && end < now;
        } else if (mode === "In-progress") {
            return t.status !== "DONE" && end >= now;
        }

        return false;
    });

    const currentTasks = filteredTasks.slice(first, first + rows);

    const formatTime = (start, end) => {
        const startDate = getDateAndTime(start)
        const endDate = getDateAndTime(end);

        const sameDay = startDate.date === endDate.date;

        if (!sameDay) {
            return `${startDate.date} - ${endDate.date}`
        } else {
            return `${startDate.date} - ${endDate.date} ${endDate.time}`
        }
    };

    const getTaskBackgroundStyle = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);

        // Calculate the time difference in days
        const timeDifference = end.getTime() - now.getTime();
        const daysDifference = timeDifference / (1000 * 3600 * 24);

        // For overdue tasks - use grey gradient
        if (daysDifference < 0) {
            return {
                background: 'linear-gradient(135deg, #606060, #404040, #303030)'
            };
        }

        // For tasks not yet due, create a dynamic color gradient based on due date proximity
        // Max days to consider (for full green) - adjust as needed
        const maxDays = 14;
        // Normalize the time difference to a 0-1 scale, capped at maxDays
        const normalizedTime = Math.min(daysDifference / maxDays, 1);

        // Define our color progression
        // We'll use 4 stages: green -> yellow -> orange -> red
        // Each represented by their RGB values
        const colors = [
            { r: 255, g: 0, b: 0 },      // Red (closest to deadline)
            { r: 255, g: 127, b: 0 },    // Orange
            { r: 255, g: 255, b: 0 },    // Yellow
            { r: 0, g: 180, b: 0 }       // Green (furthest from deadline)
        ];

        // Determine which segment of the color progression we're in
        const segment = normalizedTime * (colors.length - 1);
        const index = Math.min(Math.floor(segment), colors.length - 2);
        const remainder = segment - index;

        // Interpolate between the two colors that bound our current position
        const c1 = colors[index];
        const c2 = colors[index + 1];

        const r = Math.round(c1.r + remainder * (c2.r - c1.r));
        const g = Math.round(c1.g + remainder * (c2.g - c1.g));
        const b = Math.round(c1.b + remainder * (c2.b - c1.b));

        // Create the three gradient colors with varying intensity
        const primaryColor = `rgb(${r}, ${g}, ${b})`;
        const secondaryColor = `rgb(${Math.round(r * 0.85)}, ${Math.round(g * 0.85)}, ${Math.round(b * 0.85)})`;
        const tertiaryColor = `rgb(${Math.round(r * 0.7)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)})`;

        return {
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, ${tertiaryColor})`
        };
    };

    const getEmptyMessage = () => {
        if (mode === "Overdue") {
            return (
                <div className="dashboard-no-tasks positive">
                    <span role="img" aria-label="celebration">🎉</span> {t("dashboardPage.taskCard.keepUpGoodWork")}
                </div>
            );
        } else {
            return <div className="dashboard-no-tasks">{t("dashboardPage.taskCard.noTasksAvailable")}</div>;
        }
    };

    const onPageChange = (e) => {
        setFirst(e.first);
    };

    return (
        <div className={"dashboard-task-container"}>
            <div className={"dashboard-task-title"}>
                <h3>{t("dashboardPage.taskCard.title")}</h3>
                <div className={"dashboard-task-title-action"}>
                    <div className={"dashboard-dropdown-container"}>
                        <span> {t("dashboardPage.taskCard.status")}: </span>
                        <Dropdown
                            value={mode}
                            onChange={(e) => {
                                setMode(e.value);
                                setFirst(0);
                            }}
                            options={modes}
                            optionLabel="name"
                            checkmark
                            highlightOnSelect={false}
                            className={"dashboard-dropdown"}
                        />
                    </div>
                    {/*<Button className={"dashboard-see-more"} label={"More ->"} />*/}
                </div>
            </div>

            <div className={"dashboard-task-content"}>
                <div className={"dashboard-task-item-container"}>
                    {currentTasks.length > 0 ? (
                        currentTasks.map((t, index) => (
                            <div
                                className={"dashboard-task-item"}
                                key={index}
                                style={getTaskBackgroundStyle(t.endTime)}
                            >
                                <div className={"dashboard-task-item-icon-container"}>
                                    <img
                                        src={getIconByType(t.type)}
                                        // alt={`${t.type} ${t("dashboardPage.taskCard.icon")}`}
                                        className="dashboard-task-type-icon"
                                    />
                                </div>
                                <div className={"dashboard-task-item-content"}>
                                    <strong>{t.name.toUpperCase()}</strong>
                                    <div>{t.type} • {formatTime(t.startTime, t.endTime)}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        getEmptyMessage()
                    )}
                </div>
            </div>

            <Paginator
                first={first}
                rows={rows}
                totalRecords={filteredTasks.length}
                onPageChange={onPageChange}
                pageLinkSize={3}
            />
        </div>
    );
};

export default DashboardTaskCard;