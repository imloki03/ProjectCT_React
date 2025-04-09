import React, {useEffect, useRef, useState} from "react";
import {useFetchProject} from "../../hooks/useFetchProject";
import {useSelector} from "react-redux";
import {deleteCollaborator, getAllCollabOfProject, updateCollabRole} from "../../api/collabApi";
import BarProgress from "../../components/BarProgress";
import BasicButton from "../../components/Button";
import {TreeTable} from "primereact/treetable";
import {Column} from "primereact/column";
import {Toast} from "primereact/toast";
import {confirmDialog, ConfirmDialog} from "primereact/confirmdialog";
import DropDownField from "../../components/DropDownField";
import {useTranslation} from "react-i18next";
import {useNotification} from "../../contexts/NotificationContext";
import {Button} from "primereact/button";
import Avatar from "../../components/Avatar";
import {deleteRole, getAllRolesOfProject} from "../../api/roleApi";
import {TabPanel, TabView} from "primereact/tabview";
import ActionMenuButton from "../../components/ActionMenuButton";
import AddCollabDialog from "./AddCollabDialog";
import AddRoleDialog from "./AddRoleDialog";
import EditRoleDialog from "./EditRoleDialog";
import {hasPermission} from "../../utils/CollabUtil";
import {useBreadcrumb} from "../../contexts/BreadCrumbContext";
import {routeLink} from "../../router/Router";

const CollabPage = () => {
    const toast = useRef(null);
    const fetchProject = useFetchProject();

    const [collabs, setCollabs] = useState([]);
    const [selectedCollab, setSelectedCollab] = useState(null);
    const [roles, setRoles] = useState();
    const [roleList, setRoleList] = useState();
    const [currentRole, setCurrentRole] = useState();
    const [ownerRoleId, setOwnerRoleId] = useState(null);

    const [isAddCollabModalOpen, setIsAddCollabModalOpen] = useState(false);
    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
    const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);

    const showNotification = useNotification();
    const { t } = useTranslation();

    const project = useSelector((state) => state.project.currentProject);
    const projectId = useSelector((state) => state.project.currentProject?.id);

    const collabId = useSelector((state) => state.project.currentCollab?.id);
    const collabRole = useSelector((state) => state.project.currentCollab?.role.id);
    const functionList = useSelector((state) => state.project.currentCollab?.role?.functionList);

    const [isCollabAddable, setIsCollabAddable] = useState(false);
    const [isPermissionUpdatable, setIsPermissionUpdatable] = useState(false);
    const [isCollabDeletable, setIsCollabDeletable] = useState(false);
    const [isRoleManagable, setIsRoleManagable] = useState(false);

    const { setBreadcrumbs } = useBreadcrumb();

    useEffect(() => {
        setIsCollabAddable(hasPermission(functionList, "ADD_COLLABORATOR"));
        setIsPermissionUpdatable(hasPermission(functionList, "UPDATE_COLLABORATOR_ROLE"));
        setIsCollabDeletable(hasPermission(functionList, "REMOVE_COLLABORATOR"));
    }, [functionList]);

    useEffect(() => {
        setIsRoleManagable(ownerRoleId === collabRole);
    }, [ownerRoleId, collabRole]);

    useEffect(() => {
        fetchProject();
    }, []);

    useEffect(() => {
        const projectPath = routeLink.project.replace(":ownerUsername", project?.ownerUsername)
            .replace(":projectName", project?.name.replaceAll(" ", "_"));

        setBreadcrumbs([
            {label: project?.name, url: projectPath},
            {label: t("collabPage.collaborator"), url: projectPath + "/" + routeLink.projectTabs.collaborator}
        ]);
    }, [project]);

    useEffect(() => {
        if (projectId){
            loadCollaborators();
            loadRoles();
        }
    }, [projectId]);

    const loadCollaborators = async () => {
        try {
            setLoading(true);
            const response = await getAllCollabOfProject(projectId).finally(() => setLoading(false));
            // const filteredCollab = response.data.filter(collab => collab.user.username !== project.ownerUsername);
            const treeData = response.data.map((item) => ({
                key: item.id.toString(),
                data: {
                    id: item.id,
                    userId: item.userId,
                    username: item.user.username,
                    name: item.user.name,
                    avatarURL: item.user.avatarURL,
                    role: item.role.id
                },
                children: []
            }));
            setCollabs(treeData);

            const ownerRole = response.data.find(collab => collab.userId === project.ownerId);
            setOwnerRoleId(ownerRole.role.id);
        } catch (error) {
            console.error('Failed to fetch collaborators:', error);
        }
    };

    const loadRoles = async () => {
        try {
            const response = await getAllRolesOfProject(projectId);
            setRoles(response.data.map(role => ({
                label: role.name,
                value: role.id
            })))

            const treeData = response.data.map((item) => ({
                key: item.id.toString(),
                data: item,
                children: []
            }));
            setRoleList(treeData);
        } catch (e) {
            console.error('Failed to fetch roles:', e);
        }
    }

    const handleUpdatePermission = async (data) => {
        try {
            const response = await updateCollabRole(data.id, data.role);
            showNotification("success", t("collabPage.updateRole"), response.desc);
            loadCollaborators();
        } catch (error) {
            showNotification("error", t("collabPage.updateRole"), error.response.data.desc);
            loadCollaborators();
        }
    }

    const handleDeleteCollab = async (id) => {
        try {
            const response = await deleteCollaborator(id);
            showNotification("success", t("collabPage.deleteCollab"), response.desc)
            loadCollaborators();
        } catch (error) {
            showNotification("error", t("collabPage.deleteCollab"), error.response.data.desc);
            loadCollaborators();
        }
    }

    const handleDeleteRole = async (id) => {
        try {
            const response = await deleteRole(id);
            showNotification("success", t("collabPage.deleteRole"), response.desc)
            loadRoles();
        } catch (error) {
            showNotification("error", t("collabPage.deleteRole"), error.response.data.desc);
            loadRoles();
        }
    }

    const handleCloseCollabModel = () => {
        setIsAddCollabModalOpen(false);
        loadCollaborators();
    }

    const handleCloseRoleModel = () => {
        setIsAddRoleModalOpen(false);
        loadRoles();
    }

    const handleCloseEditRoleModel = () => {
        setIsEditRoleModalOpen(false);
        loadRoles();
    }

    const roleBody = (rowData) => {
        return (
            <div style={{marginRight: "5rem"}}>
                <DropDownField
                    selected={rowData.data.role}
                    options={roles}
                    onChange={(e) => {
                        rowData.data.role = e.value;
                        handleUpdatePermission(rowData.data);
                    }}
                    disabled={!isPermissionUpdatable  || rowData.data.userId === project.ownerId}
                />
            </div>
        );
    };

    const confirmDelete = (id) => {
        const accept = () => {
            handleDeleteCollab(id);
        }
        confirmDialog({
            message: t("collabPage.deleteCollabConfirm"),
            header: t("backlogPage.confirmation"),
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            defaultFocus: 'reject',
            accept
        });
    }

    const confirmDeleteRole = () => {
        const accept = () => {
            handleDeleteRole(currentRole.id);
        }
        confirmDialog({
            message: t("collabPage.deleteRoleConfirm"),
            header: t("backlogPage.confirmation"),
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            defaultFocus: 'reject',
            accept
        });
    }

    const deleteBody = (rowData) => {
        return (
            <div>
                {rowData.data.userId !== project.ownerId &&
                    <Button
                        icon="pi pi-trash"
                        rounded={true}
                        text={true}
                        raised={false}
                        onClick={()=>{setSelectedCollab(rowData.data);
                            console.log(rowData.data); confirmDelete(rowData.data.id)}}
                        style={{color: "#fc5353", marginLeft: "0.8rem"}}
                    />
                }
            </div>
        );
    };

    const nameBody = (rowData) => {
        return (
            <div className="flex align-items-center">
                <div style={{marginRight: "0.3rem"}}>
                    <Avatar
                        label={rowData.data.name}
                        image={rowData.data.avatarURL}
                        customSize="1.4rem"
                    />
                </div>
                <div>{rowData.data.name}</div>
            </div>
        )
    }

    const actions = [
        {
            label: t("backlogPage.edit"),
            icon: 'pi pi-pencil',
            command: () => {
                setIsEditRoleModalOpen(true);
            },
            // visible: isTaskEditable
        },
        {
            label: t("backlogPage.delete"),
            icon: 'pi pi-trash',
            command: () => {
                confirmDeleteRole();
            },
            // visible: isTaskDeletable
        },
    ]

    const actionBody = (rowData) => {
        return (
            <div
                style={{marginLeft:"1rem"}}
                onClick={()=>{
                    setCurrentRole(rowData.data);
                }}>
                <ActionMenuButton
                    items={actions}
                    direction="right"
                    customSize="2.4rem"
                />
            </div>
        );
    };

    return (
        <TabView>
            <TabPanel header={t("collabPage.collaborator")}>
                <div className="task-tree-page" style={{ padding: "2rem", paddingTop: "0" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>{t("collabPage.collabManage")}</h2>
                        <BasicButton
                            label={t("collabPage.collaborator")}
                            icon="pi pi-plus"
                            onClick={() => { setIsAddCollabModalOpen(true) }}
                            visible={isCollabAddable}
                        />
                    </div>
                    {loading && <BarProgress />}
                    <TreeTable value={collabs}>
                        <Column field="username" header={t("authPage.username")} style={{ width: '16%' }} sortable></Column>
                        <Column body={nameBody} header={t("backlogPage.name")} style={{ width: '30%' }}></Column>
                        <Column body={roleBody} header={t("collabPage.role")} style={{ width: '30%' }}></Column>
                        {
                            isCollabDeletable &&
                            <Column body={deleteBody} header={t("backlogPage.action")}></Column>
                        }
                    </TreeTable>

                    {isAddCollabModalOpen && <AddCollabDialog onClose={handleCloseCollabModel}/>}

                    <Toast ref={toast} />
                    <ConfirmDialog />
                </div>
            </TabPanel>
            {
                isRoleManagable &&
                <TabPanel header={t("collabPage.roles")}>
                    <div className="task-tree-page" style={{ padding: "2rem", paddingTop: "0" }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>{t("collabPage.roleManage")}</h2>
                            <BasicButton
                                label={t("collabPage.role")}
                                icon="pi pi-plus"
                                onClick={() => { setIsAddRoleModalOpen(true) }}
                            />
                        </div>

                        {loading && <BarProgress />}
                        <div style={{ paddingRight: "50%" }}>
                            <TreeTable value={roleList}>
                                <Column field="name" header={t("collabPage.roleName")} style={{ width: '50%' }}></Column>
                                <Column body={actionBody} header={t("backlogPage.action")}></Column>
                            </TreeTable>
                        </div>

                        {isAddRoleModalOpen && <AddRoleDialog onClose={handleCloseRoleModel}/>}
                        {isEditRoleModalOpen && <EditRoleDialog onClose={handleCloseEditRoleModel} currentRole={currentRole}/>}

                        <Toast ref={toast} />
                        <ConfirmDialog />
                    </div>
                </TabPanel>
            }
        </TabView>
    )
}

export default CollabPage;