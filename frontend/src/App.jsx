import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import Login from './pages/Login'
import Home from './pages/Home'
import NewRequest from './pages/NewRequest'
import RequestDetail from './pages/RequestDetail'
import Profile from './pages/Profile'

// Components
import BottomNav from './components/layout/BottomNav'
import Loading from './components/ui/Loading'

function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) return <Loading />
    if (!isAuthenticated) return <Navigate to="/login" />

    return children
}

export default function App() {
    const { isAuthenticated, loading } = useAuth()

    if (loading) return <Loading />

    return (
        <>
            <Routes>
                <Route path="/login" element={
                    isAuthenticated ? <Navigate to="/" /> : <Login />
                } />

                <Route path="/" element={
                    <PrivateRoute>
                        <Home />
                    </PrivateRoute>
                } />

                <Route path="/new" element={
                    <PrivateRoute>
                        <NewRequest />
                    </PrivateRoute>
                } />

                <Route path="/request/:id" element={
                    <PrivateRoute>
                        <RequestDetail />
                    </PrivateRoute>
                } />

                <Route path="/profile" element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            {isAuthenticated && <BottomNav />}
        </>
    )
}

