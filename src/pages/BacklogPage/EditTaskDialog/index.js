import React, {useEffect, useState} from "react";
import "./index.css"
import {priority} from "../../../constants/Priority";
import {taskType} from "../../../constants/TaskType";
import {useDispatch, useSelector} from "react-redux";
import {updateTask} from "../../../api/taskApi";
import PopupCard from "../../../components/PopupCard";
import TextField from "../../../components/TextField";
import TextFieldArea from "../../../components/TextFieldArea";
import DropDownField from "../../../components/DropDownField";
import typeItemTemplate from "../../../components/TaskComponent/TypeItemTemplate";
import priorityItemTemplate from "../../../components/TaskComponent/PriorityItemTemplate";
import BasicButton from "../../../components/Button";
import {useNotification} from "../../../contexts/NotificationContext";
import {useTranslation} from "react-i18next";

const EditTaskDialog = ({onClose, currentData}) => {
    const [name, setName] = useState(currentData?.name);
    const [description, setDescription] = useState(currentData?.description);
    const [tasktype, setTasktype] = useState(currentData.type || taskType[1].value)
    const [taskPriority, setTaskPriority] = useState(currentData.priority || priority[2].value);

    const showNotification = useNotification();

    const [loading, setLoading] = useState(false);

    const projectId = useSelector((state) => state.project.currentProject?.id);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const handleUpdateTask = async () => {
        try {
            setLoading(true);
            const response = await updateTask(currentData?.id, {
                name: name,
                type: tasktype,
                description: description,
                priority: taskPriority,
            });
            setLoading(false);
            showNotification("success", t("backlogPage.updateTask"), response.desc)
            onClose();
        } catch (error) {
            setLoading(false);
            showNotification("error", t("backlogPage.updateTask"), error.response.data.desc);
            onClose();
        }
    }

    return (
        <PopupCard
            title={t("backlogPage.updateTask")}
            subTitle={t("backlogPage.updateTaskSubtitle")}
            className="edit-task-card"
            onClose={onClose}
        >
            <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
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

                <BasicButton
                    label={t("backlogPage.update")}
                    width="100%"
                    loading={loading}
                    disabled={loading}
                    style={{marginTop: "1.4rem"}}
                    onClick={() => {handleUpdateTask()}}
                />
            </div>
        </PopupCard>
    )
}

export default EditTaskDialog;