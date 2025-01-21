import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
    baseURL: API_URL ? `${API_URL}/api` : 'http://localhost:5000/api',
});

console.log('API Base URL:', axiosInstance.defaults.baseURL);

axiosInstance.interceptors.request.use(
    config => {
        console.log('Making request to:', config.url);
        
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        console.error('Response error:', {
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
        });

        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;