import axiosInstance from "../config/ApiConfig";

export const getAllProjects = async () => {
    const response = await axiosInstance.get(`project/projects`);
    return response.data;
};