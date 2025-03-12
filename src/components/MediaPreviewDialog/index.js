import React from 'react';
import { Dialog } from 'primereact/dialog';
import BasicButton from '../../components/Button';
import { useTranslation } from 'react-i18next';
import {downloadMedia} from "../../utils/MediaUtil";

const MediaPreviewDialog = ({ visible, onHide, media }) => {
    const { t } = useTranslation();

    return (
        <Dialog
            visible={visible}
            header={`Preview: ${media?.filename}`}
            modal
            onHide={onHide}
            style={{ width: "70vw", height: "80vh" }}
            footer={
                <BasicButton
                    label={t('storagePage.actionDownload')}
                    icon="pi pi-download"
                    onClick={() => {
                        downloadMedia(media).then(r => onHide());
                    }}
                    className="p-button-primary"
                />
            }
        >
            {media ? (
                media.type === "IMAGE" ? (
                    <img
                        src={media.link}
                        alt={media.name || "Image Preview"}
                        style={{ width: "100%", height: "auto", maxHeight: "70vh", objectFit: "contain" }}
                    />
                ) : media.type === "VIDEO" ? (
                    <video controls style={{ width: "100%", height: "auto", maxHeight: "70vh" }}>
                        <source src={media.link} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <iframe
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(media.link)}&embedded=true`}
                        style={{ width: "100%", height: "100%" }}
                    />
                )
            ) : (
                <p>{t('storagePage.dialogPreviewUnsupported')}</p>
            )}
        </Dialog>
    );
};

export default MediaPreviewDialog;
