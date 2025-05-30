import axiosInstance from "../config/ApiConfig";

export const login = async (username, password) => {
    const response = await axiosInstance.post(`auth/users/login`, { username, password });
    return response.data;
};

export const refreshToken = async (token) => {
    const response = await axiosInstance.post(`auth/jwt/refresh`, { token });
    return response.data;
};

export const sendOtp = async (email) => {
    const response = await axiosInstance.post(`auth/otp/${email}`);
    return response.data;
};

export const verifyOtp = async (email, otp) => {
    const response = await axiosInstance.post(`auth/otp/verify/${email}/${otp}`);
    return response.data;
};

export const searchUser = async (query) => {
    const response = await axiosInstance.get(`auth/users/search?query=${query}`);
    return response.data;
};

export const updateOAuthUser = async (updatedUser) => {
    const response = await axiosInstance.put(`auth/users/oauth`, updatedUser);
    return response.data;
};