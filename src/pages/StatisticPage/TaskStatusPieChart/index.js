import React from "react";
import BlankCard from "../../../components/BlankCard";
import {ResponsivePie} from "@nivo/pie";
import {useTranslation} from "react-i18next";

const TaskStatusPieChart = ({ taskStat }) => {
    const { t } = useTranslation();

    return (
        <div style={{width: "60%", height: " 100%", padding: "2rem", paddingRight: "0.5rem"}}>
            <BlankCard>
                <div style={{height: "96%"}}>
                    <ResponsivePie
                        data={taskStat}
                        margin={{ top: 20, right: 80, bottom: 6, left: 0 }}
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
                                anchor: 'right',
                                direction: 'column',
                                translateX: 80,
                                itemWidth: 100,
                                itemHeight: 28,
                                symbolSize: 18,
                            },
                        ]}
                    />
                </div>
                <h5 style={{textAlign: "center", color: "#656565", marginTop: "0.5rem"}}>{t("statPage.taskStatusTitle")}</h5>
            </BlankCard>
        </div>
    )
}

export default TaskStatusPieChart;