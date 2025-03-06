import axiosInstance from "../config/ApiConfig";

const userPrefix = "auth/users";

export const register = async (registerRequest) => {
    const response = await axiosInstance.post(`${userPrefix}`, registerRequest);
    return response.data;
};

export const editProfile = async (username, editProfileRequest) => {
    const response = await axiosInstance.put(`${userPrefix}${username}`, editProfileRequest);
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

export const activateUser = async (username) => {
    const response = await axiosInstance.patch(`${userPrefix}/${username}/status`);
    return response.data;
};

export const getUserInfoViaToken = async () => {
    const response = await axiosInstance.get(`${userPrefix}/t`);
    return response.data;
};