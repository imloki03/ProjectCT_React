import React, { useState, useEffect } from 'react';
import { ResponsivePie } from '@nivo/pie';
import './index.css';
import { useTranslation } from "react-i18next";

const DashboardPriorityCard = ({ taskList }) => {
    const [data, setData] = useState([]);
    const { t } = useTranslation();

    const structureData = (taskList) => {
        const tempData = {};
        const priorityColors = {
            LOW: "yellow",
            MEDIUM: "orange",
            HIGH: "red",
            VERY_HIGH: "darkred"
        };

        const priorityOrder = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"];
        priorityOrder.forEach(priority => {
            tempData[priority] = {
                id: priority,
                label: priority,
                value: 0,
                color: priorityColors[priority],
                order: priorityOrder.indexOf(priority)
            };
        });

        taskList.forEach((t) => {
            if (tempData[t.priority]) {
                tempData[t.priority].value += 1;
            }
        });

        const result = Object.values(tempData).filter(item => item.value > 0);
        result.sort((a, b) => a.order - b.order);

        return result;
    };

    useEffect(() => {
        if (taskList && taskList.length > 0) {
            const structured = structureData(taskList);
            setData(structured);
        }
    }, [taskList]);

    const legendItems = [
        { id: "LOW", label: "LOW", color: "yellow" },
        { id: "MEDIUM", label: "MEDIUM", color: "orange" },
        { id: "HIGH", label: "HIGH", color: "red" },
        { id: "VERY_HIGH", label: "VERY_HIGH", color: "darkred" }
    ].filter(item => data.some(d => d.id === item.id));

    return (
        <div className="dashboard-priority-container">
            <div className="dashboard-priority-title">
                <h3>{t('dashboardPage.priorityCard.title')}</h3>
            </div>

            <div className="dashboard-priority-content" style={{ height: '300px' }}>
                {data.length > 0 ? (
                    <ResponsivePie
                        data={data}
                        margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
                        innerRadius={0.5}
                        padAngle={0.7}
                        cornerRadius={3}
                        activeOuterRadiusOffset={8}
                        colors={({ data }) => data.color}
                        borderWidth={1}
                        borderColor={{
                            from: 'color',
                            modifiers: [['darker', 0.2]]
                        }}
                        arcLinkLabelsSkipAngle={10}
                        arcLinkLabelsTextColor="#333333"
                        arcLinkLabelsThickness={2}
                        arcLinkLabelsColor={{ from: 'color' }}
                        arcLabelsSkipAngle={10}
                        arcLabelsTextColor={{
                            from: 'color',
                            modifiers: [['darker', 2]]
                        }}
                        defs={[
                            {
                                id: 'dots',
                                type: 'patternDots',
                                background: 'inherit',
                                color: 'rgba(255, 255, 255, 0.3)',
                                size: 4,
                                padding: 1,
                                stagger: true
                            },
                            {
                                id: 'lines',
                                type: 'patternLines',
                                background: 'inherit',
                                color: 'rgba(255, 255, 255, 0.3)',
                                rotation: -45,
                                lineWidth: 6,
                                spacing: 10
                            }
                        ]}
                        legends={[
                            {
                                anchor: 'bottom',
                                direction: 'row',
                                justify: false,
                                translateX: 0,
                                translateY: 56,
                                itemsSpacing: 0,
                                itemWidth: 90,
                                itemHeight: 18,
                                itemTextColor: '#999',
                                itemDirection: 'left-to-right',
                                itemOpacity: 1,
                                symbolSize: 18,
                                symbolShape: 'square',
                                data: legendItems,
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemTextColor: '#000'
                                        }
                                    }
                                ]
                            }
                        ]}
                    />
                ) : (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {t('dashboardPage.priorityCard.emptyState')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPriorityCard;
