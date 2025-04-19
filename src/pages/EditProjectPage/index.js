import React, { useEffect, useState } from 'react';
import './index.css';
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import BasicButton from "../../components/Button";
import TextField from "../../components/TextField";
import TextFieldArea from "../../components/TextFieldArea";
import FileUploader from "./FileUploader/FileUploader";
import { Dialog } from "primereact/dialog";
import { useFetchProject } from "../../hooks/useFetchProject";
import { useSelector } from "react-redux";
import Avatar from "../../components/Avatar";
import { routeLink } from "../../router/Router";
import { useBreadcrumb } from "../../contexts/BreadCrumbContext";
import { useNotification } from "../../contexts/NotificationContext";
import { uploadFileToFirebase } from "../../config/firebaseConfig";
import { deleteProject, updateProject } from "../../api/projectApi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Skeleton } from 'primereact/skeleton';

const EditProject = () => {
    const { t } = useTranslation();
    const fetchProject = useFetchProject();
    const project = useSelector((state) => state.project.currentProject);
    const user = useSelector((state) => state.user.currentUser);
    const [showDialog, setShowDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setBreadcrumbs } = useBreadcrumb();
    const showNotification = useNotification();

    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const [hasChanges, setHasChanges] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProject();
    }, []);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || ''
            });
        }
    }, [project]);

    useEffect(() => {
        if (project && user) {
            const projectPath = routeLink.project
                .replace(":ownerUsername", project?.ownerUsername)
                .replace(":projectName", project?.name.replaceAll(" ", "_"));

            setBreadcrumbs([
                { label: project?.name, url: projectPath },
                { label: t("editProject.breadcrumb.edit"), url: `${projectPath}/${routeLink.projectTabs.editProject}` }
            ]);
        }
    }, [project, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        const updatedFormData = {
            ...formData,
            [name]: value
        };

        setFormData(updatedFormData);

        if (project) {
            const isNameChanged = updatedFormData.name.trim() !== (project.name || '').trim();
            const isDescriptionChanged = updatedFormData.description.trim() !== (project.description || '').trim();

            setHasChanges(isNameChanged || isDescriptionChanged);
        }
    };

    const handleSave = async () => {
        if (!project) return;
        setLoading(true);
        try {
            const updateRequest = {
                name: formData.name,
                description: formData.description,
                avatarURL: project.avatarURL,
            };

            const response = await updateProject(updateRequest, project.id);

            showNotification("success", t("editProject.updatedTitle"), response.desc || t("editProject.updatedDesc"));
            setHasChanges(false);

            const newProjectPath = routeLink.project
                .replace(":ownerUsername", project.ownerUsername)
                .replace(":projectName", formData.name.replaceAll(" ", "_"));

            const currentPath = window.location.pathname;
            if (!currentPath.includes(newProjectPath)) {
                navigate(`${newProjectPath}/${routeLink.projectTabs.editProject}`, { replace: true });
                const projectPath = routeLink.project
                    .replace(":ownerUsername", project?.ownerUsername)
                    .replace(":projectName", project?.name.replaceAll(" ", "_"));
                setBreadcrumbs([
                    { label: formData.name, url: projectPath },
                    { label: t("editProject.breadcrumb.edit"), url: `${projectPath}/${routeLink.projectTabs.editProject}` }
                ]);
            }
            else
                fetchProject();
        } catch (error) {
            showNotification("error", t("editProject.updateFailedTitle"), error?.response?.data?.desc || t("editProject.updateFailedDesc"));
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (event) => {
        const file = event.files[0];
        if (!file) return;
        setLoading(true);
        try {
            const { fileUrl } = await uploadFileToFirebase(file);
            const updateRequest = {
                name: formData.name,
                description: formData.description,
                avatarURL: fileUrl,
            }
            const response = await updateProject(updateRequest, project.id);
            showNotification("success", t("editProject.uploadSuccessTitle"), response.desc);
        } catch (error) {
            showNotification("error", t("editProject.uploadFailedTitle"), error.response.data.desc);
        } finally {
            setLoading(false);
            setShowDialog(false);
            fetchProject();
        }
    };

    const handleDelete = async () => {
        if (!project) return;
        setLoading(true);
        try {
            const response = await deleteProject(project.id);
            showNotification("success", t("editProject.deleteSuccessTitle"), response.desc || t("editProject.deleteSuccessDesc"));
            navigate("/");
        } catch (error) {
            showNotification("error", t("editProject.deleteFailedTitle"), error?.response?.data?.desc || t("editProject.deleteFailedDesc"));
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = () => {
        const accept = () => {
            handleDelete();
        }
        confirmDialog({
            message: t("editProject.confirmDeleteMessage"),
            header: t("editProject.confirmDeleteHeader"),
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            defaultFocus: 'reject',
            accept
        });
    }

    return (
        <div className="edit-project-container">
            <Card title={t("editProject.title")} style={{ width: "500px" }}>
                {loading || !project ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: "1rem"  }}>
                        <Skeleton width="10rem" height="10rem" shape={"circle"} />
                    </div>
                ) : (
                    <div className="avatar-container">
                        <Avatar label={project?.name} image={project?.avatarURL} customSize={"10rem"} />
                        <div
                            className="avatar-hover-icon"
                            onClick={() => setShowDialog(true)}
                        >
                            <i className="pi pi-pencil" style={{ fontSize: "1.5rem" }} />
                        </div>
                    </div>
                )}

                <div style={{ marginBottom: "1.5rem" }}>
                    {loading || !project ? (
                        <Skeleton width="100%" height="2rem" />
                    ) : (
                        <TextField
                            label={t("editProject.nameLabel")}
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    )}
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                    {loading || !project ? (
                        <Skeleton width="100%" height="5rem" />
                    ) : (
                        <TextFieldArea
                            label={t("editProject.descriptionLabel")}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                        />
                    )}
                </div>
                <BasicButton
                    label={t("editProject.saveButton")}
                    width="100%"
                    icon="pi pi-save"
                    type="button"
                    onClick={handleSave}
                    disabled={loading || !hasChanges}
                    style={{ marginTop: "1.4rem" }}
                />
                <Button
                    label={t("editProject.deleteButton")}
                    width="100%"
                    icon="pi pi-trash"
                    onClick={() => { confirmDelete() }}
                    disabled={loading}
                    severity="danger"
                    style={{ marginTop: "1.4rem" }}
                />
            </Card>

            <Dialog header={t("editProject.uploadDialogTitle")} visible={showDialog} style={{ width: "50rem" }} onHide={() => setShowDialog(false)}>
                <FileUploader
                    uploadHandler={handleAvatarChange}
                    accept="image/*"
                    maxFileSize={5000000}
                />
            </Dialog>
            <ConfirmDialog />
        </div>
    );
};

export default EditProject;
