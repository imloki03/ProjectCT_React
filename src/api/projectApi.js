import axiosInstance from "../config/ApiConfig";

const projectPrefix = "project/projects";

export const getAllProjects = async () => {
    const response = await axiosInstance.get(`${projectPrefix}`);
    return response.data;
};

export const getProject = async (projectId) => {
    const response = await axiosInstance.get(`${projectPrefix}/${projectId}`);
    return response.data;
};

export const getProjectByOwnerAndName = async (ownerUsername, projectName) => {
    const response = await axiosInstance.get(`${projectPrefix}/${ownerUsername}/${projectName}`);
    return response.data;
};


export const createNewProject = async (projectRequest) => {
    const response = await axiosInstance.post(`${projectPrefix}`, projectRequest);
    return response.data;
};

export const updateProject = async (updateProjectRequest, projectId) => {
    const response = await axiosInstance.put(`${projectPrefix}/${projectId}`, updateProjectRequest);
    return response.data;
};

export const deleteProject = async (projectId) => {
    const response = await axiosInstance.delete(`${projectPrefix}/${projectId}`);
    return response.data;
};