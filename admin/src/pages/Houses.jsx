import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Houses() {
    const [houses, setHouses] = useState([])
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ company_id: '', address: '', apartment_count: '' })
    const [editId, setEditId] = useState(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [housesRes, companiesRes] = await Promise.all([
                api.get('/houses'),
                api.get('/companies')
            ])
            setHouses(housesRes.data.items || [])
            setCompanies(companiesRes.data.items || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = {
            ...form,
            company_id: parseInt(form.company_id),
            apartment_count: form.apartment_count ? parseInt(form.apartment_count) : null
        }

        try {
            if (editId) {
                await api.put(`/houses/${editId}`, data)
            } else {
                await api.post('/houses', data)
            }
            setShowModal(false)
            setForm({ company_id: '', address: '', apartment_count: '' })
            setEditId(null)
            loadData()
        } catch (err) {
            alert(err.response?.data?.detail || 'Ошибка')
        }
    }

    const handleEdit = (house) => {
        setForm({
            company_id: house.company_id.toString(),
            address: house.address,
            apartment_count: house.apartment_count?.toString() || ''
        })
        setEditId(house.id)
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Удалить дом?')) return
        try {
            await api.delete(`/houses/${id}`)
            loadData()
        } catch (err) {
            alert(err.response?.data?.detail || 'Ошибка')
        }
    }

    const getCompanyName = (companyId) => {
        const company = companies.find(c => c.id === companyId)
        return company?.name || '—'
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Дома</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Добавить дом
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : houses.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                        Нет домов. Сначала добавьте УК.
                    </p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Адрес</th>
                                    <th>УК</th>
                                    <th>Квартир</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {houses.map(house => (
                                    <tr key={house.id}>
                                        <td>{house.id}</td>
                                        <td>{house.address}</td>
                                        <td>{getCompanyName(house.company_id)}</td>
                                        <td>{house.apartment_count || '—'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleEdit(house)}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleDelete(house.id)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => { setShowModal(false); setEditId(null); setForm({ company_id: '', address: '', apartment_count: '' }) }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editId ? 'Редактировать' : 'Добавить'} дом</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">УК *</label>
                                <select
                                    className="form-input"
                                    value={form.company_id}
                                    onChange={e => setForm({ ...form, company_id: e.target.value })}
                                    required
                                >
                                    <option value="">Выберите УК</option>
                                    {companies.map(company => (
                                        <option key={company.id} value={company.id}>{company.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Адрес *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                    placeholder="ул. Ленина, д. 10"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Количество квартир</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={form.apartment_count}
                                    onChange={e => setForm({ ...form, apartment_count: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                {editId ? 'Сохранить' : 'Добавить'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
