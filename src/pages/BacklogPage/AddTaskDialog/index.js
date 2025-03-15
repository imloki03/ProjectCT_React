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
import MediaCard from "../../../components/MediaCard";
import {Card} from "primereact/card";
import {uploadFileToFirebase} from "../../../config/firebaseConfig";
import {addMedia} from "../../../api/storageApi";

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

    const [files, setFiles] = useState([]);

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleAddNewTask = async () => {
        try {
            setLoading(true);
            const uploadedFiles = await Promise.all(files.map(file => uploadFileToFirebase(file)));
            const mediaResponses = await Promise.all(
                uploadedFiles.map(file => addMedia(projectId, {
                    name: file.fileName,
                    filename: file.fileName,
                    link: file.fileUrl,
                })));
            const mediaList = mediaResponses.map(res => res.data.id);

            const response = await createNewTask(projectId , {
                name: name,
                type: tasktype,
                description: description,
                priority: taskPriority,
                parentTaskId: currentTaskId!==-1 ? currentTaskId : null,
                mediaIdList: mediaList,
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

                    <BasicButton
                        label={t("backlogPage.create")}
                        width="100%"
                        loading={loading}
                        disabled={loading}
                        style={{marginTop: "1.4rem"}}
                        onClick={() => {handleAddNewTask()}}
                    />
                </div>
                <div style={{ gridColumn: '2', display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h3 style={{ marginTop: "0" }}>{t("taskPage.attachedFile")}</h3>
                    <div>
                        <div className="task-file-list-container">
                            {files.map((file, index) => (
                                <MediaCard
                                    key={index}
                                    file={file}
                                    onDelete={() => removeFile(index)}
                                />
                            ))}

                            <div className="task-file-card-container task-add-file-button"
                                 onClick={() => document.getElementById("fileInput").click()}
                            >
                                <div className="task-file-card">
                                    <i className="pi pi-plus"></i>
                                </div>
                            </div>
                        </div>

                        <input
                            id="fileInput"
                            type="file"
                            multiple
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
            </div>
        </PopupCard>
    )
}

export default AddTaskDialog;