import axiosInstance from "../config/ApiConfig";

export const login = async (username, password) => {
    const response = await axiosInstance.post(`auth/users/login`, { username, password });
    return response.data;
};

export const refreshToken = async (token) => {
    const response = await axiosInstance.post(`auth/jwt/refresh`, { token });
    return response.data;
};