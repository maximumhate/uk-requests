import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Dashboard() {
    const [stats, setStats] = useState({ new: 0, in_progress: 0, completed: 0, total: 0 })
    const [recentRequests, setRecentRequests] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const response = await api.get('/requests', { params: { limit: 10 } })
            const requests = response.data.items || []

            setRecentRequests(requests.slice(0, 5))
            setStats({
                new: requests.filter(r => r.status === 'new').length,
                in_progress: requests.filter(r => r.status === 'in_progress').length,
                completed: requests.filter(r => r.status === 'completed').length,
                total: response.data.total || requests.length
            })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const STATUS_LABELS = {
        new: 'Новая',
        accepted: 'Принята',
        in_progress: 'В работе',
        completed: 'Выполнена',
        rejected: 'Отклонена'
    }

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Главная</h1>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{stats.new}</div>
                    <div className="stat-label">Новых заявок</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{stats.in_progress}</div>
                    <div className="stat-label">В работе</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.completed}</div>
                    <div className="stat-label">Выполнено</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Всего заявок</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Последние заявки</h2>
                </div>

                {recentRequests.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>
                        Нет заявок
                    </p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Заголовок</th>
                                    <th>Адрес</th>
                                    <th>Статус</th>
                                    <th>Дата</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentRequests.map(request => (
                                    <tr key={request.id}>
                                        <td>#{request.id}</td>
                                        <td>{request.title}</td>
                                        <td>{request.user_address || '—'}</td>
                                        <td>
                                            <span className={`badge badge-${request.status}`}>
                                                {STATUS_LABELS[request.status] || request.status}
                                            </span>
                                        </td>
                                        <td>{new Date(request.created_at).toLocaleDateString('ru')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
