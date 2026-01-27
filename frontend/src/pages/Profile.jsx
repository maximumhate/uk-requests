import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { companiesApi, housesApi } from '../api/client'
import Header from '../components/layout/Header'

export default function Profile() {
    const navigate = useNavigate()
    const { user, updateProfile, logout } = useAuth()
    const { theme, setTheme } = useTheme()
    const [companies, setCompanies] = useState([])
    const [houses, setHouses] = useState([])
    const [selectedCompany, setSelectedCompany] = useState('')
    const [selectedHouse, setSelectedHouse] = useState(user?.house_id || '')
    const [apartment, setApartment] = useState(user?.apartment || '')
    const [phone, setPhone] = useState(user?.phone || '')
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        loadCompanies()
    }, [])

    useEffect(() => {
        if (selectedCompany) {
            loadHouses(selectedCompany)
        } else {
            setHouses([])
        }
    }, [selectedCompany])

    // Определяем текущую УК по дому пользователя
    useEffect(() => {
        if (user?.house_id && houses.length > 0) {
            const house = houses.find(h => h.id === user.house_id)
            if (house) {
                setSelectedCompany(house.company_id)
            }
        }
    }, [user?.house_id, houses])

    const loadCompanies = async () => {
        try {
            const response = await companiesApi.getAll()
            setCompanies(response.data.items)

            // Если у пользователя есть дом, загрузим все дома, чтобы определить УК
            if (user?.house_id) {
                const housesResponse = await housesApi.getAll()
                const allHouses = housesResponse.data.items
                const userHouse = allHouses.find(h => h.id === user.house_id)
                if (userHouse) {
                    setSelectedCompany(userHouse.company_id.toString())
                }
            }
        } catch (err) {
            console.error(err)
        }
    }

    const loadHouses = async (companyId) => {
        try {
            const response = await housesApi.getAll({ company_id: companyId })
            setHouses(response.data.items)
        } catch (err) {
            console.error(err)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setLoading(true)
        setSaved(false)

        try {
            await updateProfile({
                house_id: selectedHouse ? parseInt(selectedHouse) : null,
                apartment: apartment.trim() || null,
                phone: phone.trim() || null
            })
            setSaved(true)
            setTimeout(() => {
                setSaved(false)
                navigate('/')
            }, 1000)
        } catch (err) {
            alert(err.response?.data?.detail || 'Ошибка сохранения')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        if (confirm('Выйти из аккаунта?')) {
            logout()
        }
    }

    return (
        <div className="page safe-area-bottom">
            <Header title="Профиль" />

            <div className="container">
                {/* User Info */}
                <div className="card" style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, #6366F1 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '24px',
                        color: 'white',
                        fontWeight: 600
                    }}>
                        {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
                        {user?.first_name} {user?.last_name}
                    </h2>
                    {user?.username && (
                        <p className="text-secondary">@{user.username}</p>
                    )}
                </div>

                {/* Settings Form */}
                <form onSubmit={handleSave}>
                    <div className="card" style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                            Адрес проживания
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Управляющая компания</label>
                            <select
                                className="form-select"
                                value={selectedCompany}
                                onChange={(e) => {
                                    setSelectedCompany(e.target.value)
                                    setSelectedHouse('')
                                }}
                            >
                                <option value="">Выберите УК</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Адрес дома</label>
                            <select
                                className="form-select"
                                value={selectedHouse}
                                onChange={(e) => setSelectedHouse(e.target.value)}
                                disabled={!selectedCompany}
                            >
                                <option value="">Выберите адрес</option>
                                {houses.map(house => (
                                    <option key={house.id} value={house.id}>
                                        {house.address}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Номер квартиры</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Например: 42"
                                value={apartment}
                                onChange={(e) => setApartment(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                            Контактные данные
                        </h3>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Телефон</label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="+7 (999) 123-45-67"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>


                    <div className="card" style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                            Внешний вид
                        </h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[
                                { id: 'light', label: 'Светлая', icon: '☀️' },
                                { id: 'dark', label: 'Тёмная', icon: '🌙' },
                                { id: 'system', label: 'Системная', icon: '⚙️' }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    type="button"
                                    className={`btn ${theme === t.id ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setTheme(t.id)}
                                    style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                                >
                                    {t.icon} {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Сохранение...' : saved ? '✓ Сохранено' : 'Сохранить'}
                    </button>
                </form>

                {/* Logout */}
                <button
                    className="btn btn-ghost btn-block"
                    onClick={handleLogout}
                    style={{ marginTop: '16px', color: 'var(--color-error)' }}
                >
                    Выйти из аккаунта
                </button>
            </div >
        </div >
    )
}
