import axiosInstance from "../config/ApiConfig";

export const getTask = async (taskId) => {
    const response = await axiosInstance.get(`project/tasks/${taskId}`);
    return response.data.data;
};
export const getTasksInBacklog = async (projectId, page, size) => {
    const response = await axiosInstance.get(`project/tasks/backlog/${projectId}?page=${page}&size=${size}`);
    return response.data;
};

export const getTasksInPhase = async (phaseId, page, size) => {
    const response = await axiosInstance.get(`project/tasks/phase/${phaseId}?page=${page}&size=${size}`);
    return response.data;
};

export const createNewTask = async (projectId, taskReq) => {
    const response = await axiosInstance.post(`project/tasks/${projectId}`, taskReq);
    return response.data;
};

export const updateTask = async (taskId, updateTaskReq) => {
    const response = await axiosInstance.put(`project/tasks/${taskId}`, updateTaskReq);
    return response.data;
};

export const moveTaskToPhase = async (taskId, phaseId, updateTaskReq) => {
    const response = await axiosInstance.patch(`project/tasks/move/${taskId}/${phaseId}`, updateTaskReq);
    return response.data;
};

export const deleteTask = async (taskId) => {
    const response = await axiosInstance.delete(`project/tasks/${taskId}`);
    return response.data;
};

export const assignTask = async (taskId, collabId) => {
    const response = await axiosInstance.patch(`project/tasks/assign/${taskId}/${collabId}`);
    return response.data;
};

export const updateTaskStatus = async (taskId, updateStatusReq) => {
    const response = await axiosInstance.patch(`project/tasks/${taskId}`, updateStatusReq);
    return response.data;
};

export const moveTaskToBacklog = async (taskId) => {
    const response = await axiosInstance.patch(`project/tasks/move/${taskId}`);
    return response.data;
};