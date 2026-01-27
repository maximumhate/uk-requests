import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
    const location = useLocation()

    const isActive = (path) => location.pathname === path

    return (
        <nav className="bottom-nav">
            <div className="bottom-nav-content">
                <Link to="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>Главная</span>
                </Link>

                <Link to="/new" className={`bottom-nav-item ${isActive('/new') ? 'active' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    <span>Заявка</span>
                </Link>

                <Link to="/profile" className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Профиль</span>
                </Link>
            </div>
        </nav>
    )
}

