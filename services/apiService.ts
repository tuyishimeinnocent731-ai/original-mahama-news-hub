export const API_URL = '';

const getAuthToken = () => {
    try {
        const authData = localStorage.getItem('auth');
        if (authData) {
            return JSON.parse(authData).token;
        }
    } catch (e) {
        console.error("Could not parse auth token from localStorage", e);
    }
    return null;
};

export const api = {
    get: async <T>(endpoint: string): Promise<T> => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    post: async <T>(endpoint: string, body: any): Promise<T> => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    postFormData: async <T>(endpoint: string, formData: FormData): Promise<T> => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData
        });
        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    put: async <T>(endpoint: string, body: any): Promise<T> => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    },
    
    putFormData: async <T>(endpoint: string, formData: FormData): Promise<T> => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData
        });
        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    },


    delete: async <T>(endpoint: string): Promise<T> => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    },
};