'use client'

import { useEffect } from 'react'
import ActiveChatBanner from './ActiveChatBanner'

interface ClientProvidersProps {
  children: React.ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  // Solicitar permissão de notificação ao carregar
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Atrasar para não ser intrusivo
      const timer = setTimeout(() => {
        Notification.requestPermission()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <>
      {children}
      <ActiveChatBanner />
    </>
  )
}

