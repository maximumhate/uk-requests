import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { requestsApi } from '../api/client'
import {
    Wrench,
    Zap,
    Hammer,
    Sparkles,
    Bell,
    ArrowUpDown,
    Flame,
    FileText,
    Inbox,
    Plus
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

export default function Home() {
    const { user } = useAuth()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        loadRequests()
    }, [filter])

    const loadRequests = async () => {
        try {
            const params = {}
            if (filter !== 'all') {
                params.status = filter
            }
            const response = await requestsApi.getAll(params)
            setRequests(response.data.items)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Доброе утро'
        if (hour < 18) return 'Добрый день'
        return 'Добрый вечер'
    }

    return (
        <div className="page safe-area-bottom">
            <div className="container">
                <div style={{ marginBottom: '24px' }}>
                    <p className="text-secondary" style={{ marginBottom: '4px' }}>
                        {getGreeting()},
                    </p>
                    <h1 className="title" style={{ marginBottom: '8px' }}>
                        {user?.first_name || 'Пользователь'}
                    </h1>
                    {!user?.house_id && (
                        <Link to="/profile" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            color: 'var(--color-warning)',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}>
                            ⚠️ Укажите адрес в профиле
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '20px',
                    overflowX: 'auto',
                    paddingBottom: '4px'
                }}>
                    {[
                        { value: 'all', label: 'Все' },
                        { value: 'new', label: 'Новые' },
                        { value: 'in_progress', label: 'В работе' },
                        { value: 'completed', label: 'Выполнены' }
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

                {/* Requests List */}
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <Inbox size={48} strokeWidth={1} />
                        </div>
                        <h3 className="empty-state-title">Нет заявок</h3>
                        <p className="empty-state-text">
                            {filter === 'all'
                                ? 'Создайте первую заявку, нажав кнопку ниже'
                                : 'Нет заявок с выбранным статусом'
                            }
                        </p>
                        <Link to="/new" className="btn btn-primary">
                            <Plus size={20} />
                            Создать заявку
                        </Link>
                    </div>
                ) : (
                    <div className="list">
                        {requests.map(request => (
                            <Link
                                key={request.id}
                                to={`/request/${request.id}`}
                                className="list-item"
                            >
                                <div className={`category-icon category-${request.category}`}>
                                    <CategoryIcon category={request.category} size={24} />
                                </div>
                                <div className="list-item-content">
                                    <div className="list-item-title">{request.title}</div>
                                    <div className="list-item-subtitle">
                                        {new Date(request.created_at).toLocaleDateString('ru-RU')}
                                    </div>
                                </div>
                                <span className={`badge badge-${request.status}`}>
                                    {STATUS_LABELS[request.status]}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
