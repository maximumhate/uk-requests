import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('admin_token')
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
            localStorage.removeItem('admin_token')
            delete api.defaults.headers.common['Authorization']
        } finally {
            setLoading(false)
        }
    }

    const login = async (username, password) => {
        // Для MVP используем простой вход по telegram_id
        try {
            const response = await api.post('/auth/demo', null, {
                params: { telegram_id: parseInt(username) || 100000001 }
            })
            const { access_token, user } = response.data

            localStorage.setItem('admin_token', access_token)
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
            setUser(user)

            return user
        } catch (err) {
            throw new Error(err.response?.data?.detail || 'Ошибка входа')
        }
    }

    const logout = () => {
        localStorage.removeItem('admin_token')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
