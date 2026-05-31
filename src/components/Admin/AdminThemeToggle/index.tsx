'use client'

import { useTheme } from '@payloadcms/ui'
import { Moon, Sun } from 'lucide-react'
import React, { useEffect } from 'react'

import './index.scss'

const cookieName = 'payload-theme'

export const AdminThemeToggle: React.FC = () => {
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    const hasThemeCookie = document.cookie
      .split('; ')
      .some((cookie) => cookie.startsWith(`${cookieName}=`))

    if (!hasThemeCookie) {
      setTheme('light')
    }
  }, [setTheme])

  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const label = theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'

  return (
    <button
      aria-label={label}
      className="admin-theme-toggle"
      onClick={() => setTheme(nextTheme)}
      title={label}
      type="button"
    >
      {theme === 'dark' ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
    </button>
  )
}
