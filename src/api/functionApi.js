import axiosInstance from "../config/ApiConfig";

export const getAllFunctions = async () => {
    const response = await axiosInstance.get(`collab/functions`);
    return response.data;
};
