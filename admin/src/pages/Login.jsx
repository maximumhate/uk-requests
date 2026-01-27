import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const { login } = useAuth()
    const [telegramId, setTelegramId] = useState('100000001')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const user = await login(telegramId)
            if (user.role !== 'admin' && user.role !== 'dispatcher') {
                setError('Доступ разрешён только сотрудникам УК')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
        }}>
            <div className="card" style={{ width: '100%', maxWidth: 400 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
                    🏢 Панель управления УК
                </h1>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32 }}>
                    Вход для сотрудников
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Telegram ID</label>
                        <input
                            type="text"
                            className="form-input"
                            value={telegramId}
                            onChange={(e) => setTelegramId(e.target.value)}
                            placeholder="Введите Telegram ID"
                        />
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                            Для тестирования: 100000001 (админ) или 100000002 (диспетчер)
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            padding: 12,
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid var(--color-error)',
                            borderRadius: 8,
                            color: 'var(--color-error)',
                            marginBottom: 20
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
            </div>
        </div>
    )
}
