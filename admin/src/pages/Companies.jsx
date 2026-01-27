import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Companies() {
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ name: '', phone: '', email: '' })
    const [editId, setEditId] = useState(null)

    useEffect(() => {
        loadCompanies()
    }, [])

    const loadCompanies = async () => {
        try {
            const response = await api.get('/companies')
            setCompanies(response.data.items || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editId) {
                await api.put(`/companies/${editId}`, form)
            } else {
                await api.post('/companies', form)
            }
            setShowModal(false)
            setForm({ name: '', phone: '', email: '' })
            setEditId(null)
            loadCompanies()
        } catch (err) {
            alert(err.response?.data?.detail || 'Ошибка')
        }
    }

    const handleEdit = (company) => {
        setForm({ name: company.name, phone: company.phone || '', email: company.email || '' })
        setEditId(company.id)
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Удалить УК?')) return
        try {
            await api.delete(`/companies/${id}`)
            loadCompanies()
        } catch (err) {
            alert(err.response?.data?.detail || 'Ошибка')
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Управляющие компании</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Добавить УК
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : companies.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                        Нет управляющих компаний
                    </p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Название</th>
                                    <th>Телефон</th>
                                    <th>Email</th>
                                    <th>Домов</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map(company => (
                                    <tr key={company.id}>
                                        <td>{company.id}</td>
                                        <td>{company.name}</td>
                                        <td>{company.phone || '—'}</td>
                                        <td>{company.email || '—'}</td>
                                        <td>{company.houses_count || 0}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleEdit(company)}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleDelete(company.id)}
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
                <div className="modal-overlay" onClick={() => { setShowModal(false); setEditId(null); setForm({ name: '', phone: '', email: '' }) }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editId ? 'Редактировать' : 'Добавить'} УК</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Название *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Телефон</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
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
