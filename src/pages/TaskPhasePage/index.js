    import React, {useEffect, useRef, useState} from "react";
    import './index.css'
    import BasicButton from "../../components/Button";
    import BarProgress from "../../components/BarProgress";
    import {TreeTable} from "primereact/treetable";
    import {Column} from "primereact/column";
    import {Paginator} from "primereact/paginator";
    import MoveTaskDialog from "../BacklogPage/MoveTaskDialog";
    import {Toast} from "primereact/toast";
    import {confirmDialog, ConfirmDialog} from "primereact/confirmdialog";
    import {useFetchProject} from "../../hooks/useFetchProject";
    import {useNotification} from "../../contexts/NotificationContext";
    import {useTranslation} from "react-i18next";
    import {useSelector} from "react-redux";
    import getAllCollabsKeyValue, {countAssignedTasks, hasPermission} from "../../utils/CollabUtil";
    import {
        assignTask,
        deleteTask,
        getTasksInBacklog,
        getTasksInPhase, moveTaskToBacklog,
        updateTask,
        updateTaskStatus
    } from "../../api/taskApi";
    import TypeBody from "../../components/TaskComponent/TypeBody";
    import ActionMenuButton from "../../components/ActionMenuButton";
    import StatusBody from "../../components/TaskComponent/StatusBody";
    import AssigneeBody from "../../components/TaskComponent/AssigneeBody";
    import {getDateAndTime} from "../../utils/DateTimeUtil";
    import {useParams} from "react-router-dom";
    import EditTaskDialog from "./EditTaskDialog";
    import UploadProofDialog from "./UploadProofDialog";
    import MultiAssigneeBody from "../../components/TaskComponent/MultiAssigneeBody";
    import {status} from "../../constants/Status";
    import Feedback from "./Feedback";
    
    const SIZE_PER_PAGE = 10;
    const TaskPhasePage = () => {
        const {phaseId} = useParams();
        const fetchProject = useFetchProject();
        const toast = useRef(null);
    
        const [tasks, setTasks] = useState([]);
        const [totalTasks, setTotalTasks] = useState(0);
        const [page, setPage] = useState(0);
        const [currentTaskId, setCurrentTaskId] = useState(-1)
        const [currentTask, setCurrentTask] = useState(null)
        const [currentTaskChild, setCurrentTaskChild] = useState([])
        const [collabs, setCollabs] = useState([])
        const [feedbackTask, setFeedbackTask] = useState(null);
    
        const [isUpdateTaskModalOpen, setIsUpdateTaskModalOpen] = useState(false);
        const [isMoveTaskModalOpen, setIsMoveTaskModalOpen] = useState(false);
        const [isUploadProofModelOpen, setIsUploadProofModelOpen] = useState(false);
        const [isFeedbackChatOpen, setIsFeedbackChatOpen] = useState(false);
    
        const [loading, setLoading] = useState(true);
        const [taskLoading, setTaskLoading] = useState(true);
        const showNotification = useNotification();
        const { t } = useTranslation();
    
        const projectId = useSelector((state) => state.project.currentProject?.id);
        const collabId = useSelector((state) => state.project.currentCollab?.id);
        const collabRole = useSelector((state) => state.project.currentCollab?.role.name);
        const functionList = useSelector((state) => state.project.currentCollab?.role?.functionList);
    
        const [isTaskEditable, setIsTaskEditable] = useState(false);
        const [isAssigneeEditable, setIsAssigneeEditable] = useState(false);
        const [isTaskDeletable, setIsTaskDeletable] = useState(false);
        const [isTaskMovable, setIsTaskMovable] = useState(false);
        const [isStatusUpdatable, setIsStatusUpdatable] = useState(false);
        const [isFeedbackable, setIsFeedbackable] = useState(false);
    
    
        useEffect(() => {
            fetchProject();
        }, []);
    
        useEffect(() => {
            setIsTaskEditable(hasPermission(functionList, "EDIT_TASK"));
            setIsAssigneeEditable(hasPermission(functionList, "ASSIGN_TASK"));
            setIsTaskDeletable(hasPermission(functionList, "DELETE_TASK"));
            setIsTaskMovable(hasPermission(functionList, "MOVE_TASK_TO_BACKLOG"));
            setIsStatusUpdatable(hasPermission(functionList, "UPDATE_TASK_STATUS"));
            setIsFeedbackable(hasPermission(functionList, "FEED_BACK"));
        }, [functionList]);
    
        const loadTasks = async () => {
            try {
                setTaskLoading(true);
                const response = await getTasksInPhase(phaseId, page, SIZE_PER_PAGE).finally(() => setTaskLoading(false));
                const taskList = response.data.content;
                setTasks(taskList);
                setTotalTasks(response.data.totalTasks)
            } catch (error) {
                console.error('Failed to load tasks:', error);
            }
        };
    
        const loadCollabs = async () => {
            try {
                const collabList = await getAllCollabsKeyValue(projectId);
                setCollabs(collabList);
            } catch (error) {
            }
        }
    
        useEffect(() => {
            loadTasks();
        }, [projectId, page]);
    
        useEffect(() => {
            if (projectId){
                loadCollabs();
            }
        }, [projectId]);
    
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
            }
        }
    
        const handleDeleteTask = async () => {
            try {
                const response = await deleteTask(currentTaskId)
                showNotification("success", t("backlogPage.deleteTask"), response.desc);
                loadTasks();
            } catch (error) {
                showNotification("error", t("backlogPage.deleteTask"), error.response.data.desc);
            }
        }
    
        const handleUpdateTaskStatus = async (data) => {
            try {
                if (data.status === "DONE") {
                    setCurrentTask(data);
                    setIsUploadProofModelOpen(true);
                } else {
                    const response = await updateTaskStatus(data.id, {
                        status: data.status,
                        proofList: []
                    });
                    showNotification("success", t("taskPage.updateStatus"), response.desc);
                }
                loadTasks();
            } catch (error) {
                showNotification("error", t("taskPage.updateStatus"), error.response.data.desc);
            }
        }
    
        const handleAssignTask = async (data) => {
            try {
                const response = await assignTask(data.id, data.assigneeId);
                showNotification("success", t("taskPage.assignTask"), response.desc);
                loadTasks();
            } catch (error) {
                showNotification("error", t("taskPage.assignTask"), error.response.data.desc);
            }
        }
    
        const handleMoveTaskToBacklog = async () =>{
            try {
                const response = await moveTaskToBacklog(currentTaskId)
                showNotification("success", t("backlogPage.moveTask"), response.desc);
                loadTasks();
            } catch (error) {
                showNotification("error", t("backlogPage.moveTask"), error.response.data.desc);
                loadTasks();
            }
        }
    
        const confirmDelete = () => {
            const accept = () => {
                handleDeleteTask();
            }
            confirmDialog({
                message: t("backlogPage.deleteConfirm"),
                header: t("backlogPage.confirmation"),
                icon: 'pi pi-exclamation-triangle',
                acceptClassName: 'p-button-danger',
                defaultFocus: 'reject',
                accept
            });
        };
    
        const confirmMove = () => {
            const accept = () => {
                handleMoveTaskToBacklog();
            }
            confirmDialog({
                message: t("taskPage.moveConfirm"),
                header: t("backlogPage.confirmation"),
                icon: 'pi pi-exclamation-triangle',
                defaultFocus: 'accept',
                accept
            });
        };
    
        const typeBody = (rowData) => {
            return (
                <TypeBody
                    rowData={rowData}
                    setCurrentTaskId={setCurrentTaskId}
                    handleUpdateTask={handleUpdateTask}
                    isTaskEditable={isTaskEditable && (rowData.data.status !== status[2].value)} // DONE status
                />
            );
        }
    
        const statusBody = (rowData) => {
            return (
                <StatusBody
                    rowData={rowData}
                    setCurrentTaskId={setCurrentTaskId}
                    handleUpdateTaskStatus={handleUpdateTaskStatus}
                    isStatusUpdatable={(isStatusUpdatable || collabId === rowData.data.assigneeId) && (rowData.data.status !== status[2].value)}
                />
            )
        }
    
        const assigneeBody = (rowData) => {
            const {assignedCount, totalChildren, assigneeIds} = countAssignedTasks(rowData);
            if (assignedCount === 0) {
                return (
                    <AssigneeBody
                        rowData={rowData}
                        collabs={collabs}
                        setCurrentTaskId={setCurrentTaskId}
                        handleAssignTask={handleAssignTask}
                        isAssigneeEditable={isAssigneeEditable && (rowData.data.status !== status[2].value)}
                    />
                )
            } else {
                return (
                    <>{collabs && collabs.length!==0 &&
                        <MultiAssigneeBody
                            collabs={collabs}
                            assigneeIds={assigneeIds}
                            partial={assignedCount < totalChildren}
                        />
                    }</>
                )
            }
        }
    
        const startTimeBody = (rowData) => {
            const { date, time } = getDateAndTime(rowData.data.startTime);
            return (
                <div style={{marginLeft: "1rem"}}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{date}</div>
                    <div style={{ color: 'gray', fontSize: '0.9em' }}>{time}</div>
                </div>
            );
        };
    
        const endTimeBody = (rowData) => {
            const { date, time } = getDateAndTime(rowData.data.endTime);
            return (
                <div style={{marginLeft: "1rem"}}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{date}</div>
                    <div style={{ color: 'gray', fontSize: '0.9em' }}>{time}</div>
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
                label: t("taskPage.moveTask"),
                icon: 'pi pi-arrow-up-right',
                command: () => {
                    confirmMove()
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
            {
                label: t("taskPage.feedback"),
                icon: 'pi pi-comment',
                command: () => {
                    setFeedbackTask(currentTask);
                    setIsFeedbackChatOpen(true);
                },
                visible:   ((currentTask?.assigneeId && currentTask?.assigneeId === collabId) || isFeedbackable) &&
                    currentTaskChild.length === 0
            }
        ]
    
        const actionBody = (rowData) => {
            const taskAssigneeId = rowData.data.assigneeId;
    
            const canShowActions =
                taskAssigneeId === collabId ||
                isTaskEditable ||
                isTaskMovable ||
                isTaskDeletable ||
                isFeedbackable;
    
            if (!canShowActions) return null;
    
            return (
                <div style={{ marginLeft: "1rem" }}
                     onClick={() => {
                         setCurrentTaskId(rowData.data.id);
                         setCurrentTask(rowData.data);
                         setCurrentTaskChild(rowData.children);
                     }}>
                    <ActionMenuButton
                        items={actions}
                        direction="right"
                        customSize="2.4rem"
                    />
                </div>
            );
        };
    
        const handleCloseEditTaskModel = () => {
            setIsUpdateTaskModalOpen(false);
            loadTasks();
        }
    
        const handleCloseMoveTaskModel = () => {
            setIsMoveTaskModalOpen(false);
            loadTasks();
        }
    
        const handleCloseUpdateProofModel = () => {
            setIsUploadProofModelOpen(false);
            loadTasks();
        }
    
        const handleCloseFeedbackChat = () => {
            setIsFeedbackChatOpen(false);
        }
    
        return (
            <div className="task-tree-page" style={{ padding: "2rem", position: "relative" }}>
                <h2>{t("taskPage.taskList")}</h2>
                {taskLoading && <BarProgress />}
                <TreeTable
                    value={tasks}
                    paginator={false}
                    lazy
                >
                    <Column field="name" header={t("backlogPage.name")} expander style={{ width: '35%' }}></Column>
                    <Column body={typeBody} header={t("backlogPage.type")} style={{ width: '16%' }}></Column>
                    <Column body={assigneeBody} header={t("taskPage.assignee")} style={{ width: '16%' }}></Column>
                    <Column body={statusBody} header={t("phasePage.status")} style={{ width: '17%' }}></Column>
                    <Column body={startTimeBody} header={t("backlogPage.startTime")} style={{ width: '12%' }}></Column>
                    <Column body={endTimeBody} header={t("backlogPage.endTime")} style={{ width: '12%' }}></Column>
                    <Column body={actionBody} header={t("backlogPage.action")}></Column>
                </TreeTable>
                <Paginator
                    first={page * SIZE_PER_PAGE}
                    rows={SIZE_PER_PAGE}
                    totalRecords={totalTasks}
                    onPageChange={(e) => setPage(e.page)}
                />
    
                {isUpdateTaskModalOpen && <EditTaskDialog onClose={handleCloseEditTaskModel} currentData={currentTask}/>}
                {isMoveTaskModalOpen && <MoveTaskDialog onClose={handleCloseMoveTaskModel} currentData={currentTask}/>}
                {isUploadProofModelOpen && <UploadProofDialog onClose={handleCloseUpdateProofModel} currentData={currentTask} /> }
                {isFeedbackChatOpen && <Feedback key={feedbackTask?.id} onClose={handleCloseFeedbackChat} taskData={feedbackTask} />}
    
    
                <Toast ref={toast} />
                <ConfirmDialog />
            </div>
        )
    }
    
    export default TaskPhasePage;