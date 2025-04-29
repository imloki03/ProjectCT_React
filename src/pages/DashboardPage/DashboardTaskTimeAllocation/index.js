import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from "react-i18next";
import './index.css';

const DashboardTaskTimeAllocation = ({ taskList, phaseList }) => {
    const [phase, setPhase] = useState("all");
    const { t } = useTranslation();

    const phases = useMemo(() => {
        const allPhases = [{ name: t('dashboardPage.taskTimeAllocation.allPhase'), value: "all" }];

        if (phaseList && phaseList.length > 0) {
            phaseList.forEach(phase => {
                allPhases.push({
                    name: phase.name,
                    value: phase.id.toString()
                });
            });
        }

        return allPhases;
    }, [phaseList, t]);

    const chartData = useMemo(() => {
        if (!taskList || taskList.length === 0) {
            return [];
        }

        const today = new Date();
        const filteredByPhase = phase === "all"
            ? taskList
            : taskList.filter(task => task.phaseId === parseInt(phase));

        const startedTasks = filteredByPhase.filter(task => {
            const startTime = new Date(task.startTime);
            return startTime <= today;
        });

        return startedTasks
            .filter(task => task.doneTime || task.status === "IN_PROGRESS")
            .map(task => {
            const startTime = new Date(task.startTime);
            let endTime;
            let status;

            if (task.doneTime) {
                endTime = new Date(task.doneTime);
                status = "completed";
            } else {
                endTime = new Date();
                status = "in-progress";
            }

            const hoursSpent = Math.max(0, (endTime - startTime) / (1000 * 60 * 60));
            const roundedHours = Math.round(hoursSpent * 10) / 10;

            return {
                task: task.name.length > 15 ? `${task.name.substring(0, 15)}...` : task.name,
                fullName: task.name,
                hours: roundedHours,
                status: status,
                taskStatus: task.status,
                taskType: task.type,
                startTime: task.startTime,
                color: status === "completed" ? "#4caf50" : "#f1b900"
            };
        });
    }, [taskList, phase]);

    const legendItems = [
        { id: "in-progress", label: t('dashboardPage.taskTimeAllocation.legend.inProgress'), color: "#f1b900" },
        { id: "completed", label: t('dashboardPage.taskTimeAllocation.legend.completed'), color: "#4caf50" }
    ];

    return (
        <div className="dashboard-task-time-container">
            <div className="dashboard-task-time-title">
                <h3>{t('dashboardPage.taskTimeAllocation.title')}</h3>
                <div className="dashboard-task-title-action">
                    <div className="dashboard-dropdown-container">
                        <span>{t('dashboardPage.taskTimeAllocation.phaseLabel')}: </span>
                        <Dropdown
                            value={phase}
                            onChange={(e) => setPhase(e.value)}
                            options={phases}
                            optionLabel="name"
                            checkmark
                            highlightOnSelect={false}
                            className="dashboard-dropdown"
                        />
                    </div>
                </div>
            </div>

            <div className="dashboard-task-time-content" style={{ height: '300px'}} >
                {chartData.length > 0 ? (
                    <ResponsiveBar
                        data={chartData}
                        keys={['hours']}
                        indexBy="task"
                        margin={{ top: 20, right: 30, bottom: 70, left: 60 }}
                        padding={0.3}
                        valueScale={{ type: 'linear' }}
                        indexScale={{ type: 'band', round: true }}
                        colors={({ data }) => data.color}
                        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            legend: t('dashboardPage.taskTimeAllocation.axis.tasks'),
                            legendPosition: 'middle',
                            legendOffset: 65
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: t('dashboardPage.taskTimeAllocation.axis.hoursSpent'),
                            legendPosition: 'middle',
                            legendOffset: -50
                        }}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                        labelTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
                        tooltip={({ data }) => (
                            <div style={{
                                background: 'white',
                                padding: '9px 12px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '4px'
                                }}>
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: data.color,
                                        marginRight: '8px',
                                        borderRadius: '2px'
                                    }}></div>
                                    <strong>{data.fullName}</strong>
                                </div>
                                <div>{t('dashboardPage.taskTimeAllocation.tooltip.startTime')}: {new Date(data.startTime).toLocaleDateString('en-GB')}</div>
                                {/*<div>{t('dashboardPage.taskTimeAllocation.tooltip.status')}: {data.taskStatus}</div>*/}
                                <div>{t('dashboardPage.taskTimeAllocation.tooltip.timeSpent')}: {data.hours} {t('dashboardPage.taskTimeAllocation.hour')}</div>
                                <div>{t('dashboardPage.taskTimeAllocation.tooltip.state')}: {
                                    data.status === "completed"
                                        ? t('dashboardPage.taskTimeAllocation.tooltip.completed')
                                        : t('dashboardPage.taskTimeAllocation.tooltip.inProgress')
                                }</div>
                            </div>
                        )}
                        legends={[
                            {
                                anchor: 'bottom',
                                direction: 'row',
                                justify: false,
                                translateX: 0,
                                translateY: 55,
                                itemsSpacing: 2,
                                itemWidth: 100,
                                itemHeight: 20,
                                itemDirection: 'left-to-right',
                                itemOpacity: 0.85,
                                symbolSize: 20,
                                symbolShape: 'square',
                                data: legendItems,
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemOpacity: 1
                                        }
                                    }
                                ]
                            }
                        ]}
                        animate={true}
                        motionStiffness={90}
                        motionDamping={15}
                    />
                ) : (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {t('dashboardPage.taskTimeAllocation.emptyState')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardTaskTimeAllocation;
