import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
    theme: 'system',
    setTheme: () => { }
})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
    // Theme: 'light' | 'dark' | 'system'
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'system'
    })

    useEffect(() => {
        const root = document.documentElement

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

            const applySystemTheme = (e) => {
                if (e.matches) {
                    root.setAttribute('data-theme', 'dark')
                } else {
                    root.setAttribute('data-theme', 'light')
                }
            }

            // Initial check
            applySystemTheme(mediaQuery)

            // Listener
            mediaQuery.addEventListener('change', applySystemTheme)
            return () => mediaQuery.removeEventListener('change', applySystemTheme)
        } else {
            root.setAttribute('data-theme', theme)
        }

        localStorage.setItem('theme', theme)
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
