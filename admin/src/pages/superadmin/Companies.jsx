import { useState, useEffect } from 'react'
import api from '../../api/client'
import {
    Plus,
    Pencil,
    Trash2,
    Building2,
    Users as UsersIcon,
    MapPin,
    Phone,
    Mail,
    Search
} from 'lucide-react'

export default function Companies() {
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCompany, setEditingCompany] = useState(null)
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' })
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchCompanies()
    }, [])

    const fetchCompanies = async () => {
        try {
            const response = await api.get('/superadmin/companies')
            setCompanies(response.data)
        } catch (error) {
            console.error('Failed to fetch companies:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingCompany) {
                await api.patch(`/superadmin/companies/${editingCompany.id}`, formData)
            } else {
                await api.post('/superadmin/companies', formData)
            }
            fetchCompanies()
            closeModal()
        } catch (error) {
            console.error('Failed to save company:', error)
            alert('Ошибка при сохранении')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены? Это удалит компанию и все её дома и пользователей!')) return
        try {
            await api.delete(`/superadmin/companies/${id}`)
            fetchCompanies()
        } catch (error) {
            console.error('Failed to delete company:', error)
        }
    }

    const openModal = (company = null) => {
        if (company) {
            setEditingCompany(company)
            setFormData({
                name: company.name,
                phone: company.phone || '',
                email: company.email || '',
                address: company.address || ''
            })
        } else {
            setEditingCompany(null)
            setFormData({ name: '', phone: '', email: '', address: '' })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingCompany(null)
    }

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className="spinner"></div>
        </div>
    )

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ marginBottom: 4 }}>Управляющие Компании</h1>
                    <p className="text-secondary">Управление всеми организациями в системе</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Plus size={20} />
                    <span>Добавить УК</span>
                </button>
            </div>

            <div className="card" style={{ marginBottom: 24, padding: '16px 24px' }}>
                <div style={{ position: 'relative' }}>
                    <Search
                        size={20}
                        style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Поиск по названию..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: 48 }}
                    />
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Контакты</th>
                            <th>Адрес</th>
                            <th>Статистика</th>
                            <th style={{ textAlign: 'right' }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCompanies.map(company => (
                            <tr key={company.id}>
                                <td className="text-muted">#{company.id}</td>
                                <td style={{ fontWeight: 600 }}>{company.name}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {company.phone && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                                <Phone size={14} className="text-muted" />
                                                <span>{company.phone}</span>
                                            </div>
                                        )}
                                        {company.email && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                                <Mail size={14} className="text-muted" />
                                                <span>{company.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    {company.address ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                            <MapPin size={14} className="text-muted" />
                                            <span>{company.address}</span>
                                        </div>
                                    ) : '-'}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                            <Building2 size={12} />
                                            {company.house_count}
                                        </span>
                                        <span className="badge badge-new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                            <UsersIcon size={12} />
                                            {company.user_count}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                        <button
                                            className="btn btn-secondary btn-icon"
                                            onClick={() => openModal(company)}
                                            title="Изменить"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="btn btn-danger btn-icon"
                                            onClick={() => handleDelete(company.id)}
                                            title="Удалить"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="modal-content">
                        <div style={{ marginBottom: 24 }}>
                            <h2 style={{ marginBottom: 4 }}>{editingCompany ? 'Редактировать УК' : 'Новая УК'}</h2>
                            <p className="text-secondary">Заполните данные управляющей компании</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Название *</label>
                                <input
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Например: УК 'Уютный Дом'"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Телефон</label>
                                <input
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+7 (___) ___-__-__"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="mail@company.ru"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Адрес офиса</label>
                                <input
                                    className="form-input"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="г. Москва, ул. Примерная, д. 1"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                                <button type="button" className="btn btn-secondary" onClick={closeModal} style={{ flex: 1 }}>
                                    Отмена
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {editingCompany ? 'Сохранить изменения' : 'Создать компанию'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
