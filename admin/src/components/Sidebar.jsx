import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
    LayoutDashboard,
    ClipboardList,
    Building2,
    Home,
    Users,
    LogOut,
    Sun,
    Moon,
    Monitor
} from 'lucide-react'

export default function Sidebar() {
    const { user, logout } = useAuth()
    const { theme, setTheme } = useTheme()

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <Building2 size={24} color="var(--accent-primary)" />
                    <span>Панель УК</span>
                </div>
            </div>

            <nav style={{ flex: 1 }}>
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <span>Главная</span>
                </NavLink>
                <NavLink to="/requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <ClipboardList size={20} />
                    <span>Заявки</span>
                </NavLink>

                {user?.role === 'super_admin' && (
                    <>
                        <div style={{ margin: '24px 0 8px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Супер-админ
                        </div>
                        <NavLink to="/companies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Building2 size={20} />
                            <span>Все УК</span>
                        </NavLink>
                        <NavLink to="/houses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Home size={20} />
                            <span>Все Дома</span>
                        </NavLink>
                        <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Users size={20} />
                            <span>Пользователи</span>
                        </NavLink>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                {/* Theme Toggle */}
                <div className="theme-toggle" style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: 4, borderRadius: 8, marginBottom: 16 }}>
                    {['light', 'dark', 'system'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={theme === t ? 'active' : ''}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: theme === t ? 'var(--bg-input)' : 'transparent',
                                color: theme === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                                borderRadius: 6,
                                padding: 6,
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: theme === t ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s ease'
                            }}
                            title={t === 'light' ? 'Светлая' : t === 'dark' ? 'Тёмная' : 'Системная'}
                        >
                            {t === 'light' && <Sun size={16} />}
                            {t === 'dark' && <Moon size={16} />}
                            {t === 'system' && <Monitor size={16} />}
                        </button>
                    ))}
                </div>

                <div style={{ marginBottom: 12, fontSize: 14 }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user?.first_name} {user?.last_name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {user?.role === 'super_admin' ? 'Супер-админ' : user?.role === 'admin' ? 'Администратор' : 'Диспетчер'}
                    </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={logout} style={{ width: '100%', justifyContent: 'center' }}>
                    <LogOut size={16} />
                    Выйти
                </button>
            </div>
        </aside>
    )
}
