import React, { useState, useEffect } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import './index.css';
import {deleteMedia, getStorageMedia} from "../../api/storageApi";
import {useSelector} from "react-redux";
import BasicButton from "../../components/Button";
import {useFetchProject} from "../../hooks/useFetchProject";
import TextFieldIcon from "../../components/TextFieldIcon";
import MediaDialog from "./MediaDialog";
import UpdateMediaVersionDialog from "./UpdateMediaVersionDialog";
import {useTranslation} from "react-i18next";
// import MediaModal from "../MediaModal/MediaModal";
// import UpdateMediaVersionModal from "../../MediaStorage/UpdateVersionModal/UpdateVersionModal";

const StoragePage = () => {
    const { t } = useTranslation();
    const [mediaTree, setMediaTree] = useState([]);
    const [filteredMediaTree, setFilteredMediaTree] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [mediaToEdit, setMediaToEdit] = useState(null);
    const [mediaToUpdate, setMediaToUpdate] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewMedia, setPreviewMedia] = useState(null);
    const [previewDialogVisible, setPreviewDialogVisible] = useState(false);
    const fetchProject = useFetchProject();
    const project = useSelector((state) => state.project.currentProject);

    const openModal = () => setModalVisible(true);
    const closeModal = () => {
        setModalVisible(false);
        setMediaToEdit(null);
    };

    const openUpdateModal = () => setUpdateModalVisible(true);
    const closeUpdateModal = () => {
        setUpdateModalVisible(false);
        setMediaToUpdate(null);
    };

    const refreshMedia = async () => {
        setLoading(true);
        try {
            const response = await getStorageMedia(project?.id);
            const formattedData = response.data.map((file) => ({
                key: file.id,
                data: {
                    id: file.id,
                    name: file.name,
                    description: file.description,
                    type: file.type,
                    filename: file.filename,
                    size: file.size,
                    icon: getIconForType(file.type),
                    link: file.link,
                    uploadTime: new Date(file.uploadTime).toISOString(),
                    previousVersion: file.previousVersion,
                    isOutdated: false
                },
                children: [],
            }));

            // Store the IDs of files pushed as children
            const childIds = new Set();

            formattedData.forEach((file) => {
                if (file.data.previousVersion) {
                    const child = formattedData.find((f) => f.key === file.data.previousVersion);
                    if (child) {
                        child.data.isOutdated = true;
                        file.children.push(child);
                        childIds.add(child.key);
                    }
                }
            });

            // Filter out files that are in the childIds set
            const rootNodes = formattedData.filter((file) => !childIds.has(file.key));

            // Sort by upload time (latest to oldest)
            rootNodes.sort((a, b) => new Date(b.data.uploadTime) - new Date(a.data.uploadTime));

            setMediaTree(rootNodes);
            setFilteredMediaTree(rootNodes);
        } catch (error) {
            console.error("Failed to fetch media files:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchProject();
    }, []);

    useEffect(() => {
        if (project?.id) {
            refreshMedia();
        }
    }, [project]);

    useEffect(() => {
        const filteredData = mediaTree.filter((node) =>
            node.data.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            node.data.type.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredMediaTree(filteredData);
    }, [searchValue, mediaTree]);

    const getIconForType = (type) => {
        switch (type) {
            case "VIDEO":
                return "pi pi-video";
            case "IMAGE":
                return "pi pi-image";
            case "DOC":
                return "pi pi-file-word";
            case "PRESENTATION":
                return "pi pi-desktop";
            case "WORKBOOK":
                return "pi pi-file-excel";
            default:
                return "pi pi-file";
        }
    };

    const handleDeleteMedia = (media) => {
        setMediaToDelete(media);
        setShowConfirmDialog(true);
    };

    const deleteConfirmed = async () => {
        try {
            if (mediaToDelete) {
                await deleteMedia(mediaToDelete.id);
                setShowConfirmDialog(false);
                refreshMedia();
            }
        } catch (error) {
            setShowConfirmDialog(false);
        }
        finally {
        }
    };

    const handleDownloadMedia = async (media) => {
        try {
            const response = await fetch(media.link, { method: 'GET' });
            if (!response.ok) {
                throw new Error('Failed to fetch file');
            }

            // Create a blob from the response
            const blob = await response.blob();

            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a download link and trigger it
            const link = document.createElement('a');
            link.href = url;
            link.download = media.name || 'downloaded_file'; // Set a custom name if available
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file. Please try again later.');
        }
    };

    const renderActionButtons = (node) => (
        <div className="action-buttons">
            <Button icon="pi pi-eye" className="p-button-text" tooltip={t('storagePage.actionPreview')} onClick={() => handlePreviewMedia(node.data)} />
            <Button icon="pi pi-pencil" className="p-button-text" tooltip={t('storagePage.actionEdit')} onClick={() => { setMediaToEdit(node.data); openModal(); }} />
            {node.data.isOutdated === false && (
                <Button icon="pi pi-arrow-up" className="p-button-text" tooltip={t('storagePage.actionUpdateVersion')} onClick={() => { setMediaToUpdate(node.data); openUpdateModal(); }} />
            )}
            <Button icon="pi pi-trash" className="p-button-text" tooltip={t('storagePage.actionDelete')} onClick={() => handleDeleteMedia(node.data)} />
            <Button icon="pi pi-download" className="p-button-text" tooltip={t('storagePage.actionDownload')} onClick={() => handleDownloadMedia(node.data)} />
        </div>
    );

    const handlePreviewMedia = (media) => {
        if (media.type === "IMAGE" || media.type === "VIDEO") {
            setPreviewMedia(media);
            setPreviewDialogVisible(true);
        } else {
            window.open(media.link, "_blank");
        }
    };

    return (
        <div className="media-container">
            <div className="workspace-header">
                <h1 className="workspace-title">{t('storagePage.title')}</h1>
                <div className="workspace-actions">
                    <TextFieldIcon label={t('storagePage.searchPlaceholder')}
                                   placeholder={t('storagePage.searchPlaceholder')} name="search" value={searchValue}
                                   onChange={(e) => setSearchValue(e.target.value)} icon="pi-search"
                                   iconPosition="left"/>
                    <BasicButton label={t('storagePage.newMediaButton')} onClick={openModal}/>
                </div>
            </div>

            <TreeTable value={filteredMediaTree} paginator rows={6}>
                <Column expander field="icon" body={(node) => <i className={node.data.icon} style={{ fontSize: '24px' }} />} header={t('storagePage.tableFile')} />
                <Column field="name" header={t('storagePage.tableName')} />
                <Column field="type" header={t('storagePage.tableType')} />
                <Column field="size" header={t('storagePage.tableSize')} />
                <Column field="uploadTime" header={t('storagePage.tableUploadTime')} body={(node) => new Date(node.data.uploadTime).toLocaleString('en-GB')} />
                <Column field="isOutdated" header={t('storagePage.tableStatus')} body={(node) => (
                    <span className={node.data.isOutdated ? 'outdated-mark' : 'updated-mark'}>
                        {node.data.isOutdated ? t('storagePage.statusDeprecated') : t('storagePage.statusLatest')}
                    </span>
                )} />
                <Column body={renderActionButtons} header={t('storagePage.tableActions')} />
            </TreeTable>

            <MediaDialog
                visible={modalVisible}
                onHide={closeModal}
                projectId={project?.id}
                mediaToEdit={mediaToEdit}
                onUploadSuccess={refreshMedia}
            />

            <UpdateMediaVersionDialog
                visible={updateModalVisible}
                onHide={closeUpdateModal}
                projectId={project?.id}
                selectedMedia={mediaToUpdate}
                onUpdateSuccess={refreshMedia}
            />

            <Dialog visible={showConfirmDialog} header={t('storagePage.dialogConfirmDeletionHeader')} modal footer={
                <>
                    <Button label={t('storagePage.dialogConfirmDeletionNo')} icon="pi pi-times" onClick={() => setShowConfirmDialog(false)} className="p-button-text" />
                    <Button label={t('storagePage.dialogConfirmDeletionYes')} icon="pi pi-check" onClick={deleteConfirmed} className="p-button-text" />
                </>
            } onHide={() => setShowConfirmDialog(false)}>
                <p>{t('storagePage.dialogConfirmDeletionMessage')}</p>
            </Dialog>

            <Dialog
                visible={previewDialogVisible}
                header={`Preview: ${previewMedia?.filename}`}
                modal
                onHide={() => setPreviewDialogVisible(false)}
                style={{width: "70vw"}}
            >
                {previewMedia?.type === "IMAGE" ? (
                    <img src={previewMedia.link} alt={previewMedia.name} style={{width: "100%"}}/>
                ) : previewMedia?.type === "VIDEO" ? (
                    <video src={previewMedia.link} controls style={{width: "100%"}}/>
                ) : (
                    <p>{t('storagePage.dialogPreviewUnsupported')}</p>
                )}
            </Dialog>

        </div>
    );
};

export default StoragePage;
