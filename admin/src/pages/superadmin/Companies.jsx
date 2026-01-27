import { useState, useEffect } from 'react'
import api from '../../api/client'

export default function Companies() {
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCompany, setEditingCompany] = useState(null)
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' })

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

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Загрузка...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <h1>Управляющие Компании</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Добавить УК
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Телефон</th>
                            <th>Email</th>
                            <th>Адрес</th>
                            <th>Статистика</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(company => (
                            <tr key={company.id}>
                                <td>#{company.id}</td>
                                <td style={{ fontWeight: 500 }}>{company.name}</td>
                                <td>{company.phone || '-'}</td>
                                <td>{company.email || '-'}</td>
                                <td>{company.address || '-'}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span className="badge badge-purple" title="Дома">🏠 {company.house_count}</span>
                                        <span className="badge badge-new" title="Пользователи">👥 {company.user_count}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '6px 12px', fontSize: 13 }}
                                            onClick={() => openModal(company)}
                                        >
                                            Изменить
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: '6px 12px', fontSize: 13 }}
                                            onClick={() => handleDelete(company.id)}
                                        >
                                            Удалить
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
                        <h2>{editingCompany ? 'Редактировать УК' : 'Новая УК'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Название</label>
                                <input
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Телефон</label>
                                <input
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    className="form-input"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Адрес офиса</label>
                                <input
                                    className="form-input"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                                <button type="button" className="btn btn-secondary" onClick={closeModal} style={{ flex: 1 }}>
                                    Отмена
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
