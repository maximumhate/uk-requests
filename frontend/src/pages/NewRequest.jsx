import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { requestsApi } from '../api/client'
import Header from '../components/layout/Header'

const CATEGORIES = [
    { value: 'plumbing', label: 'Сантехника', icon: '🔧' },
    { value: 'electrical', label: 'Электрика', icon: '⚡' },
    { value: 'repair', label: 'Ремонт', icon: '🔨' },
    { value: 'cleaning', label: 'Уборка', icon: '🧹' },
    { value: 'intercom', label: 'Домофон', icon: '🔔' },
    { value: 'elevator', label: 'Лифт', icon: '🛗' },
    { value: 'heating', label: 'Отопление', icon: '🔥' },
    { value: 'other', label: 'Другое', icon: '📋' }
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
                            {CATEGORIES.map(cat => (
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
                                            ? 'var(--color-primary-light)'
                                            : 'var(--bg-input)',
                                        border: category === cat.value
                                            ? '2px solid var(--color-primary)'
                                            : '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <span style={{ fontSize: '24px' }}>{cat.icon}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{cat.label}</span>
                                </button>
                            ))}
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
