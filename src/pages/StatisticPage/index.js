import React, {useEffect, useState} from "react";
import "./index.css"
import GanttChart from "./GanttChart";
import {useFetchProject} from "../../hooks/useFetchProject";

const StatisticPage = () => {
    const fetchProject = useFetchProject();

    useEffect(() => {
        fetchProject();
    }, []);

    return (
        <div>
            <GanttChart/>
        </div>
    )
}

export default StatisticPage;