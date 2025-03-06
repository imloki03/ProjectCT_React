import axiosInstance from "../config/ApiConfig";

const projectPrefix = "project/projects";

export const getAllProjects = async () => {
    const response = await axiosInstance.get(`${projectPrefix}`);
    return response.data;
};

export const createNewProject = async (projectRequest) => {
    const response = await axiosInstance.post(`${projectPrefix}`, projectRequest);
    return response.data;
};