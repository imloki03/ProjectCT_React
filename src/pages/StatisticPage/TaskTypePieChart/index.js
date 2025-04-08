import React, {useEffect, useState} from "react";
import BlankCard from "../../../components/BlankCard";
import {ResponsivePie} from "@nivo/pie";
import {taskType} from "../../../constants/TaskType";
import {useTranslation} from "react-i18next";

const TaskTypePieChart = ({ taskList }) => {
    const { t } = useTranslation();

    const [taskTypeList, setTaskTypeList] = useState([]);

    useEffect(() => {
        setTaskTypeList([
            {
                "id": "Story",
                "label": "Story",
                "value": taskList.filter(task => task.type === taskType[0].value).length,
                "color": "hsl(180,90%,54%)"
            },
            {
                "id": "Task",
                "label": "Task",
                "value": taskList.filter(task => task.type === taskType[1].value).length,
                "color": "hsl(133,83%,55%)"
            },
            {
                "id": "Bug",
                "label": "Bug",
                "value": taskList.filter(task => task.type === taskType[2].value).length,
                "color": "hsl(0,74%,69%)"
            }
        ])
    }, [taskList]);
    return (
        <div style={{width: "40%", height: " 100%", padding: "2rem", paddingLeft: "0.5rem"}}>
            <BlankCard>
                <div style={{height: "96%"}}>
                    <ResponsivePie
                        data={taskTypeList}
                        margin={{ top: 40, right: 40, bottom: 50, left: 40 }}
                        innerRadius={0.4}
                        padAngle={1}
                        cornerRadius={4}
                        colors={(datum) => datum.data.color}
                        activeOuterRadiusOffset={5}
                        borderWidth={1}
                        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                        arcLinkLabelsSkipAngle={10}
                        arcLinkLabelsTextColor="#333"
                        arcLinkLabelsThickness={2}
                        arcLinkLabelsColor={{ from: 'color' }}
                        arcLabelsSkipAngle={10}
                        arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                        legends={[
                            {
                                anchor: 'bottom',
                                direction: 'row',
                                translateY: 50,
                                translateX: 30,
                                itemWidth: 100,
                                itemHeight: 18,
                                symbolSize: 18,
                            },
                        ]}
                    />
                </div>
                <h5 style={{textAlign: "center", color: "#656565", marginTop: "0.5rem"}}>{t("statPage.taskTypeTitle")}</h5>
            </BlankCard>
        </div>
    )
}

export default TaskTypePieChart;