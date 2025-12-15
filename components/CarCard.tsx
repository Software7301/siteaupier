'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Fuel, Gauge, ShoppingCart } from 'lucide-react'

interface Car {
  id: string
  name: string
  brand: string
  model: string
  year: number
  price: number
  category: string
  imageUrl: string
  mileage?: number | null
  fuel: string
  transmission: string
  featured?: boolean
}

interface CarCardProps {
  car: Car
}

// Função para formatar preço em Real brasileiro
function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Mapeamento de categorias para português
const categoryLabels: Record<string, string> = {
  SUV: 'SUV',
  ESPORTIVO: 'Esportivo',
  SEDAN: 'Sedã',
  COMPACTO: 'Compacto',
}

// Mapeamento de combustível para português
const fuelLabels: Record<string, string> = {
  FLEX: 'Flex',
  GASOLINA: 'Gasolina',
  DIESEL: 'Diesel',
  ELETRICO: 'Elétrico',
  HIBRIDO: 'Híbrido',
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <div className="card group overflow-hidden">
      {/* Imagem */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={car.imageUrl}
          alt={car.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Badge de Destaque */}
        {car.featured && (
          <div className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            ⭐ Destaque
          </div>
        )}
        
        {/* Badge de Categoria */}
        <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
          {categoryLabels[car.category] || car.category}
        </div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
      </div>

      {/* Conteúdo */}
      <div className="p-6 space-y-4">
        {/* Nome e Marca */}
        <div>
          <p className="text-text-muted text-sm font-medium">{car.brand}</p>
          <h3 className="text-xl font-display font-bold text-white group-hover:text-primary transition-colors">
            {car.name}
          </h3>
        </div>

        {/* Especificações */}
        <div className="flex items-center gap-4 text-text-secondary text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="w-4 h-4 text-primary" />
            <span>{fuelLabels[car.fuel] || car.fuel}</span>
          </div>
          {car.mileage !== null && car.mileage !== undefined && (
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-primary" />
              <span>{car.mileage.toLocaleString('pt-BR')} km</span>
            </div>
          )}
        </div>

        {/* Preço e Botões */}
        <div className="pt-4 border-t border-surface-border space-y-3">
          <div>
            <p className="text-text-muted text-xs">A partir de</p>
            <p className="text-2xl font-display font-bold text-gradient">
              {formatPrice(car.price)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/checkout/${car.id}`}
              prefetch={true}
              className="btn-primary flex items-center gap-2 !px-4 !py-2.5 text-sm flex-1 justify-center"
            >
              <ShoppingCart className="w-4 h-4" />
              Comprar
            </Link>
            <button
              onClick={async (e) => {
                e.preventDefault()
                const phone = localStorage.getItem('autopier_user_phone')
                const name = localStorage.getItem('autopier_user_name')
                
                if (!phone) {
                  const userPhone = prompt('Digite seu telefone para negociar:')
                  if (!userPhone) return
                  const userName = prompt('Digite seu nome:') || 'Cliente'
                  localStorage.setItem('autopier_user_phone', userPhone.replace(/\D/g, ''))
                  localStorage.setItem('autopier_user_name', userName)
                  
                  try {
                    const response = await fetch('/api/negociacao/quick', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        carId: car.id,
                        customerPhone: userPhone,
                        customerName: userName,
                      }),
                    })
                    const data = await response.json()
                    if (data.chatId) {
                      window.location.href = `/negociacao/${data.chatId}`
                    }
                  } catch (error) {
                    console.error('Erro ao criar negociação:', error)
                    alert('Erro ao iniciar negociação. Tente novamente.')
                  }
                } else {
                  try {
                    const response = await fetch('/api/negociacao/quick', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        carId: car.id,
                        customerPhone: phone,
                        customerName: name || 'Cliente',
                      }),
                    })
                    const data = await response.json()
                    if (data.chatId) {
                      window.location.href = `/negociacao/${data.chatId}`
                    }
                  } catch (error) {
                    console.error('Erro ao criar negociação:', error)
                    alert('Erro ao iniciar negociação. Tente novamente.')
                  }
                }
              }}
              className="btn-secondary flex items-center gap-2 !px-4 !py-2.5 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Negociar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

