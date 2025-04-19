import React, { useState, useMemo } from 'react';
import { ResponsiveLine } from '@nivo/line';
import './index.css';
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from "react-i18next";

const DashboardProgressCard = ({ taskList, collaborators, currentUser, project }) => {
    const { t } = useTranslation();

    const [mode, setMode] = useState("You");
    const modes = [
        { name: t("dashboardPage.progressCard.viewOptions.you"), value: "You" },
        { name: t("dashboardPage.progressCard.viewOptions.allCollaborators"), value: "All collaborators" },
    ];

    const chartData = useMemo(() => {
        const dates = [];

        const today = new Date();
        let current = new Date(project.createdDate);

        while (current <= today) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }

        const userTaskCountMap = {};

        if (taskList && taskList.length) {
            taskList.forEach(task => {
                if (task.doneTime) {
                    const doneDate = new Date(task.doneTime).toISOString().split('T')[0];

                    if (!userTaskCountMap[task.assigneeId]) {
                        userTaskCountMap[task.assigneeId] = {};
                    }

                    if (!userTaskCountMap[task.assigneeId][doneDate]) {
                        userTaskCountMap[task.assigneeId][doneDate] = 1;
                    } else {
                        userTaskCountMap[task.assigneeId][doneDate] += 1;
                    }
                }
            });
        }

        const userNames = {};
        if (collaborators && collaborators.length) {
            collaborators.forEach(user => {
                const userId = user.id || user.userId;
                userNames[userId] = user.user?.name || `${t("dashboardPage.progressCard.user")} ${userId}`;
            });
        }

        const allCollaboratorsData = [];

        if (currentUser && !userNames[currentUser.id]) {
            userNames[currentUser.id] = currentUser.name || `${t("dashboardPage.progressCard.user")} ${currentUser.id}`;
        }

        Object.keys(userNames).forEach(userId => {
            const userData = dates.map(date => {
                return {
                    x: date,
                    y: (userTaskCountMap[userId] && userTaskCountMap[userId][date]) || 0
                };
            });

            allCollaboratorsData.push({
                id: userNames[userId],
                data: userData
            });
        });
        const currentUserCollabId = collaborators.find((c) => c.userId === currentUser.id).id
        const currentUserData = allCollaboratorsData.filter(
            series => series.id === (userNames[currentUserCollabId] || `${t("dashboardPage.progressCard.user")} ${currentUser.id}`)
        );

        return {
            allCollaborators: allCollaboratorsData,
            currentUser: currentUserData.length ? currentUserData : [{
                id: userNames[currentUserCollabId] || `${t("dashboardPage.progressCard.user")} ${currentUser.id}`,
                data: dates.map(date => ({ x: date, y: 0 }))
            }],
            dates: dates
        };
    }, [taskList, collaborators, currentUser, t]);

    const dates = chartData.dates || [];
    const displayData = mode === "You" ? chartData.currentUser : chartData.allCollaborators;

    return (
        <div className="dashboard-progress-container">
            <div className="dashboard-progress-title">
                <h3>{t("dashboardPage.progressCard.title")}</h3>
                <div className="dashboard-progress-title-actions">
                    <div className="dashboard-dropdown-container">
                        <span>{t("dashboardPage.progressCard.view")}: </span>
                        <Dropdown
                            value={mode}
                            onChange={(e) => {
                                setMode(e.value);
                            }}
                            options={modes}
                            optionLabel="name"
                            checkmark
                            highlightOnSelect={false}
                            className="dashboard-dropdown"
                        />
                    </div>
                </div>
            </div>

            <div className="dashboard-progress-content" style={{ height: '340px', width: '34rem', overflowX: 'auto', overflowY: 'hidden' }}>
                <div style={{ width: `${Math.max(dates.length * 60, 600)}px`, height: '100%' }}>
                    <ResponsiveLine
                        data={displayData}
                        margin={{ top: 40, right: 80, bottom: 60, left: 80 }}
                        xScale={{
                            type: 'point',
                            padding: 0.5
                        }}
                        yScale={{
                            type: 'linear',
                            min: 0,
                            max: 'auto',
                            stacked: false
                        }}
                        curve="monotoneX"
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: t("dashboardPage.progressCard.date"),
                            legendPosition: 'middle',
                            legendOffset: 36,
                            format: (value) => {
                                const date = new Date(value);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: t("dashboardPage.progressCard.tasksCompleted"),
                            legendPosition: 'middle',
                            legendOffset: -50,
                            tickValues: 'every 1'
                        }}
                        colors={{ scheme: 'set2' }}
                        pointSize={6}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        pointLabelYOffset={-12}
                        enableArea={true}
                        areaOpacity={0.1}
                        useMesh={true}
                        lineWidth={3}
                        enableSlices="x"
                        sliceTooltip={({ slice }) => {
                            return (
                                <div style={{
                                    background: 'white',
                                    padding: '9px 12px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <strong>{t("dashboardPage.progressCard.date")}: {new Date(slice.points[0].data.x).toLocaleDateString()}</strong>
                                    <div style={{ marginTop: '8px' }}>
                                        {slice.points.map(point => (
                                            <div key={point.serieId} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '4px'
                                            }}>
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    backgroundColor: point.serieColor,
                                                    marginRight: '8px',
                                                    borderRadius: '2px'
                                                }}></div>
                                                <span style={{ marginRight: '8px' }}>{point.serieId}:</span>
                                                <strong>{point.data.y} {t("dashboardPage.progressCard.tasks")}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardProgressCard;