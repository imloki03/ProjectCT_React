import axiosInstance from "../config/ApiConfig";

const messaggePrefix = "message/chatboxes";

export const getOlderMessageByProject = async (projectId, last = 0, page = 0, size = 15, sort = "sentTime,DESC") => {
    const response = await axiosInstance.get(`${messaggePrefix}/p/${projectId}`, {
        params: { last, page, size, sort }
    });
    return response.data;
};

export const getNewerMessageByProject = async (projectId, last = 0, page = 0, size = 15, sort = "sentTime,ASC") => {
    const response = await axiosInstance.get(`${messaggePrefix}/p/${projectId}/newer`, {
        params: { last, page, size, sort }
    });
    return response.data;
};

export const getMediaMessagesByProject = async (projectId, page = 0, size = 10, sort = "sentTime,DESC") => {
    const response = await axiosInstance.get(`${messaggePrefix}/p/${projectId}/media`, {
        params: { page, size, sort }
    });
    return response.data;
};

export const getPinMessageByProject = async (projectId, page = 0, size = 10, sort = "pinTime,DESC") => {
    const response = await axiosInstance.get(`${messaggePrefix}/p/${projectId}/pin`, {
        params: { page, size, sort }
    });
    return response.data;
};

export const getSourceMessage = async (projectId, messageId, page = 0, size = 10, sort = "sentTime,DESC") => {
    const response = await axiosInstance.get(`${messaggePrefix}/p/${projectId}/m/${messageId}/media/src`, {
        params: { page, size, sort }
    });
    return response.data;
};

export const getLastSeenMessageByProject = async (usernameList, projectId) => {
    const response = await axiosInstance.get(`${messaggePrefix}/p/${projectId}/seen`, {
        params: { usernameList }
    });
    return response.data;
};

export const searchMessage = async (projectId, page = 0, size = 10, sort = "sentTime,DESC", keyword, mode) => {
    const response = await axiosInstance.get(`${messaggePrefix}/search/p/${projectId}`, {
        params: { page, size, sort, keyword, mode}
    });
    return response.data;
};