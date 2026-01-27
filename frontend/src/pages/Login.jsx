import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function Login() {
    const { login, demoLogin, error } = useAuth()

    useEffect(() => {
        // Проверяем, запущены ли в Telegram Mini App
        if (window.Telegram?.WebApp?.initData) {
            login(window.Telegram.WebApp.initData)
        }
    }, [])

    const handleTelegramLogin = () => {
        if (window.Telegram?.WebApp?.initData) {
            login(window.Telegram.WebApp.initData)
        } else {
            alert('Откройте приложение через Telegram')
        }
    }

    const handleDemoLogin = async () => {
        try {
            await demoLogin()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="page" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            padding: '32px'
        }}>
            <div style={{ marginBottom: '48px' }}>
                <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </div>

                <h1 className="title">УК Заявки</h1>
                <p className="text-secondary">
                    Система учета заявок<br />для управляющих компаний
                </p>
            </div>

            {error && (
                <div style={{
                    color: 'var(--color-error)',
                    marginBottom: '24px',
                    padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '12px'
                }}>
                    {error}
                </div>
            )}

            <div style={{ width: '100%', maxWidth: 320 }}>
                <button
                    className="btn btn-primary btn-block btn-lg"
                    onClick={handleTelegramLogin}
                    style={{ marginBottom: '16px' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.229.166.331.014.102.03.332.017.512z" />
                    </svg>
                    Войти через Telegram
                </button>

                <button
                    className="btn btn-secondary btn-block"
                    onClick={handleDemoLogin}
                >
                    Демо-вход (для теста)
                </button>
            </div>

            <p className="text-muted" style={{ marginTop: '48px', maxWidth: 280 }}>
                Войдите через Telegram, чтобы создавать заявки и отслеживать их статус
            </p>
        </div>
    )
}
