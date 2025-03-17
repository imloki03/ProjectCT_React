import React, {useEffect, useState} from "react";
import './index.css'
import PopupCard from "../../../components/PopupCard";
import {useNotification} from "../../../contexts/NotificationContext";
import {useTranslation} from "react-i18next";
import MediaCard from "../../../components/MediaCard";
import {updateTaskStatus} from "../../../api/taskApi";
import {uploadFileToFirebase} from "../../../config/firebaseConfig";
import {addMedia} from "../../../api/storageApi";
import {status} from "../../../constants/Status";
import {useSelector} from "react-redux";
import BasicButton from "../../../components/Button";

const UploadProofDialog = ({onClose, currentData}) => {
    const showNotification = useNotification();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);

    const projectId = useSelector((state) => state.project.currentProject?.id);

    const [files, setFiles] = useState([]);

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleUpdateTaskStatus = async () => {
        try {
            setLoading(true);
            if (files.length === 0) {
                showNotification("error", t("taskPage.updateStatus"), t("taskPage.provideProof"));
                return;
            }

            const uploadedFiles = await Promise.all(files.map(file => uploadFileToFirebase(file)));
            const mediaResponses = await Promise.all(
                uploadedFiles.map(file => addMedia(projectId, {
                    name: file.fileName,
                    filename: file.fileName,
                    link: file.fileUrl,
                })));
            const newMediaIdList = mediaResponses.map(res => res.data.id);

            const response = await updateTaskStatus(currentData.id, {
                status: "DONE",
                proofList: newMediaIdList,
            });
            showNotification("success", t("taskPage.updateStatus"), response.desc);
            onClose();
        } catch (error) {
            showNotification("error", t("taskPage.updateStatus"), error.response?.data?.desc || "Internal Server Error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <PopupCard
            title={t("taskPage.uploadProof")}
            subTitle={t("taskPage.uploadProofSubtitle")}
            style={{width: "25rem"}}
            onClose={onClose}
        >
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

                <input
                    id="fileInput"
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
            </div>
            <BasicButton
                label={t("backlogPage.update")}
                width="100%"
                loading={loading}
                disabled={loading}
                style={{marginTop: "1.4rem"}}
                onClick={() => {handleUpdateTaskStatus()}}
            />
        </PopupCard>
    )
}

export default UploadProofDialog;