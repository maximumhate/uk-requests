import { useState, useEffect } from 'react'
import api from '../../api/client'
import {
    Pencil,
    Trash2,
    User,
    Shield,
    Building2,
    Home,
    Search,
    Filter,
    ShieldCheck,
    Contact
} from 'lucide-react'

const ROLE_LABELS = {
    resident: 'Жилец',
    dispatcher: 'Диспетчер',
    admin: 'Администратор УК',
    super_admin: 'Супер-админ'
}

const ROLE_BADGES = {
    resident: 'badge-new',
    dispatcher: 'badge-work',
    admin: 'badge-purple',
    super_admin: 'badge-error'
}

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
    const [searchTerm, setSearchTerm] = useState('')

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
            const payload = {
                role: formData.role,
                company_id: formData.company_id || null,
                house_id: formData.house_id || null,
                apartment: formData.apartment || null
            }

            await api.patch(`/superadmin/users/${editingUser.id}`, payload)
            fetchData()
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

    const filteredUsers = users.filter(u => {
        const matchesRole = !roleFilter || u.role === roleFilter
        const nameToSearch = `${u.full_name || ''} ${u.username || ''} ${u.telegram_id || ''}`.toLowerCase()
        const matchesSearch = nameToSearch.includes(searchTerm.toLowerCase())
        return matchesRole && matchesSearch
    })

    const availableHouses = formData.company_id
        ? houses.filter(h => h.company_id == formData.company_id)
        : houses

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className="spinner"></div>
        </div>
    )

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ marginBottom: 4 }}>Пользователи</h1>
                <p className="text-secondary">Управление ролями и привязками пользователей системы</p>
            </div>

            <div className="card" style={{ marginBottom: 24, padding: '16px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: 16 }}>
                    <div style={{ position: 'relative' }}>
                        <Search
                            size={20}
                            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                        />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Поиск по имени, username или ID..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: 48 }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Filter
                            size={18}
                            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                        />
                        <select
                            className="form-select"
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                            style={{ paddingLeft: 40 }}
                        >
                            <option value="">Все роли</option>
                            {Object.entries(ROLE_LABELS).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Пользователь</th>
                            <th>Роль</th>
                            <th>Привязка</th>
                            <th style={{ textAlign: 'right' }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            background: 'var(--bg-tertiary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--accent-primary)'
                                        }}>
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{user.full_name || user.username || `User ${user.telegram_id}`}</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <span className="text-muted">ID: {user.telegram_id}</span>
                                                {user.username && <span>• @{user.username}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${ROLE_BADGES[user.role] || 'badge-new'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        {user.role === 'super_admin' ? <ShieldCheck size={12} /> : <Shield size={12} />}
                                        {ROLE_LABELS[user.role] || user.role}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {user.company_name ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                                <Building2 size={14} className="text-muted" />
                                                <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>{user.company_name}</span>
                                            </div>
                                        ) : null}
                                        {user.house_address ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                                <Home size={14} className="text-muted" />
                                                <span>{user.house_address}{user.apartment ? `, кв. ${user.apartment}` : ''}</span>
                                            </div>
                                        ) : null}
                                        {!user.company_name && !user.house_address && (
                                            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Нет привязок</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                        <button
                                            className="btn btn-secondary btn-icon"
                                            onClick={() => openModal(user)}
                                            title="Изменить"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="btn btn-danger btn-icon"
                                            onClick={() => handleDelete(user.id)}
                                            title="Удалить"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                                    Пользователи не найдены
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="modal-content">
                        <div style={{ marginBottom: 24 }}>
                            <h2 style={{ marginBottom: 4 }}>Редактирование прав</h2>
                            <p className="text-secondary">Управление доступом для {editingUser.full_name || editingUser.username}</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Роль *</label>
                                <div style={{ position: 'relative' }}>
                                    <Shield size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <select
                                        className="form-select"
                                        style={{ paddingLeft: 40 }}
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        required
                                    >
                                        {Object.entries(ROLE_LABELS).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {['admin', 'dispatcher', 'resident'].includes(formData.role) && (
                                <div className="form-group">
                                    <label className="form-label">Управляющая Компания</label>
                                    <div style={{ position: 'relative' }}>
                                        <Building2 size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <select
                                            className="form-select"
                                            style={{ paddingLeft: 40 }}
                                            value={formData.company_id}
                                            onChange={e => setFormData({ ...formData, company_id: e.target.value, house_id: '' })}
                                        >
                                            <option value="">Не выбрано</option>
                                            {companies.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {formData.role === 'resident' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Дом</label>
                                        <div style={{ position: 'relative' }}>
                                            <Home size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <select
                                                className="form-select"
                                                style={{ paddingLeft: 40 }}
                                                value={formData.house_id}
                                                onChange={e => setFormData({ ...formData, house_id: e.target.value })}
                                            >
                                                <option value="">Не выбрано</option>
                                                {availableHouses.map(h => (
                                                    <option key={h.id} value={h.id}>{h.address}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Квартира</label>
                                        <div style={{ position: 'relative' }}>
                                            <Contact size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                className="form-input"
                                                style={{ paddingLeft: 40 }}
                                                value={formData.apartment}
                                                onChange={e => setFormData({ ...formData, apartment: e.target.value })}
                                                placeholder="Номер квартиры"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                                <button type="button" className="btn btn-secondary" onClick={closeModal} style={{ flex: 1 }}>
                                    Отмена
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Сохранить изменения
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
