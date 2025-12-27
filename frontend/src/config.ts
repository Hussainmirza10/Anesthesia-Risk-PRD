const getApiUrl = () => {
    let url = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
    
    // Remove trailing slash if present
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    
    // Ensure the URL ends with /api/v1
    // This handles cases where the user only provides the base domain
    if (!url.endsWith('/api/v1')) {
        url += '/api/v1';
    }
    
    return url;
};

export const API_URL = getApiUrl();