import { useState, useEffect } from 'react'
import api from '../../api/client'

export default function Houses() {
    const [houses, setHouses] = useState([])
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingHouse, setEditingHouse] = useState(null)
    const [formData, setFormData] = useState({ company_id: '', address: '', apartment_count: '' })
    const [filterCompany, setFilterCompany] = useState('')

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

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Загрузка...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <h1>Жилые Дома</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Добавить Дом
                </button>
            </div>

            <div className="filter-tags">
                <div
                    className={`filter-tag ${!filterCompany ? 'active' : ''}`}
                    onClick={() => setFilterCompany('')}
                >
                    Все УК
                </div>
                {companies.map(c => (
                    <div
                        key={c.id}
                        className={`filter-tag ${filterCompany == c.id ? 'active' : ''}`}
                        onClick={() => setFilterCompany(c.id)}
                    >
                        {c.name}
                    </div>
                ))}
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>УК</th>
                            <th>Адрес</th>
                            <th>Квартир</th>
                            <th>Жильцов</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {houses.map(house => (
                            <tr key={house.id}>
                                <td>#{house.id}</td>
                                <td>
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>
                                        {house.company_name || '-'}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 500 }}>{house.address}</td>
                                <td>{house.apartment_count}</td>
                                <td>
                                    <span className="badge badge-new">👥 {house.resident_count}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '6px 12px', fontSize: 13 }}
                                            onClick={() => openModal(house)}
                                        >
                                            Изменить
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: '6px 12px', fontSize: 13 }}
                                            onClick={() => handleDelete(house.id)}
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
                        <h2>{editingHouse ? 'Редактировать Дом' : 'Новый Дом'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Управляющая Компания</label>
                                <select
                                    className="form-select"
                                    value={formData.company_id}
                                    onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                                    required
                                >
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Адрес</label>
                                <input
                                    className="form-input"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="ул. Ленина, д. 1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Количество квартир</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.apartment_count}
                                    onChange={e => setFormData({ ...formData, apartment_count: e.target.value })}
                                    required
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
