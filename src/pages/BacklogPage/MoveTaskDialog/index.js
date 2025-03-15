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
import MediaCard from "../../../components/MediaCard";
import {uploadFileToFirebase} from "../../../config/firebaseConfig";
import {addMedia} from "../../../api/storageApi";
import MediaPreviewDialog from "../../../components/MediaPreviewDialog";

const MoveTaskDialog = ({onClose, currentData}) => {
    const [name, setName] = useState(currentData?.name);
    const [description, setDescription] = useState(currentData?.description);
    const [tasktype, setTasktype] = useState(currentData.type || taskType[1].value)
    const [taskPriority, setTaskPriority] = useState(currentData.priority || priority[2].value);
    const [assignee, setAssignee] = useState(null);
    const [phase, setPhase] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [mediaList, setMediaList] = useState(currentData?.mediaList || []);

    const [collabs, setCollabs] = useState([])
    const [phases, setPhases] = useState([])

    const [enable, setEnable] = useState(true);

    const [loading, setLoading] = useState(false);
    const projectId = useSelector((state) => state.project.currentProject?.id);
    const dispatch = useDispatch();
    const showNotification = useNotification();
    const { t } = useTranslation();

    const [isMediaPreviewVisible, setIsMediaPreviewVisible] = useState(false);
    const [currentMedia, setCurrentMedia] = useState();

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

    const handleMoveTaskToPhase = async () => {
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
            const response = await moveTaskToPhase(currentData.id, phase, {
                name: name,
                type: tasktype,
                description: description,
                startTime: formatTimeZone(startDate),
                endTime: formatTimeZone(endDate),
                priority: taskPriority,
                assigneeId: assignee,
                mediaIdList: [...mediaIdList, ...newMediaIdList]
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
                        onChange={(value) => {setAssignee(value.value);}}
                        itemTemplate={avatarItemTemplate}
                        valueTemplate={avatarItemTemplate}
                        optionLabel="label"
                        optionValue="value"
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

                        <MediaPreviewDialog
                            visible={isMediaPreviewVisible}
                            onHide={() => {if (!isMediaPreviewVisible) return; setIsMediaPreviewVisible(false);}}
                            media={currentMedia}
                        />
                    </div>

                    {!enable && <p style={{color:"red"}}>{t("taskPage.noPhase")}</p>}
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