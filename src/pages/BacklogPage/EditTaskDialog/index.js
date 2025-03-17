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
import MediaCard from "../../../components/MediaCard";
import {uploadFileToFirebase} from "../../../config/firebaseConfig";
import {addMedia} from "../../../api/storageApi";
import MediaPreviewDialog from "../../../components/MediaPreviewDialog";

const EditTaskDialog = ({onClose, currentData}) => {
    const [name, setName] = useState(currentData?.name);
    const [description, setDescription] = useState(currentData?.description);
    const [tasktype, setTasktype] = useState(currentData.type || taskType[1].value)
    const [taskPriority, setTaskPriority] = useState(currentData.priority || priority[2].value);
    const [mediaList, setMediaList] = useState(currentData?.mediaList || []);
    const [currentMedia, setCurrentMedia] = useState();

    const showNotification = useNotification();

    const [loading, setLoading] = useState(false);

    const projectId = useSelector((state) => state.project.currentProject?.id);
    const { t } = useTranslation();

    const [isMediaPreviewVisible, setIsMediaPreviewVisible] = useState(false);

    const [files, setFiles] = useState([]);

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const removeMedia = (index) => {
        setMediaList(mediaList.filter((_, i) => i !== index));
    }

    const handleUpdateTask = async () => {
        try {
            setLoading(true);
            const uploadedFiles = await Promise.all(files.map(file => uploadFileToFirebase(file)));
            const mediaResponses = await Promise.all(
                uploadedFiles.map(file => addMedia(projectId, {
                    name: file.fileName,
                    filename: file.fileName,
                    link: file.fileUrl,
                })));
            const newMediaIdList = mediaResponses.map(res => res.data.id);
            const mediaIdList = mediaList.map(media => media.id);
            const response = await updateTask(currentData?.id, {
                name: name,
                type: tasktype,
                description: description,
                priority: taskPriority,
                mediaIdList: [...mediaIdList, ...newMediaIdList]
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
                        label={t("backlogPage.update")}
                        width="100%"
                        loading={loading}
                        disabled={loading}
                        style={{marginTop: "1.4rem"}}
                        onClick={() => {handleUpdateTask()}}
                    />
                </div>
                <div style={{ gridColumn: '2', display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h3 style={{ marginTop: "0" }}>{t("taskPage.attachedFile")}</h3>
                    <div>
                        <div className="task-file-list-container">
                            {mediaList.map((file, index) => (
                                <MediaCard
                                    key={index}
                                    file={{
                                        name: file.filename
                                    }}
                                    onDelete={() => removeMedia(index)}
                                    onClick={() => {
                                        setCurrentMedia(file);
                                        setIsMediaPreviewVisible(true);
                                    }}
                                />
                            ))}

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
                <MediaPreviewDialog
                    visible={isMediaPreviewVisible}
                    onHide={() => {if (!isMediaPreviewVisible) return; setIsMediaPreviewVisible(false);}}
                    media={currentMedia}
                />
            </div>
        </PopupCard>
    )
}

export default EditTaskDialog;