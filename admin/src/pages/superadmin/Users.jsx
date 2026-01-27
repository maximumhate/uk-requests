import { useState, useEffect } from 'react'
import api from '../../api/client'

export default function Users() {
    const [users, setUsers] = useState([])
    const [companies, setCompanies] = useState([])
    const [houses, setHouses] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [formData, setFormData] = useState({
        role: '',
        company_id: '',
        house_id: '',
        apartment: ''
    })
    const [roleFilter, setRoleFilter] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [usersRes, companiesRes, housesRes] = await Promise.all([
                api.get('/superadmin/users'),
                api.get('/superadmin/companies'),
                api.get('/superadmin/houses')
            ])
            setUsers(usersRes.data)
            setCompanies(companiesRes.data)
            setHouses(housesRes.data)
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            // Prepare data - handle empty strings as null
            const payload = {
                role: formData.role,
                company_id: formData.company_id || null,
                house_id: formData.house_id || null,
                apartment: formData.apartment || null
            }

            await api.patch(`/superadmin/users/${editingUser.id}`, payload)
            fetchData() // Refresh list
            closeModal()
        } catch (error) {
            console.error('Failed to update user:', error)
            alert('Ошибка при сохранении')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены? Пользователь будет удален безвозвратно!')) return
        try {
            await api.delete(`/superadmin/users/${id}`)
            fetchData()
        } catch (error) {
            console.error('Failed to delete user:', error)
            alert(error.response?.data?.detail || 'Ошибка удаления')
        }
    }

    const openModal = (user) => {
        setEditingUser(user)
        setFormData({
            role: user.role,
            company_id: user.company_id || '',
            house_id: user.house_id || '',
            apartment: user.apartment || ''
        })
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingUser(null)
    }

    const filteredUsers = roleFilter
        ? users.filter(u => u.role === roleFilter)
        : users

    // Filter houses based on selected company in modal
    const availableHouses = formData.company_id
        ? houses.filter(h => h.company_id == formData.company_id)
        : houses

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Загрузка...</div>

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1>Пользователи</h1>
            </div>

            <div className="filter-tags">
                <div
                    className={`filter-tag ${!roleFilter ? 'active' : ''}`}
                    onClick={() => setRoleFilter('')}
                >
                    Все
                </div>
                <div
                    className={`filter-tag ${roleFilter === 'resident' ? 'active' : ''}`}
                    onClick={() => setRoleFilter('resident')}
                >
                    Жильцы
                </div>
                <div
                    className={`filter-tag ${roleFilter === 'dispatcher' ? 'active' : ''}`}
                    onClick={() => setRoleFilter('dispatcher')}
                >
                    Диспетчеры
                </div>
                <div
                    className={`filter-tag ${roleFilter === 'admin' ? 'active' : ''}`}
                    onClick={() => setRoleFilter('admin')}
                >
                    Администраторы УК
                </div>
                <div
                    className={`filter-tag ${roleFilter === 'super_admin' ? 'active' : ''}`}
                    onClick={() => setRoleFilter('super_admin')}
                >
                    Супер-админы
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Telegram ID</th>
                            <th>Имя</th>
                            <th>Роль</th>
                            <th>Привязка</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.telegram_id}</td>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{user.full_name || user.username}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>@{user.username}</div>
                                </td>
                                <td>
                                    <span className={`badge ${user.role === 'resident' ? 'badge-new' :
                                            user.role === 'admin' ? 'badge-purple' :
                                                user.role === 'super_admin' ? 'badge-error' :
                                                    'badge-work'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    {user.company_name && (
                                        <div style={{ fontSize: 13 }}>🏢 {user.company_name}</div>
                                    )}
                                    {user.house_address && (
                                        <div style={{ fontSize: 13, marginTop: 4 }}>
                                            🏠 {user.house_address}, кв. {user.apartment}
                                        </div>
                                    )}
                                    {!user.company_name && !user.house_address && (
                                        <span style={{ color: 'var(--text-tertiary)' }}>Нет привязок</span>
                                    )}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '6px 12px', fontSize: 13 }}
                                            onClick={() => openModal(user)}
                                        >
                                            Изменить
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: '6px 12px', fontSize: 13 }}
                                            onClick={() => handleDelete(user.id)}
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
                        <h2>Редактирование</h2>
                        <div style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>
                            {editingUser.full_name} (@{editingUser.username})
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Роль</label>
                                <select
                                    className="form-select"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    required
                                >
                                    <option value="resident">Жилец</option>
                                    <option value="dispatcher">Диспетчер</option>
                                    <option value="admin">Администратор УК</option>
                                    <option value="super_admin">Супер-админ</option>
                                </select>
                            </div>

                            {['admin', 'dispatcher', 'resident'].includes(formData.role) && (
                                <div className="form-group">
                                    <label className="form-label">Управляющая Компания</label>
                                    <select
                                        className="form-select"
                                        value={formData.company_id}
                                        onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                                    >
                                        <option value="">Не выбрано</option>
                                        {companies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.role === 'resident' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Дом</label>
                                        <select
                                            className="form-select"
                                            value={formData.house_id}
                                            onChange={e => setFormData({ ...formData, house_id: e.target.value })}
                                        >
                                            <option value="">Не выбрано</option>
                                            {availableHouses.map(h => (
                                                <option key={h.id} value={h.id}>{h.address}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Квартира</label>
                                        <input
                                            className="form-input"
                                            value={formData.apartment}
                                            onChange={e => setFormData({ ...formData, apartment: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

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
