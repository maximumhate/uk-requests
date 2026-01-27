import { useState, useEffect } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const STATUS_LABELS = {
    new: 'Новая',
    accepted: 'Принята',
    in_progress: 'В работе',
    on_hold: 'Отложена',
    completed: 'Выполнена',
    rejected: 'Отклонена',
    reopened: 'Открыта повторно',
    cancelled: 'Отменена'
}

const STATUS_ACTIONS = {
    new: ['accepted', 'rejected'],
    accepted: ['in_progress', 'on_hold'],
    in_progress: ['completed', 'on_hold'],
    on_hold: ['in_progress', 'rejected'],
    reopened: ['accepted', 'rejected']
}

export default function Requests() {
    const { user } = useAuth()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('new')
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [comment, setComment] = useState('')

    useEffect(() => {
        loadRequests()
    }, [filter])

    const loadRequests = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {}
            const response = await api.get('/requests', { params })
            setRequests(response.data.items || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (requestId, newStatus) => {
        try {
            await api.post(`/requests/${requestId}/status`, {
                status: newStatus,
                comment: comment || null
            })
            setSelectedRequest(null)
            setComment('')
            loadRequests()
        } catch (err) {
            alert(err.response?.data?.detail || 'Ошибка')
        }
    }

    const handleCancel = async (requestId) => {
        if (!confirm('Отменить заявку?')) return
        try {
            await api.post(`/superadmin/requests/${requestId}/cancel`)
            setSelectedRequest(null)
            loadRequests()
        } catch (err) {
            alert(err.response?.data?.detail || 'Ошибка')
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Заявки</h1>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {[
                    { value: 'new', label: 'Новые' },
                    { value: 'in_progress', label: 'В работе' },
                    { value: 'on_hold', label: 'Отложенные' },
                    { value: 'completed', label: 'Выполненные' },
                    { value: 'rejected', label: 'Отклоненные' },
                    { value: 'cancelled', label: 'Отмененные' },
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

            <div className="card">
                {loading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : requests.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                        Нет заявок
                    </p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Категория</th>
                                    <th>Заголовок</th>
                                    <th>Адрес</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(request => (
                                    <tr key={request.id}>
                                        <td>#{request.id}</td>
                                        <td>{request.category_label}</td>
                                        <td>
                                            <div>{request.title}</div>
                                            {request.description && (
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                    {request.description.slice(0, 50)}...
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {request.user_address && (
                                                <div style={{ fontSize: 13 }}>
                                                    {request.user_address}, кв. {request.user_apartment}
                                                </div>
                                            )}
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                {request.user_name}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${request.status}`}>
                                                {STATUS_LABELS[request.status]}
                                            </span>
                                        </td>
                                        <td>
                                            {STATUS_ACTIONS[request.status] && (
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => setSelectedRequest(request)}
                                                >
                                                    Изменить
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedRequest && (
                <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Изменить статус #{selectedRequest.id}</h2>
                            <button className="modal-close" onClick={() => setSelectedRequest(null)}>×</button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Комментарий</label>
                            <textarea
                                className="form-input"
                                rows={3}
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Опционально"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {STATUS_ACTIONS[selectedRequest.status]?.map(status => (
                                <button
                                    key={status}
                                    className={`btn ${status === 'rejected' ? 'btn-secondary' : 'btn-primary'}`}
                                    onClick={() => handleStatusChange(selectedRequest.id, status)}
                                    style={{ flex: 1 }}
                                >
                                    {STATUS_LABELS[status]}
                                </button>
                            ))}

                            {user?.role === 'super_admin' && selectedRequest.status !== 'cancelled' && (
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleCancel(selectedRequest.id)}
                                    style={{ flex: 1 }}
                                >
                                    Отменить (Super Admin)
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
