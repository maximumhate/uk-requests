import { useNavigate } from 'react-router-dom'

export default function Header({ title, showBack = false }) {
    const navigate = useNavigate()

    return (
        <header className="header">
            <div className="header-content">
                {showBack ? (
                    <button className="header-back" onClick={() => navigate(-1)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                ) : (
                    <div style={{ width: 40 }} />
                )}

                <h1 className="header-title">{title}</h1>

                <div style={{ width: 40 }} />
            </div>
        </header>
    )
}
