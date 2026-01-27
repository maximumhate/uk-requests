import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: { 'Content-Type': 'application/json' }
})

const token = localStorage.getItem('admin_token')
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('admin_token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
