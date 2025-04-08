import React, {useEffect, useState} from "react";
import BlankCard from "../../../components/BlankCard";
import { ResponsiveBar } from '@nivo/bar';
import { differenceInHours, parseISO } from 'date-fns';
import {useTranslation} from "react-i18next";

const TaskTimeAllocationChart = ({collabs, taskList}) => {
    const [taskCounted, setTaskCounted] = useState([]);

    const { t } = useTranslation();

    useEffect(() => {
        const taskDurationByUser = collabs.map(user => {
            const userTasks = taskList.filter(task => task.assigneeId === user.value);

            const totalHours = userTasks.reduce((sum, task) => {
                const start = parseISO(task.startTime);
                const end = parseISO(task.endTime);
                return sum + differenceInHours(end, start);
            }, 0);

            return {
                name: user.label,
                duration: totalHours,
            };
        });
        setTaskCounted(taskDurationByUser);
    }, [collabs]);

    return (
        <div style={{width: "50%", height: " 100%", padding: "2rem", paddingTop: "0", paddingLeft: "0.5rem"}}>
            <BlankCard>
                <div style={{height: "96%"}}>
                    <ResponsiveBar
                        data={taskCounted}
                        keys={['duration']}
                        indexBy="name"
                        margin={{ top: 20, right: 50, bottom: 50, left: 60 }}
                        padding={0.3}
                        layout="vertical"
                        colors={{ scheme: 'nivo' }}
                        colorBy="indexValue"
                        axisBottom={{ legend: '', legendPosition: 'middle', legendOffset: 32, tickRotation: -15 }}
                        axisLeft={{ legend: t("statPage.numberOfHours"), legendPosition: 'middle', legendOffset: -40 }}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                        labelTextColor="#fff"
                    />
                </div>
                <h5 style={{textAlign: "center", color: "#656565", marginTop: "0.5rem"}}>{t("statPage.taskAllocationTimeTitle")}</h5>
            </BlankCard>
        </div>
    )
}

export default TaskTimeAllocationChart;