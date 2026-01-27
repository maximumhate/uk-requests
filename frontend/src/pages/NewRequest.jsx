import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const CATEGORIES = [
    { value: 'plumbing', label: 'Сантехника', icon: Wrench },
    { value: 'electrical', label: 'Электрика', icon: Zap },
    { value: 'repair', label: 'Ремонт', icon: Hammer },
    { value: 'cleaning', label: 'Уборка', icon: Sparkles },
    { value: 'intercom', label: 'Домофон', icon: Bell },
    { value: 'elevator', label: 'Лифт', icon: ArrowUpDown },
    { value: 'heating', label: 'Отопление', icon: Flame },
    { value: 'other', label: 'Другое', icon: FileText }
]

export default function NewRequest() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [category, setCategory] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!user?.house_id) {
            setError('Сначала укажите адрес в профиле')
            return
        }

        if (!category || !title.trim()) {
            setError('Заполните все обязательные поля')
            return
        }

        setLoading(true)
        setError(null)

        try {
            await requestsApi.create({
                category,
                title: title.trim(),
                description: description.trim() || null
            })
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка при создании заявки')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page safe-area-bottom">
            <Header title="Новая заявка" showBack />

            <div className="container">
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            color: 'var(--color-error)',
                            marginBottom: '20px',
                            padding: '12px 16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '12px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Category Selection */}
                    <div className="form-group">
                        <label className="form-label">Категория *</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px'
                        }}>
                            {CATEGORIES.map(cat => {
                                const Icon = cat.icon
                                return (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setCategory(cat.value)}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '16px',
                                            background: category === cat.value
                                                ? 'rgba(99, 102, 241, 0.1)'
                                                : 'var(--bg-input)',
                                            border: category === cat.value
                                                ? '2px solid var(--accent-primary)'
                                                : '1px solid var(--border-color)',
                                            borderRadius: '16px',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                            color: category === cat.value
                                                ? 'var(--accent-primary)'
                                                : 'var(--text-primary)'
                                        }}
                                    >
                                        <Icon size={28} strokeWidth={1.5} />
                                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{cat.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="form-group">
                        <label className="form-label">Краткое описание проблемы *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Например: Течет кран на кухне"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={255}
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Подробности (необязательно)</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Опишите проблему подробнее..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={1000}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-block btn-lg"
                        disabled={loading || !category || !title.trim()}
                    >
                        {loading ? 'Отправка...' : 'Отправить заявку'}
                    </button>
                </form>
            </div>
        </div>
    )
}
