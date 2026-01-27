import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { requestsApi } from '../api/client'
import Header from '../components/layout/Header'
import {
    Wrench,
    Zap,
    Hammer,
    Sparkles,
    Bell,
    ArrowUpDown,
    Flame,
    FileText
} from 'lucide-react'

const STATUS_LABELS = {
    new: 'Новая',
    accepted: 'Принята',
    in_progress: 'В работе',
    on_hold: 'Приостановлена',
    completed: 'Выполнена',
    rejected: 'Отклонена',
    reopened: 'Открыта повторно',
    cancelled: 'Отменена'
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

const CategoryIcon = ({ category, size = 24 }) => {
    switch (category) {
        case 'plumbing': return <Wrench size={size} />
        case 'electrical': return <Zap size={size} />
        case 'repair': return <Hammer size={size} />
        case 'cleaning': return <Sparkles size={size} />
        case 'intercom': return <Bell size={size} />
        case 'elevator': return <ArrowUpDown size={size} />
        case 'heating': return <Flame size={size} />
        default: return <FileText size={size} />
    }
}

export default function RequestDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [request, setRequest] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadRequest()
    }, [id])

    const loadRequest = async () => {
        try {
            const response = await requestsApi.getById(id)
            setRequest(response.data)
        } catch (err) {
            setError(err.response?.data?.detail || 'Заявка не найдена')
        } finally {
            setLoading(false)
        }
    }

    const handleReopen = async () => {
        try {
            await requestsApi.updateStatus(id, {
                status: 'reopened',
                comment: 'Заявка переоткрыта пользователем'
            })
            loadRequest()
        } catch (err) {
            alert(err.response?.data?.detail || 'Ошибка')
        }
    }

    const handleCancel = async () => {
        if (!confirm('Отменить заявку?')) return
        try {
            await requestsApi.updateStatus(id, {
                status: 'cancelled',
                comment: 'Заявка отменена пользователем'
            })
            loadRequest()
        } catch (err) {
            alert(err.response?.data?.detail || 'Ошибка')
        }
    }

    if (loading) {
        return (
            <div className="page">
                <Header title="Заявка" showBack />
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            </div>
        )
    }

    if (error || !request) {
        return (
            <div className="page">
                <Header title="Заявка" showBack />
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">❌</div>
                        <h3 className="empty-state-title">Ошибка</h3>
                        <p className="empty-state-text">{error || 'Заявка не найдена'}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page safe-area-bottom">
            <Header title={`Заявка #${request.id}`} showBack />

            <div className="container">
                {/* Status Badge */}
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <span
                        className={`badge badge-${request.status}`}
                        style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                        {STATUS_LABELS[request.status]}
                    </span>
                </div>

                {/* Main Card */}
                <div className="card" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div className={`category-icon category-${request.category}`} style={{ width: 48, height: 48, fontSize: 24, padding: 10 }}>
                            <CategoryIcon category={request.category} size={28} />
                        </div>
                        <div>
                            <div className="text-muted" style={{ marginBottom: '4px' }}>
                                {CATEGORY_LABELS[request.category]}
                            </div>
                            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
                                {request.title}
                            </h2>
                        </div>
                    </div>

                    {request.description && (
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {request.description}
                        </p>
                    )}
                </div>

                {/* Info Card */}
                <div className="card" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-secondary">Создана</span>
                            <span>{new Date(request.created_at).toLocaleString('ru-RU')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-secondary">Обновлена</span>
                            <span>{new Date(request.updated_at).toLocaleString('ru-RU')}</span>
                        </div>
                        {request.user_address && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="text-secondary">Адрес</span>
                                <span>{request.user_address}, кв. {request.user_apartment}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* History */}
                {request.history?.length > 0 && (
                    <div className="card">
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                            История
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {request.history.map((item, index) => (
                                <div
                                    key={item.id}
                                    style={{
                                        padding: '12px',
                                        background: 'var(--bg-input)',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span className={`badge badge-${item.new_status}`}>
                                            {STATUS_LABELS[item.new_status]}
                                        </span>
                                        <span className="text-muted" style={{ fontSize: '12px' }}>
                                            {new Date(item.created_at).toLocaleString('ru-RU')}
                                        </span>
                                    </div>
                                    {item.comment && (
                                        <p className="text-secondary" style={{ fontSize: '14px', marginTop: '8px' }}>
                                            {item.comment}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                {request.status === 'completed' && request.user_id === user?.id && (
                    <button
                        className="btn btn-secondary btn-block"
                        onClick={handleReopen}
                        style={{ marginTop: '16px' }}
                    >
                        Переоткрыть заявку
                    </button>
                )}

                {['new', 'accepted'].includes(request.status) && request.user_id === user?.id && (
                    <button
                        className="btn btn-secondary btn-block"
                        onClick={handleCancel}
                        style={{ marginTop: '16px', color: 'var(--color-error)' }}
                    >
                        Отменить заявку
                    </button>
                )}
            </div>
        </div>
    )
}
