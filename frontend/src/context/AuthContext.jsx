import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Проверяем токен при загрузке
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            fetchUser()
        } else {
            setLoading(false)
        }
    }, [])

    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/me')
            setUser(response.data)
        } catch (err) {
            localStorage.removeItem('token')
            delete api.defaults.headers.common['Authorization']
        } finally {
            setLoading(false)
        }
    }

    const login = async (initData) => {
        try {
            setError(null)
            const response = await api.post('/auth/telegram', null, {
                params: { init_data: initData }
            })
            const { access_token, user } = response.data

            localStorage.setItem('token', access_token)
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
            setUser(user)

            return user
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка авторизации')
            throw err
        }
    }

    const demoLogin = async () => {
        try {
            setError(null)
            const response = await api.post('/auth/demo')
            const { access_token, user } = response.data

            localStorage.setItem('token', access_token)
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
            setUser(user)

            return user
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка авторизации')
            throw err
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
    }

    const updateProfile = async (data) => {
        try {
            const response = await api.patch('/auth/me', data)
            setUser(response.data)
            return response.data
        } catch (err) {
            throw err
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            demoLogin,
            logout,
            updateProfile,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
