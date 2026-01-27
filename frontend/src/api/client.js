import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

// Добавляем токен из localStorage при старте
const token = localStorage.getItem('token')
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Обработка ошибок
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            delete api.defaults.headers.common['Authorization']
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api

// API для заявок
export const requestsApi = {
    getAll: (params) => api.get('/requests', { params }),
    getById: (id) => api.get(`/requests/${id}`),
    create: (data) => api.post('/requests', data),
    update: (id, data) => api.patch(`/requests/${id}`, data),
    updateStatus: (id, data) => api.post(`/requests/${id}/status`, data),
    delete: (id) => api.delete(`/requests/${id}`),
    getCategories: () => api.get('/requests/categories'),
    getStatuses: () => api.get('/requests/statuses')
}

// API для компаний
export const companiesApi = {
    getAll: () => api.get('/companies'),
    getById: (id) => api.get(`/companies/${id}`),
    create: (data) => api.post('/companies', data),
    update: (id, data) => api.patch(`/companies/${id}`, data),
    delete: (id) => api.delete(`/companies/${id}`)
}

// API для домов
export const housesApi = {
    getAll: (params) => api.get('/houses', { params }),
    getById: (id) => api.get(`/houses/${id}`),
    create: (data) => api.post('/houses', data),
    update: (id, data) => api.patch(`/houses/${id}`, data),
    delete: (id) => api.delete(`/houses/${id}`)
}
