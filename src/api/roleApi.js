import axiosInstance from "../config/ApiConfig";

export const getAllRolesOfProject = async (projectId) => {
    const response = await axiosInstance.get(`collab/roles/p/${projectId}`);
    return response.data;
};

export const createNewRole = async (roleReq) => {
    const response = await axiosInstance.post(`collab/roles`, roleReq);
    return response.data;
};

export const updateRole = async (roleId, roleReq) => {
    const response = await axiosInstance.put(`collab/roles/${roleId}`, roleReq);
    return response.data;
};

export const deleteRole = async (roleId) => {
    const response = await axiosInstance.delete(`collab/roles/${roleId}`);
    return response.data;
};