import React, {useEffect, useRef, useState} from "react";
import './index.css'
import BasicButton from "../../components/Button";
import {TreeTable} from "primereact/treetable";
import {Column} from "primereact/column";
import {Toast} from "primereact/toast";
import {confirmDialog, ConfirmDialog} from "primereact/confirmdialog";
import {useFetchProject} from "../../hooks/useFetchProject";
import {useSelector} from "react-redux";
import {deleteTask, getTasksInBacklog, updateTask} from "../../api/taskApi";
import {taskType} from "../../constants/TaskType";
import DropDownField from "../../components/DropDownField";
import TaskIcon from '../../assets/icons/task_icon.png'
import StoryIcon from '../../assets/icons/story_icon.png'
import BugIcon from '../../assets/icons/bug_icon.png'
import VeryHighIcon from '../../assets/icons/very_high_icon.png'
import HighIcon from '../../assets/icons/high_icon.png'
import MediumIcon from '../../assets/icons/medium_icon.png'
import LowIcon from '../../assets/icons/low_icon.png'
import VeryLowIcon from '../../assets/icons/very_low_icon.png'
import {priority} from "../../constants/Priority";
import {Paginator} from "primereact/paginator";
import {Button} from "primereact/button";
import AddTaskDialog from "./AddTaskDialog";
import {useNotification} from "../../contexts/NotificationContext";
import ActionMenuButton from "../../components/ActionMenuButton";
import EditTaskDialog from "./EditTaskDialog";
import MoveTaskDialog from "./MoveTaskDialog";
import {hasPermission} from "../../utils/CollabUtil";
import {useTranslation} from "react-i18next";
import BarProgress from "../../components/BarProgress";

const SIZE_PER_PAGE = 10;
const BacklogPage = () => {
    const fetchProject = useFetchProject();
    const toast = useRef(null);

    const [tasks, setTasks] = useState([]);
    const [totalTasks, setTotalTasks] = useState(0);
    const [page, setPage] = useState(0);
    const [currentTaskId, setCurrentTaskId] = useState(-1)
    const [currentTask, setCurrentTask] = useState(null)

    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [isCreateSubTaskModalOpen, setIsCreateSubTaskModalOpen] = useState(false);
    const [isUpdateTaskModalOpen, setIsUpdateTaskModalOpen] = useState(false);
    const [isMoveTaskModalOpen, setIsMoveTaskModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const showNotification = useNotification();
    const { t } = useTranslation();

    const projectId = useSelector((state) => state.project.currentProject?.id);
    const functionList = useSelector((state) => state.project.currentCollab?.role?.functionList);

    const [isTaskAddable, setIsTaskAddable] = useState(false);
    const [isTaskEditable, setIsTaskEditable] = useState(false);
    const [isTaskDeletable, setIsTaskDeletable] = useState(false);
    const [isTaskMovable, setIsTaskMovable] = useState(false);

    useEffect(() => {
        fetchProject();
    }, []);

    useEffect(() => {
        setIsTaskAddable(hasPermission(functionList, "EDIT_TASK"));
        setIsTaskEditable(hasPermission(functionList, "EDIT_TASK"));
        setIsTaskDeletable(hasPermission(functionList, "DELETE_TASK"));
        setIsTaskMovable(hasPermission(functionList, "MOVE_TASK_TO_PHASE"));
    }, [functionList]);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const response = await getTasksInBacklog(projectId, page, SIZE_PER_PAGE).finally(() => setLoading(false));
            const taskList = response.data.content;
            setTasks(taskList);
            setTotalTasks(response.data.totalTasks)
        } catch (error) {
            console.error('Failed to load tasks:', error);
        }
    };

    useEffect(() => {
        loadTasks();
    }, [projectId, page]);

    const handleUpdateTask = async (data) => {
        try {
            const response = await updateTask(data.id, {
                name: data.name,
                type: data.type,
                description: data.description,
                priority: data.priority,
            });
            showNotification("success", t("backlogPage.updateTask"), response.desc)
            loadTasks();
        } catch (error) {
            showNotification("error", t("backlogPage.updateTask"), error.response.data.desc);
            loadTasks();
        }
    }

    const handleDeleteTask = async () => {
        try {
            const response = await deleteTask(currentTaskId)
            showNotification("success", t("backlogPage.deleteTask"), response.desc);
            loadTasks();
        } catch (error) {
            showNotification("error", t("backlogPage.deleteTask"), error.response.data.desc);
            loadTasks();
        }
    }
    const accept = () => {
        handleDeleteTask();
    }
    const confirmDelete = () => {
        confirmDialog({
            message: t("backlogPage.deleteConfirm"),
            header: t("backlogPage.confirmation"),
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            defaultFocus: 'reject',
            accept
        });
    };

    const addTaskBody = (rowData) => {
        return (
            <Button
                icon="pi pi-plus-circle"
                rounded={true}
                text={true}
                raised={false}
                onClick={()=>{setCurrentTaskId(rowData.data.id); setIsCreateSubTaskModalOpen(true)}}
                disabled={!isTaskAddable}
            />
        );
    };

    const typeBody = (rowData) => {
        const getTypeIcon = (type) => {
            switch(type) {
                case 'STORY':
                    return StoryIcon;
                case 'TASK':
                    return TaskIcon;
                case 'BUG':
                    return BugIcon;
            }
        }

        const itemTemplate = (option) => {
            return (
                <div className="flex align-items-center">
                    <img alt={option.value} src={getTypeIcon(option.value)} style={{ width: '1.4rem', marginRight:"0.5rem" }} />
                    <div>{option.label}</div>
                </div>
            );
        };

        return (
            <div style={{marginRight: "2rem"}}>
                <DropDownField
                    selected={rowData.data.type}
                    options={taskType}
                    onChange={(e) => {
                        setCurrentTaskId(rowData.data.id);
                        rowData.data.type = e.value;
                        handleUpdateTask(rowData.data);
                    }}
                    itemTemplate={itemTemplate}
                    valueTemplate={itemTemplate}
                    disabled={!isTaskEditable}
                />
            </div>
        );
    };

    const priorityBody = (rowData) => {
        const getPriorityIcon = (priority) => {
            switch(priority) {
                case 'VERY_HIGH':
                    return VeryHighIcon;
                case 'HIGH':
                    return HighIcon;
                case 'MEDIUM':
                    return MediumIcon;
                case 'LOW':
                    return LowIcon;
                case 'VERY_LOW':
                    return VeryLowIcon;
            }
        }

        const itemTemplate = (option) => {
            return (
                <div className="flex align-items-center">
                    <img alt={option.value} src={getPriorityIcon(option.value)} style={{ width: '1.4rem', marginRight:"0.5rem" }} />
                    <div>{option.label}</div>
                </div>
            );
        };

        return (
            <div style={{ marginRight: "0.8rem" }}>
                <DropDownField
                    selected={rowData.data.priority}
                    options={priority}
                    onChange={(e) => {
                        setCurrentTaskId(rowData.data.id);
                        rowData.data.priority = e.value;
                        handleUpdateTask(rowData.data);
                    }}
                    itemTemplate={itemTemplate}
                    valueTemplate={itemTemplate}
                    disabled={!isTaskEditable}
                />
            </div>
        );
    };


    const actions = [
        {
            label: t("backlogPage.edit"),
            icon: 'pi pi-pencil',
            command: () => {
                setIsUpdateTaskModalOpen(true);
            },
            visible: isTaskEditable
        },
        {
            label: t("backlogPage.moveToPhase"),
            icon: 'pi pi-arrow-up-right',
            command: () => {
                setIsMoveTaskModalOpen(true)
            },
            visible: isTaskMovable
        },
        {
            label: t("backlogPage.delete"),
            icon: 'pi pi-trash',
            command: () => {
                confirmDelete();
            },
            visible: isTaskDeletable
        },
    ]

    const actionBody = (rowData) => {
        return (
            <div
                style={{marginLeft:"1rem"}}
                onClick={()=>{
                    setCurrentTaskId(rowData.data.id);
                    setCurrentTask(rowData.data);
                }}>
                <ActionMenuButton
                    items={actions}
                    direction="right"
                    customSize="2.4rem"
                />
            </div>
        );
    };

    const handleCloseTaskModel = () => {
        setIsCreateTaskModalOpen(false);
        loadTasks();
    }
    const handleCloseSubTaskModel = () => {
        setIsCreateSubTaskModalOpen(false);
        loadTasks();
    }
    const handleCloseEditTaskModel = () => {
        setIsUpdateTaskModalOpen(false);
        loadTasks();
    }

    const handleCloseMoveTaskModel = () => {
        setIsMoveTaskModalOpen(false);
        loadTasks();
    }

    return (
        <div className="task-tree-page" style={{ padding: "2rem" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Backlogs</h2>
                <BasicButton
                    label={t("backlogPage.newIssue")}
                    icon="pi pi-plus"
                    onClick={() => {setIsCreateTaskModalOpen(true)}}
                    visible={isTaskAddable}
                />
            </div>
            {loading && <BarProgress />}
            <TreeTable
                value={tasks}
                paginator={false}
                lazy
            >
                {isTaskAddable && <Column body={addTaskBody} header="" style={{ width: '7%' }}></Column>}
                <Column field="name" header={t("backlogPage.name")} expander style={{ width: '35%' }}></Column>
                <Column body={typeBody} header={t("backlogPage.type")} style={{ width: '16%' }}></Column>
                <Column body={priorityBody} header={t("backlogPage.priority")} style={{ width: '16%' }}></Column>
                {(isTaskEditable || isTaskMovable || isTaskDeletable) &&
                    <Column body={actionBody} header={t("backlogPage.action")}></Column>}
            </TreeTable>
            <Paginator
                first={page * SIZE_PER_PAGE}
                rows={SIZE_PER_PAGE}
                totalRecords={totalTasks}
                onPageChange={(e) => setPage(e.page)}
            />

            {isCreateTaskModalOpen && <AddTaskDialog onClose={handleCloseTaskModel}/>}
            {isCreateSubTaskModalOpen && <AddTaskDialog onClose={handleCloseSubTaskModel} currentTaskId={currentTaskId}/>}
            {isUpdateTaskModalOpen && <EditTaskDialog onClose={handleCloseEditTaskModel} currentData={currentTask}/>}
            {isMoveTaskModalOpen && <MoveTaskDialog onClose={handleCloseMoveTaskModel} currentData={currentTask}/>}

            <Toast ref={toast} />
            <ConfirmDialog />
        </div>
    )
}

export default BacklogPage;