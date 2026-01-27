import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { requestsApi } from '../../api/client'
import Header from '../../components/layout/Header'

const STATUS_LABELS = {
    new: 'Новая',
    accepted: 'Принята',
    in_progress: 'В работе',
    on_hold: 'Приостановлена',
    completed: 'Выполнена',
    rejected: 'Отклонена',
    reopened: 'Открыта повторно'
}

const CATEGORY_LABELS = {
    plumbing: 'Сантехника',
    electrical: 'Электрика',
    repair: 'Ремонт',
    cleaning: 'Уборка',
    intercom: 'Домофон',
    elevator: 'Лифт',
    heating: 'Отопление',
    other: 'Другое'
}

const STATUS_ACTIONS = {
    new: [
        { status: 'accepted', label: 'Принять', color: 'var(--color-primary)' },
        { status: 'rejected', label: 'Отклонить', color: 'var(--color-error)' }
    ],
    accepted: [
        { status: 'in_progress', label: 'Начать работу', color: 'var(--color-warning)' },
        { status: 'on_hold', label: 'Отложить', color: 'var(--text-muted)' }
    ],
    in_progress: [
        { status: 'completed', label: 'Завершить', color: 'var(--color-success)' },
        { status: 'on_hold', label: 'Отложить', color: 'var(--text-muted)' }
    ],
    on_hold: [
        { status: 'in_progress', label: 'Возобновить', color: 'var(--color-warning)' },
        { status: 'rejected', label: 'Отклонить', color: 'var(--color-error)' }
    ],
    reopened: [
        { status: 'accepted', label: 'Принять', color: 'var(--color-primary)' },
        { status: 'rejected', label: 'Отклонить', color: 'var(--color-error)' }
    ],
    completed: [],
    rejected: []
}

export default function AdminDashboard() {
    const { user } = useAuth()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('new')
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [comment, setComment] = useState('')
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        loadRequests()
    }, [filter])

    const loadRequests = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {}
            const response = await requestsApi.getAll(params)
            setRequests(response.data.items)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (requestId, newStatus) => {
        setActionLoading(true)
        try {
            await requestsApi.updateStatus(requestId, {
                status: newStatus,
                comment: comment.trim() || null
            })
            setComment('')
            setSelectedRequest(null)
            loadRequests()
        } catch (err) {
            alert(err.response?.data?.detail || 'Ошибка')
        } finally {
            setActionLoading(false)
        }
    }

    const getStats = () => {
        return {
            new: requests.filter(r => r.status === 'new').length,
            in_progress: requests.filter(r => r.status === 'in_progress').length,
            completed: requests.filter(r => r.status === 'completed').length
        }
    }

    if (user?.role !== 'admin' && user?.role !== 'dispatcher') {
        return (
            <div className="page">
                <Header title="Панель УК" />
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">🔒</div>
                        <h3 className="empty-state-title">Нет доступа</h3>
                        <p className="empty-state-text">
                            Эта страница доступна только сотрудникам УК
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page safe-area-bottom">
            <Header title="Панель УК" />

            <div className="container">
                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginBottom: '20px'
                }}>
                    {[
                        { label: 'Новых', value: getStats().new, color: 'var(--color-info)' },
                        { label: 'В работе', value: getStats().in_progress, color: 'var(--color-warning)' },
                        { label: 'Выполнено', value: getStats().completed, color: 'var(--color-success)' }
                    ].map(stat => (
                        <div
                            key={stat.label}
                            style={{
                                padding: '16px',
                                background: 'var(--bg-card)',
                                borderRadius: '12px',
                                textAlign: 'center',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <div style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>
                                {stat.value}
                            </div>
                            <div className="text-muted" style={{ fontSize: '12px' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '20px',
                    overflowX: 'auto'
                }}>
                    {[
                        { value: 'new', label: 'Новые' },
                        { value: 'in_progress', label: 'В работе' },
                        { value: 'on_hold', label: 'Отложенные' },
                        { value: 'all', label: 'Все' }
                    ].map(item => (
                        <button
                            key={item.value}
                            className={`btn btn-sm ${filter === item.value ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter(item.value)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Requests */}
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3 className="empty-state-title">Нет заявок</h3>
                    </div>
                ) : (
                    <div className="list">
                        {requests.map(request => (
                            <div
                                key={request.id}
                                className="card"
                                style={{ padding: '16px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span className={`badge badge-${request.status}`}>
                                        {STATUS_LABELS[request.status]}
                                    </span>
                                    <span className="text-muted" style={{ fontSize: '12px' }}>
                                        #{request.id}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                                    {request.title}
                                </h3>

                                <div className="text-secondary" style={{ fontSize: '14px', marginBottom: '12px' }}>
                                    <div>📍 {request.user_address}, кв. {request.user_apartment}</div>
                                    <div>👤 {request.user_name}</div>
                                    <div>🏷️ {CATEGORY_LABELS[request.category]}</div>
                                </div>

                                {request.description && (
                                    <p className="text-muted" style={{
                                        fontSize: '13px',
                                        marginBottom: '12px',
                                        padding: '8px',
                                        background: 'var(--bg-input)',
                                        borderRadius: '8px'
                                    }}>
                                        {request.description}
                                    </p>
                                )}

                                {/* Actions */}
                                {STATUS_ACTIONS[request.status]?.length > 0 && (
                                    <>
                                        {selectedRequest === request.id ? (
                                            <div style={{ marginTop: '12px' }}>
                                                <textarea
                                                    className="form-textarea"
                                                    placeholder="Комментарий (необязательно)"
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    style={{ minHeight: '80px', marginBottom: '8px' }}
                                                />
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {STATUS_ACTIONS[request.status].map(action => (
                                                        <button
                                                            key={action.status}
                                                            className="btn btn-sm"
                                                            style={{
                                                                background: action.color,
                                                                color: 'white',
                                                                flex: 1
                                                            }}
                                                            onClick={() => handleStatusChange(request.id, action.status)}
                                                            disabled={actionLoading}
                                                        >
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                    <button
                                                        className="btn btn-sm btn-ghost"
                                                        onClick={() => {
                                                            setSelectedRequest(null)
                                                            setComment('')
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn btn-secondary btn-sm btn-block"
                                                onClick={() => setSelectedRequest(request.id)}
                                                style={{ marginTop: '8px' }}
                                            >
                                                Изменить статус
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
