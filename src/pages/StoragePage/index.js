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
import {APP_FUNCTIONS} from "../../constants/Function";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import {downloadMedia} from "../../utils/MediaUtil";
import MediaPreviewDialog from "../../components/MediaPreviewDialog";
import BarProgress from "../../components/BarProgress";
import {useBreadcrumb} from "../../contexts/BreadCrumbContext";
import {routeLink} from "../../router/Router";

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
    const functionList = useSelector((state) => state.project.currentCollab?.role.functionList)
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0); //search
    const { setBreadcrumbs } = useBreadcrumb();

    const size = 8;
    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setMediaToEdit(null);
    };

    const openUpdateModal = () => setUpdateModalVisible(true);
    const closeUpdateModal = () => {
        setUpdateModalVisible(false);
        setMediaToUpdate(null);
    };

    const refreshMedia = async (page = 0, size = 0) => {
        setLoading(true);
        try {
            const response = await getStorageMedia(project?.id, page, size);
            const mediaPage = response.data;

            const mainMediaList = mediaPage.mediaList.content || [];
            setTotalRecords(mediaPage.mediaList.totalElements);

            const previousVersionsList = mediaPage.additionalMediaList || [];

            const combinedList = [...mainMediaList, ...previousVersionsList];
            const formattedData = combinedList.map((file) => ({
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

            const rootNodes = formattedData.filter((file) => !childIds.has(file.key));

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
        if (project){
            const projectPath = routeLink.project.replace(":ownerUsername", project?.ownerUsername)
                .replace(":projectName", project?.name.replaceAll(" ", "_"));

            setBreadcrumbs([
                {label: project?.name, url: projectPath},
                {label: "Storage", url: projectPath + "/" + routeLink.projectTabs.storage}
            ]);
        }
    }, [project]);

    useEffect(() => {
        if (project?.id) {
            refreshMedia(0, size);
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

    const handleDownloadMedia = (media) => {
        try {
            downloadMedia(media);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file. Please try again later.');
        }
    };

    const allowedFunctions = new Set(functionList?.map(f => f.name));
    const renderActionButtons = (node) => {
        const buttonActions = [
            {
                function: APP_FUNCTIONS.UPDATE_MEDIA_INFO,
                icon: "pi pi-pencil",
                tooltip: t('storagePage.actionEdit'),
                onClick: () => { setMediaToEdit(node.data); openModal(); },
            },
            {
                function: APP_FUNCTIONS.UPDATE_MEDIA_VERSION,
                icon: "pi pi-arrow-up",
                tooltip: t('storagePage.actionUpdateVersion'),
                onClick: () => { setMediaToUpdate(node.data); openUpdateModal(); },
            },
            {
                function: APP_FUNCTIONS.DELETE_MEDIA,
                icon: "pi pi-trash",
                tooltip: t('storagePage.actionDelete'),
                onClick: () => handleDeleteMedia(node.data),
            },
            {
                icon: "pi pi-download",
                tooltip: t('storagePage.actionDownload'),
                onClick: () => handleDownloadMedia(node.data),
            },
            {
                icon: "pi pi-eye",
                tooltip: t('storagePage.actionPreview'),
                onClick: () => handlePreviewMedia(node.data),
            }
        ];

        return (
            <div className="action-buttons">
                {buttonActions
                    .filter(action => !action.function || allowedFunctions.has(action.function))
                    .map((action, index) => (
                        <Button key={index} icon={action.icon} className="p-button-text"
                                tooltip={action.tooltip} onClick={action.onClick} />
                    ))
                }
            </div>
        );
    };


    const handlePreviewMedia = (media) => {
        setPreviewMedia(media);
        setPreviewDialogVisible(true);
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
                    {allowedFunctions.has(APP_FUNCTIONS.ADD_MEDIA) && (
                        <BasicButton label={t('storagePage.newMediaButton')} onClick={openModal} />
                    )}
                </div>
            </div>
            {loading && <BarProgress />}
            <TreeTable
                value={filteredMediaTree} lazy paginator rows={size} first={first} totalRecords={totalRecords}
                onPage={(event) => {
                    setFirst(event.first);  //
                    refreshMedia(event.first / event.rows, event.rows);
                }}
            >
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
                onUploadSuccess={() => refreshMedia(first / size, size)} 
            />

            <UpdateMediaVersionDialog
                visible={updateModalVisible}
                onHide={closeUpdateModal}
                projectId={project?.id}
                selectedMedia={mediaToUpdate}
                onUpdateSuccess={() => refreshMedia(first / size, size)}
            />

            <Dialog visible={showConfirmDialog} header={t('storagePage.dialogConfirmDeletionHeader')} modal footer={
                <>
                    <Button label={t('storagePage.dialogConfirmDeletionNo')} icon="pi pi-times" onClick={() => setShowConfirmDialog(false)} className="p-button-text" />
                    <Button label={t('storagePage.dialogConfirmDeletionYes')} icon="pi pi-check" onClick={deleteConfirmed} className="p-button-text" />
                </>
            } onHide={() => setShowConfirmDialog(false)}>
                <p>{t('storagePage.dialogConfirmDeletionMessage')}</p>
            </Dialog>

            <MediaPreviewDialog
                visible={previewDialogVisible}
                onHide={() => setPreviewDialogVisible(false)}
                media={previewMedia}
            />

        </div>
    );
};

export default StoragePage;
