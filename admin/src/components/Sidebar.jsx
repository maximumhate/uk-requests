import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
    const { user, logout } = useAuth()

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">🏢 Панель УК</div>
            </div>

            <nav style={{ flex: 1 }}>
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span>📊</span> Главная
                </NavLink>
                <NavLink to="/requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span>📋</span> Заявки
                </NavLink>

                {user?.role === 'super_admin' && (
                    <>
                        <div style={{ margin: '24px 0 8px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                            Супер-админ
                        </div>
                        <NavLink to="/companies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span>🏢</span> Все УК
                        </NavLink>
                        <NavLink to="/houses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span>🏠</span> Все Дома
                        </NavLink>
                        <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span>👥</span> Пользователи
                        </NavLink>
                    </>
                )}
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
