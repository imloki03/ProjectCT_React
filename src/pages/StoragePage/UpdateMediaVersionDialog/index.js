import React, { useEffect, useRef, useState } from 'react';
import { FileUpload } from 'primereact/fileupload';
import './index.css';

import TextField from "../../../components/TextField";
import TextFieldArea from "../../../components/TextFieldArea";
import InputDialog from "../../../components/InputDialog";
import BasicButton from "../../../components/Button";
import { uploadFileToFirebase } from "../../../config/firebaseConfig";
import { updateMediaVersion } from "../../../api/storageApi";
import { useNotification } from "../../../contexts/NotificationContext";
import { useTranslation } from "react-i18next";

const UpdateMediaVersionDialog = ({ visible, onHide, projectId, selectedMedia, onUpdateSuccess }) => {
    const { t } = useTranslation();
    const showNotification = useNotification();
    const fileUploadRef = useRef(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFileChanged, setIsFileChanged] = useState(true);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (selectedMedia) {
            setName(selectedMedia.name);
            setDescription(selectedMedia.description);
            setFile(null);
            setIsFileChanged(true);
        } else {
            setIsFileChanged(true);
            setName("");
            setDescription("");
            setFile(null);
        }
    }, [selectedMedia]);

    const validateInputs = () => {
        console.log(isFileChanged)
        console.log(file)
        if (!name.trim()) {
            showNotification("error", t("storagePage.updateMediaVersionDialog.validationError"), t("storagePage.updateMediaVersionDialog.nameRequired"));
            return false;
        }
        if (!description.trim()) {
            showNotification("error", t("storagePage.updateMediaVersionDialog.validationError"), t("storagePage.updateMediaVersionDialog.descriptionRequired"));
            return false;
        }
        if (isFileChanged && !file) {
            showNotification("error", t("storagePage.updateMediaVersionDialog.validationError"), t("storagePage.updateMediaVersionDialog.fileRequired"));
            return false;
        }
        return true;
    };

    const onSubmit = async () => {
        if (!validateInputs()) return;
        setIsSubmitting(true);

        try {
            let fileUrl = selectedMedia?.link;
            let fileName = selectedMedia?.filename;
            let fileSize = selectedMedia?.size;

            if (isFileChanged && file) {
                const { fileUrl: uploadedFileUrl, fileName: uploadedFileName, fileSize: uploadedFileSize } = await uploadFileToFirebase(file);
                fileUrl = uploadedFileUrl;
                fileName = uploadedFileName;
                fileSize = uploadedFileSize;
            }

            const mediaRequest = {
                name,
                description,
                filename: fileName,
                size: formatFileSize(fileSize),
                link: fileUrl,
            };

            const response = await updateMediaVersion(selectedMedia.id, mediaRequest);
            showNotification("success", t("storagePage.updateMediaVersionDialog.success"), response.desc);
            onUpdateSuccess();
            onHide();
        } catch (error) {
            showNotification("error", t("storagePage.updateMediaVersionDialog.error"), error.response?.data?.desc || t("storagePage.updateMediaVersionDialog.somethingWentWrong"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const allowedFileExtensions = [
        ".mp4", ".avi", ".mkv", ".jpg", ".jpeg", ".png", ".gif",
        ".doc", ".docx", ".pdf", ".ppt", ".pptx", ".xls", ".xlsx"
    ];

    const onFileSelect = (e) => {
        if (!e.files || e.files.length === 0) return;
        const selectedFile = e.files[0];
        const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

        if (!allowedFileExtensions.includes(fileExtension)) {
            showNotification("error", t("storagePage.updateMediaVersionDialog.invalidFile"), `${t("storagePage.updateMediaVersionDialog.allowedTypes")} ${allowedFileExtensions.join(", ")}`);
            fileUploadRef.current?.clear();
            return;
        }

        setFile(selectedFile);
        setIsFileChanged(true);
    };

    const formatFileSize = (size) => {
        if (!size || isNaN(size)) return t("storagePage.updateMediaVersionDialog.unknownSize");

        const units = ["B", "KB", "MB", "GB", "TB"];
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    };

    const dialogFooter = (
        <div className={"media-dialog-footer"}>
            <BasicButton label={t("storagePage.updateMediaVersionDialog.cancel")} icon="pi pi-times" onClick={onHide} className="p-button-text cancel-button"/>
            <BasicButton
                label={isSubmitting ? t("storagePage.updateMediaVersionDialog.updating") : t("storagePage.updateMediaVersionDialog.update")}
                icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-check"}
                onClick={onSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
            />
        </div>
    );

    return (
        <InputDialog
            visible={visible}
            onHide={onHide}
            header={t("storagePage.updateMediaVersionDialog.updateMediaVersion")}
            footer={dialogFooter}
            style={{ width: '50vw' }}
            className={"media-dialog"}
        >
            <TextField label={t("storagePage.updateMediaVersionDialog.name")} value={name} onChange={(e) => setName(e.target.value)}/>
            <TextFieldArea label={t("storagePage.updateMediaVersionDialog.description")} value={description} onChange={(e) => setDescription(e.target.value)} rows={5}/>
            <div style={{ width: '100%' }}>
                <FileUpload
                    ref={fileUploadRef}
                    chooseLabel={t("storagePage.updateMediaVersionDialog.browse")}
                    chooseOptions={{ className: "custom-choose-button" }}
                    onSelect={onFileSelect}
                    onDrop={onFileSelect}
                    accept={allowedFileExtensions.join(",")}
                    maxFileSize={5000000}
                    auto
                    customUpload
                    emptyTemplate={<p className="m-0">{t("storagePage.updateMediaVersionDialog.dragDrop")}</p>}
                />
            </div>
        </InputDialog>
    );
};

export default UpdateMediaVersionDialog;
