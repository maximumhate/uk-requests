import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
    const { user, logout } = useAuth()

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">🏢 Панель УК</div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span>📊</span> Главная
                </NavLink>
                <NavLink to="/requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span>📋</span> Заявки
                </NavLink>
                <NavLink to="/companies" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span>🏢</span> УК
                </NavLink>
                <NavLink to="/houses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span>🏠</span> Дома
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div style={{ marginBottom: 12, fontSize: 14 }}>
                    <div style={{ color: 'var(--text-primary)' }}>{user?.first_name} {user?.last_name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{user?.role}</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={logout} style={{ width: '100%' }}>
                    Выйти
                </button>
            </div>
        </aside>
    )
}
