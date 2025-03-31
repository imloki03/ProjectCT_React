import axiosInstance from "../config/ApiConfig";

export const assistantRequest = async (messages) => {
    const response = await axiosInstance.post(`message/gemini`, {
        messages: messages
    });
    return response.data;
};