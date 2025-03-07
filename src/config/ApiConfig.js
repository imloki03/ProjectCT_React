import axios from "axios";
import {API_BASE_URL} from "../constants/env";
import {refreshToken} from "../api/authApi";
import store from "../redux/store";
import {logout} from "../redux/slices/userSlice";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    //timeout: 10000,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const token = localStorage.getItem("token");
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && token) {
            try {
                originalRequest._retry = true;
                const response = await axios.post(`${API_BASE_URL}auth/jwt/refresh`, { token });
                const newToken = response.data.token;
                localStorage.setItem("token", newToken);
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch (err) {
                // store.dispatch(logout());
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;