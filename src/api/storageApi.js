import axiosInstance from "../config/ApiConfig";

const storagePrefix = "storage/storages";
export const uploadFileToCloudinary = async (file, stored = false) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("stored", stored);

    const response = await axiosInstance.post("storage/cloudinary", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const getStorageMedia = async (projectId, page = 0, size = 6) => {
    const response = await axiosInstance.get(`${storagePrefix}/all/${projectId}`, {
        params: { page, size, sort: "uploadTime,desc" } // Sorting by uploadTime in descending order
    });
    return response.data; // Return full paginated response
};

export const deleteMedia = async (mediaId) => {
    const response = await axiosInstance.delete(`${storagePrefix}/${mediaId}`);
    return response.data;
};

export const addMedia = async (projectId, mediaRequest, stored=false) => {
    const response = await axiosInstance.post(`${storagePrefix}/media/${projectId}?stored=${stored}`, mediaRequest);
    return response.data;
};

export const updateMedia = async (mediaId, mediaRequest) => {
    const response = await axiosInstance.patch(`${storagePrefix}/${mediaId}`, mediaRequest);
    return response.data;
};

export const updateMediaVersion = async (mediaId, mediaRequest) => {
    const response = await axiosInstance.put(`${storagePrefix}/${mediaId}`, mediaRequest);
    return response.data;
};