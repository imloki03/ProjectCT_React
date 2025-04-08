import React, {useEffect, useState} from "react";
import BlankCard from "../../../components/BlankCard";
import { ResponsiveBar } from '@nivo/bar';
import {useTranslation} from "react-i18next";

const TaskAllocationChart = ({collabs, taskList}) => {
    const [taskCounted, setTaskCounted] = useState([]);

    const { t } = useTranslation();

    useEffect(() => {
        const taskCountByUser = collabs.map(collab => {
            const count = taskList.filter(task => task.assigneeId === collab.value).length;
            return {
                name: collab.label,
                tasks: count,
            };
        });
        setTaskCounted(taskCountByUser);
    }, [collabs]);

    return (
        <div style={{width: "50%", height: " 100%", padding: "2rem", paddingTop: "0", paddingRight: "0.5rem"}}>
            <BlankCard>
                <div style={{height: "96%"}}>
                    <ResponsiveBar
                        data={taskCounted}
                        keys={['tasks']}
                        indexBy="name"
                        margin={{ top: 20, right: 50, bottom: 50, left: 60 }}
                        padding={0.3}
                        layout="vertical"
                        colors={{ scheme: 'category10' }}
                        colorBy="indexValue"
                        axisBottom={{ legend: '', legendPosition: 'middle', legendOffset: 32, tickRotation: -15 }}
                        axisLeft={{ legend: t("statPage.numberOfTasks"), legendPosition: 'middle', legendOffset: -40 }}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                        labelTextColor="#fff"
                    />
                </div>
                <h5 style={{textAlign: "center", color: "#656565", marginTop: "0.5rem"}}>{t("statPage.taskAllocationTitle")}</h5>
            </BlankCard>
        </div>
    )
}

export default TaskAllocationChart;