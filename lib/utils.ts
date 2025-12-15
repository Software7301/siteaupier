// Funções utilitárias

import { clsx, type ClassValue } from 'clsx'

/**
 * Combina classes CSS com suporte a condicionais
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Formata preço em Real brasileiro
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Formata data completa
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formata data e hora
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formata apenas hora
 */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formata número de quilometragem
 */
export function formatMileage(km: number): string {
  return `${km.toLocaleString('pt-BR')} km`
}

/**
 * Trunca texto com reticências
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

/**
 * Gera ID único simples
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Delay/sleep assíncrono
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Valida telefone brasileiro
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

/**
 * Formata telefone brasileiro
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

// Mapeamentos de labels

export const categoryLabels: Record<string, string> = {
  SUV: 'SUV',
  ESPORTIVO: 'Esportivo',
  SEDAN: 'Sedã',
  COMPACTO: 'Compacto',
}

export const fuelLabels: Record<string, string> = {
  FLEX: 'Flex',
  GASOLINA: 'Gasolina',
  DIESEL: 'Diesel',
  ELETRICO: 'Elétrico',
  HIBRIDO: 'Híbrido',
}

export const transmissionLabels: Record<string, string> = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automático',
}

export const paymentLabels: Record<string, string> = {
  PIX: 'Pix',
  DINHEIRO: 'Dinheiro',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
  FINANCIAMENTO: 'Financiamento',
  OUTROS: 'Outros',
}

export const orderStatusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

export const negotiationStatusLabels: Record<string, string> = {
  OPEN: 'Aberta',
  IN_PROGRESS: 'Em Andamento',
  ACCEPTED: 'Aceita',
  REJECTED: 'Rejeitada',
  CLOSED: 'Fechada',
}

