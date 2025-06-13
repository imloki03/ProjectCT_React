import axiosInstance from "../config/ApiConfig";

const notiPrefix = "notification/notifications";
const notiQueuePrefix = "notification/notificationQs";

export const subscribeToTopics = async (request) => {
    const response = await axiosInstance.post(`${notiPrefix}/subscribe`, request);
    return response.data;
};

export const getAllUnReadNotificationsOfUser = async (userId, page = 0, size = 10, sort = "sentTime,DESC") => {
    const response = await axiosInstance.get(`${notiQueuePrefix}/${userId}/unread`, {
        params: { page, size, sort}
    });
    return response.data;
};

export const getAllReadNotificationsOfUser = async (userId, page = 0, size = 10, sort = "sentTime,DESC") => {
    const response = await axiosInstance.get(`${notiQueuePrefix}/${userId}/read`, {
        params: { page, size, sort}
    });
    return response.data;
};

export const readNotification = async (notificationId) => {
    const response = await axiosInstance.put(`${notiPrefix}/${notificationId}`);
    return response.data;
};