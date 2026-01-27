import { useState, useEffect } from 'react'
import api from '../../api/client'
import {
    Plus,
    Pencil,
    Trash2,
    Home,
    Users as UsersIcon,
    Search,
    Filter,
    Building2,
    Hash
} from 'lucide-react'

export default function Houses() {
    const [houses, setHouses] = useState([])
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingHouse, setEditingHouse] = useState(null)
    const [formData, setFormData] = useState({ company_id: '', address: '', apartment_count: '' })
    const [filterCompany, setFilterCompany] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        fetchHouses()
    }, [filterCompany])

    const fetchData = async () => {
        try {
            const [companiesRes, housesRes] = await Promise.all([
                api.get('/superadmin/companies'),
                api.get('/superadmin/houses')
            ])
            setCompanies(companiesRes.data)
            setHouses(housesRes.data)

            // Set first company as default for new house
            if (companiesRes.data.length > 0) {
                setFormData(prev => ({ ...prev, company_id: companiesRes.data[0].id }))
            }
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchHouses = async () => {
        try {
            const params = filterCompany ? { company_id: filterCompany } : {}
            const response = await api.get('/superadmin/houses', { params })
            setHouses(response.data)
        } catch (error) {
            console.error('Failed to fetch houses:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingHouse) {
                await api.patch(`/superadmin/houses/${editingHouse.id}`, formData)
            } else {
                await api.post('/superadmin/houses', formData)
            }
            fetchHouses()
            closeModal()
        } catch (error) {
            console.error('Failed to save house:', error)
            alert('Ошибка при сохранении')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены? Это удалит дом и отвяжет жильцов!')) return
        try {
            await api.delete(`/superadmin/houses/${id}`)
            fetchHouses()
        } catch (error) {
            console.error('Failed to delete house:', error)
        }
    }

    const openModal = (house = null) => {
        if (house) {
            setEditingHouse(house)
            setFormData({
                company_id: house.company_id,
                address: house.address,
                apartment_count: house.apartment_count
            })
        } else {
            setEditingHouse(null)
            setFormData({
                company_id: companies[0]?.id || '',
                address: '',
                apartment_count: 100
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingHouse(null)
    }

    const filteredHouses = houses.filter(h =>
        h.address.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 style={{ marginBottom: 4 }}>Жилые Дома</h1>
                    <p className="text-secondary">Управление жилым фондом по всем УК</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Plus size={20} />
                    <span>Добавить дом</span>
                </button>
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
                            placeholder="Поиск по адресу..."
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
                            value={filterCompany}
                            onChange={e => setFilterCompany(e.target.value)}
                            style={{ paddingLeft: 40 }}
                        >
                            <option value="">Все компании</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>УК</th>
                            <th>Адрес</th>
                            <th>Инфо</th>
                            <th>Жильцов</th>
                            <th style={{ textAlign: 'right' }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHouses.map(house => (
                            <tr key={house.id}>
                                <td className="text-muted">#{house.id}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Building2 size={14} className="text-muted" />
                                        <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>
                                            {house.company_name || '-'}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ fontWeight: 600 }}>{house.address}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                        <Hash size={14} className="text-muted" />
                                        <span>{house.apartment_count} кв.</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="badge badge-new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <UsersIcon size={12} />
                                        {house.resident_count}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                        <button
                                            className="btn btn-secondary btn-icon"
                                            onClick={() => openModal(house)}
                                            title="Изменить"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="btn btn-danger btn-icon"
                                            onClick={() => handleDelete(house.id)}
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
                            <h2 style={{ marginBottom: 4 }}>{editingHouse ? 'Редактировать Дом' : 'Новый Дом'}</h2>
                            <p className="text-secondary">Привяжите дом к организации и укажите данные</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Управляющая Компания *</label>
                                <select
                                    className="form-select"
                                    value={formData.company_id}
                                    onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Выберите компанию</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Адрес *</label>
                                <div style={{ position: 'relative' }}>
                                    <Home size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        className="form-input"
                                        style={{ paddingLeft: 40 }}
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Например: ул. Ленина, д. 15"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Количество квартир</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.apartment_count}
                                    onChange={e => setFormData({ ...formData, apartment_count: e.target.value })}
                                    required
                                    min="1"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                                <button type="button" className="btn btn-secondary" onClick={closeModal} style={{ flex: 1 }}>
                                    Отмена
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {editingHouse ? 'Сохранить изменения' : 'Создать дом'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
