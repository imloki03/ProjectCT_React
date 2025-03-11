import React, {useEffect, useState} from "react";
import "./index.css"
import {taskType} from "../../../constants/TaskType";
import {priority} from "../../../constants/Priority";
import {useDispatch, useSelector} from "react-redux";
import getAllPhasesKeyValue from "../../../utils/PhaseUtil";
import getAllCollabsKeyValue from "../../../utils/CollabUtil";
import PopupCard from "../../../components/PopupCard";
import {moveTaskToPhase} from "../../../api/taskApi";
import {useNotification} from "../../../contexts/NotificationContext";
import Avatar from "../../../components/Avatar";
import TextField from "../../../components/TextField";
import TextFieldArea from "../../../components/TextFieldArea";
import DropDownField from "../../../components/DropDownField";
import typeItemTemplate from "../../../components/TaskComponent/TypeItemTemplate";
import priorityItemTemplate from "../../../components/TaskComponent/PriorityItemTemplate";
import {formatTimeZone, isValidDate} from "../../../utils/DateTimeUtil";
import DateTimePicker from "../../../components/DateTimePicker";
import BasicButton from "../../../components/Button";
import DateTimeSelector from "../../../components/DateTimeSelector";
import {useTranslation} from "react-i18next";

const MoveTaskDialog = ({onClose, currentData}) => {
    const [name, setName] = useState(currentData?.name);
    const [description, setDescription] = useState(currentData?.description);
    const [tasktype, setTasktype] = useState(currentData.type || taskType[1].value)
    const [taskPriority, setTaskPriority] = useState(currentData.priority || priority[2].value);
    const [assignee, setAssignee] = useState();
    const [phase, setPhase] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const [collabs, setCollabs] = useState([])
    const [phases, setPhases] = useState([])

    const [enable, setEnable] = useState(true);

    const [loading, setLoading] = useState(false);
    const projectId = useSelector((state) => state.project.currentProject?.id);
    const dispatch = useDispatch();
    const showNotification = useNotification();
    const { t } = useTranslation();

    useEffect(() => {
        async function fetchData() {
            const collabList = await getAllCollabsKeyValue(projectId);
            setCollabs(collabList)
            if (collabList.length===0) {
                setEnable(false)
            } else {
                setEnable(true);
            }
            const phaseList = await getAllPhasesKeyValue(projectId);
            setPhases(phaseList);
            if (phaseList.length===0) {
                setEnable(false)
            } else {
                setEnable(true);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        setPhase(phases[0]?.value)
    }, [phases]);

    useEffect(() => {
        setAssignee(collabs[0]?.value)
    }, [collabs]);

    const handleMoveTaskToPhase = async () => {
        try {
            setLoading(true);
            const response = await moveTaskToPhase(currentData.id, phase, {
                name: name,
                type: tasktype,
                description: description,
                startTime: formatTimeZone(startDate),
                endTime: formatTimeZone(endDate),
                priority: taskPriority,
                assigneeUsername: assignee
            });
            setLoading(false);
            onClose();
            showNotification("success", t("backlogPage.moveTask"), response.desc)
        } catch (error) {
            setLoading(false);
            onClose();
            showNotification("error", t("backlogPage.moveTask"), error.response.data.desc);
        }
    };

    const avatarItemTemplate = (option) => {
        return (
            <div className="flex align-items-center">
                <div style={{marginRight: "0.5rem"}}>
                    <Avatar
                        label={option?.label}
                        image={option?.avatar}
                        customSize="1.5rem"
                    />
                </div>
                <div>{option?.label}</div>
            </div>
        );
    };

    return (
        <PopupCard
            title={t("backlogPage.moveTaskTitle")}
            subTitle={t("backlogPage.moveTaskSubtitle")}
            className="move-task-card"
            onClose={onClose}
        >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1', display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <TextField
                        label={t("backlogPage.name")}
                        value={name}
                        onChange={(e) =>{ setName(e.target.value)}}
                    />

                    <TextFieldArea
                        rows="5"
                        label={t("backlogPage.description")}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <DropDownField
                        label={t("backlogPage.type")}
                        selected={tasktype}
                        options={taskType}
                        onChange={(value)=>{setTasktype(value.value)}}
                        itemTemplate={typeItemTemplate}
                        valueTemplate={typeItemTemplate}
                    />

                    <DropDownField
                        label={t("backlogPage.priority")}
                        selected={taskPriority}
                        options={priority}
                        onChange={(value)=>{setTaskPriority(value.value)}}
                        itemTemplate={priorityItemTemplate}
                        valueTemplate={priorityItemTemplate}
                    />

                    <DropDownField
                        label={t("backlogPage.phase")}
                        selected={phase}
                        options={phases}
                        onChange={(value) => setPhase(value.value)}
                    />

                    <DropDownField
                        label={t("backlogPage.assignee")}
                        selected={assignee}
                        options={collabs}
                        onChange={(value) => {setAssignee(value.value)}}
                        itemTemplate={avatarItemTemplate}
                        valueTemplate={avatarItemTemplate}
                        showClear={true}
                    />
                </div>
                <div style={{ gridColumn: '2', display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <DateTimeSelector
                        type="start"
                        startDate={startDate}
                        endDate={endDate}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                    />

                    <DateTimeSelector
                        type="end"
                        startDate={startDate}
                        endDate={endDate}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                    />
                    {!enable && <p style={{color:"red"}}>There are no phase to move !</p>}
                </div>
                <BasicButton
                    label={t("backlogPage.move")}
                    width="100%"
                    loading={loading}
                    disabled={loading || !enable}
                    onClick={()=>{handleMoveTaskToPhase()}}
                    style={{ marginTop: '1.4rem' }}
                />
            </div>
        </PopupCard>
    )
}

export default MoveTaskDialog;