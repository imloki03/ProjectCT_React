import React, {useEffect, useState} from "react";
import BlankCard from "../../../components/BlankCard";
import { ResponsiveBar } from '@nivo/bar';
import {parseISO} from "date-fns";
import {useTranslation} from "react-i18next";

const DelayedTaskChart = ({collabs, taskList}) => {
    const { t } = useTranslation();

    const [delayedCount, setDelayedCount] = useState([]);
    useEffect(() => {
        const now = new Date();

        const delayedTasksCompleted = taskList.filter(task => {
            const doneTime = task.doneTime ? parseISO(task.doneTime) : null;
            const endTime = parseISO(task.endTime);
            return doneTime && doneTime > endTime;
        });

        const delayedTasksInProgress = taskList.filter(task => {
            const endTime = parseISO(task.endTime);
            return task.status === 'IN_PROGRESS' && now > endTime;
        });

        const collaboratorData = collabs.map(collab => {
            const collabId = collab.value;

            const delayedCompletedByCollab = delayedTasksCompleted.filter(task => task.assigneeId === collabId).length;
            const delayedInProgressByCollab = delayedTasksInProgress.filter(task => task.assigneeId === collabId).length;

            return {
                collaborator: collab.label,
                delayedCompleted: delayedCompletedByCollab,
                delayedInProgress: delayedInProgressByCollab,
            };
        });

        setDelayedCount(collaboratorData);
    }, [collabs]);

    return (
        <div style={{width: "100%", height: " 35rem", padding: "2rem", paddingTop: "0"}}>
            <BlankCard>
                <div style={{height: "97%"}}>
                    <ResponsiveBar
                        data={delayedCount}
                        keys={['delayedCompleted', 'delayedInProgress']}
                        indexBy="collaborator"
                        margin={{ top: 50, right: 150, bottom: 50, left: 60 }}
                        padding={0.3}
                        colors={{ scheme: 'set2' }}
                        colorBy="indexValue"
                        axisBottom={{
                            legend: t("statPage.collaborator"),
                            legendPosition: 'middle',
                            legendOffset: 32,
                        }}
                        axisLeft={{
                            legend: t("statPage.numberDelayedTask"),
                            legendPosition: 'middle',
                            legendOffset: -40,
                        }}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                        labelTextColor="#fff"
                        stacked={true}
                        legends={[
                            {
                                data: [
                                    { id: 'delayedCompleted', label: t("statPage.completedLateTask"), color: "rgb(252, 141, 98)" },
                                    { id: 'delayedInProgress', label: t("statPage.unfinishedLateTask"), color: "rgb(102, 194, 165)" },
                                ],
                                anchor: 'top-right',
                                direction: 'column',
                                justify: false,
                                translateX: 120,
                                translateY: 0,
                                itemWidth: 100,
                                itemHeight: 20,
                                itemTextColor: '#999',
                                symbolSize: 12,
                                symbolShape: 'circle',
                            },
                        ]}
                    />
                </div>
                <h5 style={{textAlign: "center", color: "#656565", marginTop: "0.5rem"}}>{t("statPage.delayedTaskTitle")}</h5>
            </BlankCard>
        </div>
    )
}

export default DelayedTaskChart;