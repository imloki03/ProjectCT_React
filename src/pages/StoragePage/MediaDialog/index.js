import React, { useEffect, useRef, useState } from 'react';
import { FileUpload } from 'primereact/fileupload';
import './index.css';

import TextField from "../../../components/TextField";
import TextFieldArea from "../../../components/TextFieldArea";
import InputDialog from "../../../components/InputDialog";
import BasicButton from "../../../components/Button";
import {useNotification} from "../../../contexts/NotificationContext";
import {addMedia, updateMedia} from "../../../api/storageApi";
import {uploadFileToFirebase} from "../../../config/firebaseConfig";
import {useTranslation} from "react-i18next";


const MediaDialog = ({ visible, onHide, projectId, mediaToEdit, onUploadSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFileChanged, setIsFileChanged] = useState(false);
    const [media, setMedia] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const { t } = useTranslation();
    const showNotification = useNotification();
    const fileUploadRef = useRef(null);

    useEffect(() => {
        if (mediaToEdit) {
            setMedia(mediaToEdit);
            setName(mediaToEdit.name);
            setDescription(mediaToEdit.description);
            setFile(null);
            setIsFileChanged(false);
        } else {
            setMedia(null);
            setIsFileChanged(true);
            setName("");
            setDescription("");
            setFile(null);
        }
    }, [mediaToEdit]);

    const validateInputs = () => {
        if (!name.trim()) {
            showNotification("error", t("storagePage.mediaDialog.validationError"), t("storagePage.mediaDialog.nameRequired"));
            return false;
        }
        if (isFileChanged && !file) {
            showNotification("error", t("storagePage.mediaDialog.validationError"), t("storagePage.mediaDialog.fileRequired"));
            return false;
        }
        return true;
    };

    const onSubmit = async () => {
        if (!validateInputs()) return;
        setIsSubmitting(true);

        try {
            let fileUrl = media?.link;
            let fileName = media?.filename;
            let fileSize = media?.size;

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

            let response;
            if (mediaToEdit) {
                response = await updateMedia(mediaToEdit.id, mediaRequest);
            } else {
                response = await addMedia(projectId, mediaRequest, true);
            }
            showNotification("success", t("storagePage.mediaDialog.success"), response.desc);
            onUploadSuccess();
            onHide();
        } catch (error) {
            showNotification("error", t("storagePage.mediaDialog.error"), error.response?.data?.desc || t("storagePage.mediaDialog.somethingWentWrong"));
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
            showNotification("error", t("storagePage.mediaDialog.invalidFile"), `${t("storagePage.mediaDialog.allowedTypes")} ${allowedFileExtensions.join(", ")}`);
            fileUploadRef.current?.clear();
            return;
        }

        setFile(selectedFile);
        setIsFileChanged(true);
    };

    const handleChangeFile = () => {
        setIsFileChanged(true);
        setFile(null);
    };

    const formatFileSize = (size) => {
        if (!size || isNaN(size)) return t("storagePage.mediaDialog.unknownSize"); // Handle invalid sizes

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
            <BasicButton label={t("storagePage.mediaDialog.cancel")} icon="pi pi-times" onClick={onHide} className="p-button-text cancel-button"  />
            <BasicButton
                label={isSubmitting ? t("storagePage.mediaDialog.submitting") : t("storagePage.mediaDialog.submit")}
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
            header={mediaToEdit ? t("storagePage.mediaDialog.editMediaFile") : t("storagePage.mediaDialog.addNewMediaFile")}
            footer={dialogFooter}
            className={"media-dialog"}
        >
            <TextField label={t("storagePage.mediaDialog.name")} value={name} onChange={(e) => setName(e.target.value)}/>
            <TextFieldArea label={t("storagePage.mediaDialog.description")} value={description} onChange={(e) => setDescription(e.target.value)}
                           rows={5}/>
            <div style={{width: '100%'}}>
                {(!mediaToEdit || isFileChanged) && (
                    <FileUpload
                        ref={fileUploadRef}
                        chooseLabel={t("storagePage.mediaDialog.browse")}
                        chooseOptions={{className: "custom-choose-button"}}
                        onSelect={onFileSelect}
                        onDrop={onFileSelect}
                        accept={allowedFileExtensions.join(",")}
                        maxFileSize={5000000}
                        auto
                        customUpload
                        emptyTemplate={<p className="m-0">Drag and drop files here to upload.</p>}
                    />
                )}
            </div>

            {mediaToEdit && !isFileChanged && (
                <BasicButton label={t("storagePage.mediaDialog.changeFile")} icon="pi pi-refresh" onClick={handleChangeFile}
                             className="p-button-text"/>
            )}
        </InputDialog>
    );
};

export default MediaDialog;
