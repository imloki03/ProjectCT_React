import axiosInstance from "../config/ApiConfig";

const messagePrefix = "message/chatboxes";

export const getOlderMessageByProject = async (projectId, last = 0, page = 0, size = 15, sort = "sentTime,DESC", taskId) => {
    const response = await axiosInstance.get(`${messagePrefix}/p/${projectId}`, {
        params: { last, page, size, sort, taskId }
    });
    return response.data;
};

export const getNewerMessageByProject = async (projectId, last = 0, page = 0, size = 15, sort = "sentTime,ASC", taskId) => {
    const response = await axiosInstance.get(`${messagePrefix}/p/${projectId}/newer`, {
        params: { last, page, size, sort, taskId }
    });
    return response.data;
};

export const getMediaMessagesByProject = async (projectId, page = 0, size = 10, sort = "sentTime,DESC", taskId) => {
    const response = await axiosInstance.get(`${messagePrefix}/p/${projectId}/media`, {
        params: { page, size, sort, taskId }
    });
    return response.data;
};

export const getPinMessageByProject = async (projectId, page = 0, size = 10, sort = "pinTime,DESC", taskId) => {
    const response = await axiosInstance.get(`${messagePrefix}/p/${projectId}/pin`, {
        params: { page, size, sort, taskId }
    });
    return response.data;
};

export const getSourceMessage = async (projectId, messageId, page = 0, size = 10, sort = "sentTime,DESC", taskId) => {
    const response = await axiosInstance.get(`${messagePrefix}/p/${projectId}/m/${messageId}/media/src`, {
        params: { page, size, sort, taskId }
    });
    return response.data;
};

export const getLastSeenMessageByProject = async (usernameList = [], projectId, taskId) => {
    const response = await axiosInstance.get(`${messagePrefix}/p/${projectId}/seen`, {
        params: { usernameList: usernameList.join(","), taskId }
    });
    return response.data;
};

export const searchMessage = async (projectId, keyword, mode, page = 0, size = 10, sort = "sentTime,DESC", taskId) => {
    const response = await axiosInstance.get(`${messagePrefix}/search/p/${projectId}`, {
        params: { keyword, mode, page, size, sort, taskId }
    });
    return response.data;
};
