const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // Default to localhost for development if not specified
    return "http://localhost:8000/api/v1";
};

export const API_URL = getApiUrl();