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

export const addCollab = async (projectId, userId) => {
    const response = await axiosInstance.post(`${projectPrefix}`, {
        projectId: projectId,
        userId: userId,
    });
    return response.data;
};

export const deleteCollaborator = async (collabId) => {
    const response = await axiosInstance.delete(`${projectPrefix}/${collabId}`);
    return response.data;
};

export const updateCollabRole = async (collabId, roleId) => {
    const response = await axiosInstance.patch(`${projectPrefix}/${collabId}`,{
        roleId: roleId
    });
    return response.data;
};