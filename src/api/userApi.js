import axiosInstance from "../config/ApiConfig";

const userPrefix = "auth/users";

export const register = async (registerRequest) => {
    const response = await axiosInstance.post(`${userPrefix}`, registerRequest);
    return response.data;
};

export const editProfile = async (editProfileRequest) => {
    const response = await axiosInstance.put(`${userPrefix}`, editProfileRequest);
    return response.data;
};

export const getUserInfo = async (username) => {
    const response = await axiosInstance.get(`${userPrefix}/u/${username}`);
    return response.data;
};

export const changePassword = async (username, changePasswordRequest) => {
    const response = await axiosInstance.patch(`${userPrefix}/${username}`, changePasswordRequest);
    return response.data;
};

export const getUserInfoViaToken = async () => {
    const response = await axiosInstance.get(`${userPrefix}/t`);
    return response.data;
};

export const checkUserExist = async (username) => {
    const response = await axiosInstance.patch(`${userPrefix}/exist/${username}`);
    return response.data;
};

export const updateUserStatus = async (updatedUser) => {
    const response = await axiosInstance.put(`${userPrefix}/status`, updatedUser);
    return response.data;
};