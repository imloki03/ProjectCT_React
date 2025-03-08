import axiosInstance from "../config/ApiConfig";

const projectPrefix = "collab/collabs";

export const getAllCollabOfProject = async (projectId) => {
    const response = await axiosInstance.get(`${projectPrefix}/p/${projectId}`);
    return response.data;
};

export const getCurrentCollab = async (projectId) => {
    const response = await axiosInstance.get(`${projectPrefix}/current/p/${projectId}`);
    return response.data;
};