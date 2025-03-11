import React, {useState} from "react";
import PopupCard from "../../../components/PopupCard";
import {useFetchProject} from "../../../hooks/useFetchProject";
import {useDispatch, useSelector} from "react-redux";
import "./index.css"
import {priority} from "../../../constants/Priority";
import {taskType} from "../../../constants/TaskType";
import TextField from "../../../components/TextField";
import TextFieldArea from "../../../components/TextFieldArea";
import DropDownField from "../../../components/DropDownField";
import typeItemTemplate from "../../../components/TaskComponent/TypeItemTemplate";
import priorityItemTemplate from "../../../components/TaskComponent/PriorityItemTemplate";
import BasicButton from "../../../components/Button";
import {createNewTask} from "../../../api/taskApi";
import {useNotification} from "../../../contexts/NotificationContext";
import {useTranslation} from "react-i18next";

const AddTaskDialog = ({onClose, currentTaskId=-1}) => {
    const fetchProject = useFetchProject();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [tasktype, setTasktype] = useState(taskType[1].value)
    const [taskPriority, setTaskPriority] = useState(priority[2].value);
    const [loading, setLoading] = useState(false);

    const username = useSelector((state) => state.user.currentUser?.username);
    const projectId = useSelector((state) => state.project.currentProject?.id);
    const dispatch = useDispatch();
    const showNotification = useNotification();
    const { t } = useTranslation();

    const handleAddNewTask = async () => {
        try {
            setLoading(true);
            const response = await createNewTask(projectId , {
                name: name,
                type: tasktype,
                description: description,
                priority: taskPriority,
                parentTaskId: currentTaskId!==-1 ? currentTaskId : null
            });
            setLoading(false);
            onClose();
            showNotification("success", t("backlogPage.addTask"), response.desc);
        } catch (error) {
            setLoading(false);
            showNotification("error", t("backlogPage.addTask"), error.response.data.desc);
        }
    };

    return (
        <PopupCard
            title={t("backlogPage.createNewIssue")}
            subTitle="Provide the details for your new issue!"
            className="create-task-card"
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
                    label={t("backlogPage.create")}
                    width="100%"
                    loading={loading}
                    disabled={loading}
                    style={{marginTop: "1.4rem"}}
                    onClick={() => {handleAddNewTask()}}
                />
            </div>
        </PopupCard>
    )
}

export default AddTaskDialog;