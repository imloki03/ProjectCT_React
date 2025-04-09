import React, {useEffect, useState} from "react";
import BlankCard from "../../../components/BlankCard";
import DropDownField from "../../../components/DropDownField";
import { differenceInCalendarDays, format } from 'date-fns';
import { ResponsiveLine } from '@nivo/line';
import {useTranslation} from "react-i18next";

const BurndownChart = ({phases, taskList}) => {
    const { t } = useTranslation();

    const [currentPhase, setCurrentPhase] = useState(0);
    const [plannedRemaining, setPlannedRemaining] = useState([{ id: t("statPage.plannedRemaining"), data: [] }]);
    const [actualRemaining, setActualRemaining] = useState([{ id: t("statPage.actualRemaining"), data: [] }]);

    useEffect(() => {
        setCurrentPhase(phases[0]?.id);
    }, [phases]);

    useEffect(() => {
        if (!currentPhase || currentPhase === 0)
            return;
        const today = new Date();
        const start = new Date(phases.filter(phase => phase.id === currentPhase)[0]?.startDate);
        const end = new Date(phases.filter(phase => phase.id === currentPhase)[0]?.endDate);

        const tasksInPhase = taskList.filter(task => task.phaseId === currentPhase);

        const numDays = differenceInCalendarDays(end, start) + 1;

        const days = Array.from({ length: numDays }, (_, i) => {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            return date;
        });

        const planned = days.map(date => {
            const count = tasksInPhase.filter(task => new Date(task.endTime) > date).length;
            return {
                x: format(date, 'yyyy-MM-dd'),
                y: count,
            };
        });

        const actual = days.map(date => {
            const count = tasksInPhase.filter(task => {
                if (!task.doneTime) return true;
                return new Date(task.doneTime) > date;  //task trễ
            }).length;

            if (date > today) {
                return {
                    x: format(date, 'yyyy-MM-dd'),
                    y: null,
                };
            }
            return {
                x: format(date, 'yyyy-MM-dd'),
                y: count,
            };
        });
        setPlannedRemaining([{ id: t("statPage.plannedRemaining"), data: planned }]);
        setActualRemaining([{ id: t("statPage.actualRemaining"), data: actual }]);
    }, [currentPhase]);

    return (
        <div style={{width: "100%", height: " 40rem", padding: "2rem", paddingTop: "0"}}>
            <BlankCard>
                <div className="flex flex-column"
                    style={{width: "100%", height: "96%"}}
                >
                    <DropDownField
                        label={t("statPage.phaseFilter")}
                        selected={currentPhase}
                        options={phases}
                        onChange={(value)=>{setCurrentPhase(value.value)}}
                        style={{width: "30%"}}
                        optionLabel="name"
                        optionValue="id"
                    />

                    {
                        plannedRemaining[0].data.length > 0 && actualRemaining[0].data.length > 0 &&
                        <ResponsiveLine
                            data={[...plannedRemaining, ...actualRemaining]}
                            margin={{ top: 50, right: 160, bottom: 100, left: 60 }}
                            xScale={{ type: 'point' }}
                            yScale={{
                                type: 'linear',
                                min: 0,
                                max: 'auto',
                                stacked: false,
                            }}
                            axisBottom={{
                                orient: 'bottom',
                                legend: t("statPage.date"),
                                legendOffset: 60,
                                legendPosition: 'middle',
                                tickRotation: -45,
                            }}
                            axisLeft={{
                                orient: 'left',
                                legend: t("statPage.taskRemaining"),
                                legendOffset: -40,
                                legendPosition: 'middle',
                            }}
                            colors={{ scheme: 'category10' }}
                            pointSize={8}
                            pointColor={{ theme: 'background' }}
                            pointBorderWidth={2}
                            pointBorderColor={{ from: 'serieColor' }}
                            useMesh={true}
                            tooltip={({ point }) => (
                                <div
                                    style={{
                                        background: 'white',
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {t("statPage.date")}: <strong>{point.data.xFormatted}</strong><br />
                                    {t("statPage.taskRemaining")}: <strong>{point.data.yFormatted}</strong>
                                </div>
                            )}

                            legends={[
                                {
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
                    }
                </div>
                <h5 style={{textAlign: "center", color: "#656565", marginTop: "1rem"}}>{t("statPage.burndownTitle")}</h5>
            </BlankCard>
        </div>
    )
}

export default BurndownChart;