'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Send, 
  Car, 
  Users,
  Calendar,
  CreditCard,
  Palette,
  Phone,
  CheckCircle,
  MessageSquare,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  content: string
  createdAt: string
  sender: 'funcionario' | 'cliente'
  senderName: string
}

interface Pedido {
  id: string
  cliente: {
    nome: string
    telefone: string
    rg: string
  }
  veiculo: {
    id: string
    nome: string
    ano: number
    cor: string
  }
  pagamento: {
    metodo: string
    parcelas: number
    valorTotal: number
    valorParcela: number
  }
  status: string
  dataPedido: string
}

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendente', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  PROCESSING: { label: 'Em Processamento', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  COMPLETED: { label: 'Finalizado', color: 'text-green-400', bg: 'bg-green-500/20' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500/20' },
}

const statusOptions = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(price)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PedidoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const pedidoId = params.id as string

  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Buscar dados do pedido e mensagens
  useEffect(() => {
    async function fetchData() {
      try {
        // Buscar pedido
        const orderResponse = await fetch(`/api/dashboard/orders/${pedidoId}`)
        if (orderResponse.ok) {
          const data = await orderResponse.json()
          setPedido(data)
        } else {
          setPedido(null)
        }

        // Buscar mensagens do chat
        const chatResponse = await fetch(`/api/pedido/${pedidoId}/chat`)
        if (chatResponse.ok) {
          const chatData = await chatResponse.json()
          setMessages(chatData.messages || [])
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
        setPedido(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [pedidoId])

  // Polling para novas mensagens
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/pedido/${pedidoId}/chat`)
        if (response.ok) {
          const data = await response.json()
          if (data.messages && data.messages.length > messages.length) {
            setMessages(data.messages)
          }
        }
      } catch (error) {
        // Silenciar erros de polling
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [pedidoId, messages.length])

  function scrollToBottom() {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    try {
      const response = await fetch(`/api/pedido/${pedidoId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
          sender: 'funcionario',
          senderName: 'AutoPier',
        }),
      })

      if (response.ok) {
        const sentMessage = await response.json()
        setMessages((prev) => [...prev, sentMessage])
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!pedido) return

    try {
      await fetch(`/api/dashboard/orders/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      setPedido({ ...pedido, status: newStatus })
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-text-secondary">Carregando pedido...</p>
        </div>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Car className="w-16 h-16 text-text-muted mx-auto" />
          <h3 className="text-xl font-semibold text-white">Pedido não encontrado</h3>
          <p className="text-text-secondary">
            O pedido solicitado não existe ou foi removido.
          </p>
          <Link href="/dashboard/pedidos" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar para Pedidos
          </Link>
        </div>
      </div>
    )
  }

  const currentStatus = statusLabels[pedido.status] || statusLabels.PENDING

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/pedidos"
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              Pedido #{pedidoId.slice(0, 8)}
            </h1>
            <p className="text-text-secondary">
              {formatDate(pedido.dataPedido)}
            </p>
          </div>
        </div>

        {/* Seletor de Status */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-text-muted text-sm">Status:</span>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((s) => {
              const statusInfo = statusLabels[s]
              const isActive = pedido.status === s
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? `${statusInfo.bg} ${statusInfo.color} ring-2 ring-offset-2 ring-offset-background ring-current`
                      : 'bg-surface text-text-muted hover:text-white'
                  }`}
                >
                  {statusInfo.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal - Chat */}
        <div className="lg:col-span-2 card-static flex flex-col overflow-hidden">
          {/* Header do Chat */}
          <div className="p-5 border-b border-surface-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Chat com {pedido.cliente.nome}</h3>
                <p className="text-text-muted text-sm">Alinhe os detalhes da entrega</p>
              </div>
            </div>
          </div>

          {/* Área de Mensagens */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[350px] max-h-[450px]"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-3" />
                  <p className="text-text-secondary">Nenhuma mensagem ainda</p>
                  <p className="text-text-muted text-sm">Inicie a conversa com o cliente!</p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.map((message) => {
                  const isOwn = message.sender === 'funcionario'
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: isOwn ? 20 : -20, y: 10 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      transition={{ 
                        duration: 0.25, 
                        ease: "easeOut",
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                      className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] min-w-[80px] ${isOwn ? 'items-end' : 'items-start'}`}>
                        {!isOwn && (
                          <p className="text-xs text-text-muted mb-1 px-1">
                            {message.senderName}
                          </p>
                        )}
                        
                        <motion.div 
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className={`inline-block ${isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'}`}
                        >
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                          <p className={`text-xs mt-1.5 ${isOwn ? 'text-white/60' : 'text-text-muted'}`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Input de Mensagem */}
          <form onSubmit={handleSendMessage} className="p-5 border-t border-surface-border bg-surface-dark/50">
            <div className="flex items-center gap-4">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (newMessage.trim() && !sending) {
                      handleSendMessage(e as unknown as React.FormEvent)
                    }
                  }
                }}
                placeholder="Digite sua mensagem..."
                className="flex-1 input-field !py-3.5 text-base"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="btn-primary !p-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Coluna Lateral - Detalhes */}
        <div className="space-y-5">
          {/* Cliente */}
          <div className="card-static p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Dados do Cliente
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-text-muted text-sm">Nome Completo</p>
                <p className="text-white font-medium">{pedido.cliente.nome}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">RG</p>
                <p className="text-white">{pedido.cliente.rg}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-text-muted" />
                <a href={`tel:${pedido.cliente.telefone}`} className="text-primary hover:underline">
                  {pedido.cliente.telefone}
                </a>
              </div>
            </div>
          </div>

          {/* Veículo */}
          <div className="card-static p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              Veículo
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-text-muted text-sm">Modelo</p>
                <p className="text-white font-medium">{pedido.veiculo.nome}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Ano</p>
                <p className="text-white">{pedido.veiculo.ano}</p>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-text-muted" />
                <span className="text-white">{pedido.veiculo.cor}</span>
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <div className="card-static p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Pagamento
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-text-muted text-sm">Forma de Pagamento</p>
                <p className="text-white font-medium">{pedido.pagamento.metodo}</p>
              </div>
              {pedido.pagamento.parcelas > 1 && (
                <div>
                  <p className="text-text-muted text-sm">Parcelas</p>
                  <p className="text-white">
                    {pedido.pagamento.parcelas}x de {formatPrice(pedido.pagamento.valorParcela)}
                  </p>
                </div>
              )}
              <div className="pt-3 border-t border-surface-border">
                <p className="text-text-muted text-sm">Valor Total</p>
                <p className="text-accent font-bold text-2xl">
                  {formatPrice(pedido.pagamento.valorTotal)}
                </p>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="card-static p-6 space-y-3">
            <button 
              onClick={() => handleStatusChange('COMPLETED')}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Marcar como Finalizado
            </button>
            <button className="btn-secondary w-full flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              Agendar Entrega
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
