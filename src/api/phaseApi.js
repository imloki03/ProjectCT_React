import axiosInstance from "../config/ApiConfig";

export const createNewPhase = async (projectId, phaseReq) => {
    const response = await axiosInstance.post(`project/phases/${projectId}`, phaseReq);
    return response.data;
};

export const getPhase = async (phaseId) => {
    const response = await axiosInstance.get(`project/phases/${phaseId}`);
    return response.data;
};

export const getAllPhases = async (projectId) => {
    const response = await axiosInstance.get(`project/phases/p/${projectId}`);
    return response.data;
};

export const updatePhase = async (phaseId, updatePhaseReq) => {
    const response = await axiosInstance.put(`project/phases/${phaseId}`, updatePhaseReq);
    return response.data;
};

export const deletePhase = async (phaseId) => {
    const response = await axiosInstance.delete(`project/phases/${phaseId}`);
    return response.data;
};