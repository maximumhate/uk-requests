import { Link, useLocation } from 'react-router-dom'
import { Home, PlusCircle, User } from 'lucide-react'

export default function BottomNav() {
    const location = useLocation()

    const isActive = (path) => location.pathname === path

    return (
        <nav className="bottom-nav">
            <div className="bottom-nav-content">
                <Link to="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
                    <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
                    <span>Главная</span>
                </Link>

                <Link to="/new" className={`bottom-nav-item ${isActive('/new') ? 'active' : ''}`}>
                    <PlusCircle size={40} strokeWidth={isActive('/new') ? 2.5 : 2} style={{ marginBottom: 4, color: 'var(--accent-primary)' }} />
                    <span style={{ fontWeight: 600 }}>Заявка</span>
                </Link>

                <Link to="/profile" className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}>
                    <User size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
                    <span>Профиль</span>
                </Link>
            </div>
        </nav>
    )
}
