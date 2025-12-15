'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  onClick?: () => void
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isTabActiveRef = useRef(true)

  // Inicializar áudio e verificar permissão
  useEffect(() => {
    // Criar elemento de áudio com fallback
    if (typeof window !== 'undefined') {
      // Tentar carregar arquivo de som local (WAV ou MP3)
      audioRef.current = new Audio('/sounds/notification.wav')
      audioRef.current.volume = 0.5
      
      // Fallback: criar som usando Web Audio API se arquivo não carregar
      audioRef.current.onerror = () => {
        console.log('Usando som gerado por Web Audio API')
        audioRef.current = null // Usar fallback no playSound
      }
      
      // Verificar permissão de notificação
      if ('Notification' in window) {
        setPermission(Notification.permission)
      }
    }

    // Detectar quando a aba está ativa/inativa
    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Solicitar permissão de notificação
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    }
    return Notification.permission
  }, [])

  // Tocar som de notificação
  const playSound = useCallback(() => {
    console.log('🔊 Tentando tocar som de notificação...')
    
    // Sempre usar Web Audio API (mais confiável)
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Criar dois tons para um som mais agradável
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = frequency
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration)
        
        oscillator.start(audioContext.currentTime + startTime)
        oscillator.stop(audioContext.currentTime + startTime + duration)
      }
      
      // Som de "ding dong" suave
      playTone(880, 0, 0.15)      // A5
      playTone(1174.66, 0.1, 0.2) // D6
      
      console.log('🔊 Som tocado com sucesso!')
    } catch (e) {
      console.error('🔊 Erro ao tocar som:', e)
      
      // Fallback: tentar usar arquivo de áudio
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((err) => {
          console.error('🔊 Erro no fallback de áudio:', err)
        })
      }
    }
  }, [])

  // Enviar notificação do navegador
  const sendBrowserNotification = useCallback((options: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/images.png',
        tag: options.tag,
        badge: '/images.png',
        silent: true, // Som é controlado separadamente
      })

      if (options.onClick) {
        notification.onclick = () => {
          window.focus()
          options.onClick?.()
          notification.close()
        }
      }

      // Auto-fechar após 5 segundos
      setTimeout(() => notification.close(), 5000)
    }
  }, [])

  // Notificar nova mensagem
  const notifyNewMessage = useCallback((
    senderName: string,
    messagePreview: string,
    type: 'negociacao' | 'pedido' = 'negociacao',
    onClick?: () => void
  ) => {
    // Sempre tocar som se a aba não estiver ativa
    if (!isTabActiveRef.current) {
      playSound()
      
      // Enviar notificação do navegador
      sendBrowserNotification({
        title: `Nova mensagem - AutoPier`,
        body: `${senderName}: ${messagePreview.slice(0, 50)}${messagePreview.length > 50 ? '...' : ''}`,
        tag: `message-${type}`,
        onClick,
      })
    }
  }, [playSound, sendBrowserNotification])

  // Verificar se a aba está ativa
  const isTabActive = useCallback(() => isTabActiveRef.current, [])

  return {
    permission,
    requestPermission,
    playSound,
    sendBrowserNotification,
    notifyNewMessage,
    isTabActive,
  }
}

// Hook para gerenciar estado de "digitando"
export function useTypingIndicator(chatId: string, userId: string) {
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [otherUserName, setOtherUserName] = useState('')
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTypingRef = useRef<number>(0)

  // Enviar status de digitação
  const sendTypingStatus = useCallback(async (typing: boolean) => {
    try {
      await fetch('/api/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          typing,
          userName: userId,
        }),
      })
    } catch (error) {
      // Erro silencioso
    }
  }, [chatId, userId])

  // Lidar com digitação do usuário
  const handleTyping = useCallback(() => {
    const now = Date.now()
    
    // Evitar spam - só enviar a cada 2 segundos
    if (now - lastTypingRef.current > 2000) {
      lastTypingRef.current = now
      sendTypingStatus(true)
    }

    // Resetar timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    setIsTyping(true)

    // Parar de digitar após 3 segundos de inatividade
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      sendTypingStatus(false)
    }, 3000)
  }, [sendTypingStatus])

  // Parar de digitar
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    setIsTyping(false)
    sendTypingStatus(false)
  }, [sendTypingStatus])

  // Polling para verificar se outro usuário está digitando
  useEffect(() => {
    const checkTypingStatus = async () => {
      try {
        const response = await fetch(`/api/typing?chatId=${chatId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.typing && data.userName !== userId) {
            setOtherUserTyping(true)
            setOtherUserName(data.userName)
          } else {
            setOtherUserTyping(false)
          }
        }
      } catch (error) {
        // Erro silencioso
      }
    }

    const interval = setInterval(checkTypingStatus, 1500)
    return () => clearInterval(interval)
  }, [chatId, userId])

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return {
    isTyping,
    otherUserTyping,
    otherUserName,
    handleTyping,
    stopTyping,
  }
}

