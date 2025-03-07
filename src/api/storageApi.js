import axiosInstance from "../config/ApiConfig";

const storagePrefix = "storage/storages";

export const getStorageMedia = async (projectId) => {
    const response = await axiosInstance.get(`${storagePrefix}/all/${projectId}`);
    return response.data;
};

export const deleteMedia = async (mediaId) => {
    const response = await axiosInstance.delete(`${storagePrefix}/${mediaId}`);
    return response.data;
};

export const addMedia = async (projectId, mediaRequest, stored) => {
    const response = await axiosInstance.post(`${storagePrefix}/media/${projectId}?stored=${stored}`, mediaRequest);
    return response.data;
};

export const updateMedia = async (mediaId, mediaRequest) => {
    const response = await axiosInstance.patch(`${storagePrefix}/${mediaId}`, mediaRequest);
    return response.data;
};

export const updateMediaVersion = async (mediaId, mediaRequest) => {
    const response = await axiosInstance.put(`${storagePrefix}/${mediaId}`, mediaRequest);
    return response.data;
};