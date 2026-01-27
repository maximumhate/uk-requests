import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Requests from './pages/Requests'
import Companies from './pages/Companies'
import Houses from './pages/Houses'
import Sidebar from './components/Sidebar'
import Loading from './components/Loading'
import SuperCompanies from './pages/superadmin/Companies'
import SuperHouses from './pages/superadmin/Houses'
import SuperUsers from './pages/superadmin/Users'

function PrivateRoute({ children }) {
    const { isAuthenticated, loading, user } = useAuth()

    if (loading) return <Loading />
    if (!isAuthenticated) return <Navigate to="/login" />
    if (user?.role !== 'admin' && user?.role !== 'dispatcher' && user?.role !== 'super_admin') {
        return (
            <div className="error-page">
                <h1>Доступ запрещён</h1>
                <p>Эта панель доступна только сотрудникам УК</p>
                <button
                    className="btn btn-primary"
                    onClick={() => window.location.href = '/login'}
                    style={{ marginTop: 20 }}
                >
                    Перейти к входу
                </button>
            </div>
        )
    }

    return children
}

export default function App() {
    const { isAuthenticated, loading, user } = useAuth()

    if (loading) return <Loading />

    return (
        <div className="app-layout">
            {isAuthenticated && <Sidebar />}
            <main className="main-content">
                <Routes>
                    <Route path="/login" element={
                        isAuthenticated ? <Navigate to="/" /> : <Login />
                    } />

                    <Route path="/" element={
                        <PrivateRoute><Dashboard /></PrivateRoute>
                    } />

                    <Route path="/requests" element={
                        <PrivateRoute><Requests /></PrivateRoute>
                    } />

                    <Route path="/companies" element={
                        <PrivateRoute>
                            {user?.role === 'super_admin' ? <SuperCompanies /> : <Companies />}
                        </PrivateRoute>
                    } />

                    <Route path="/houses" element={
                        <PrivateRoute>
                            {user?.role === 'super_admin' ? <SuperHouses /> : <Houses />}
                        </PrivateRoute>
                    } />

                    <Route path="/users" element={
                        <PrivateRoute>
                            {user?.role === 'super_admin' ? <SuperUsers /> : <Navigate to="/" />}
                        </PrivateRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </div>
    )
}
