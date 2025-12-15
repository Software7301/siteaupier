import { NextResponse } from 'next/server'
import { createNegotiation, getNegotiations, createMessage, getCarById, createChatSession, onMessageSent } from '@/lib/storage'

// POST - Criar nova negociação
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { 
      type, 
      customerName, 
      customerPhone,
      customerEmail,
      vehicleName,
      vehicleBrand,
      vehicleYear,
      vehicleMileage,
      vehicleDescription,
      proposedPrice,
      vehicleInterest,
      message,
      carId
    } = body

    // Validação básica
    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar negociação
    const negotiation = createNegotiation({
      carId: carId || 'generic',
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      type: type || 'COMPRA',
      status: 'PENDING',
    })

    // Criar mensagem inicial
    const initialMessage = type === 'VENDA'
      ? `Olá! Gostaria de vender meu veículo: ${vehicleBrand} ${vehicleName} ${vehicleYear}. Quilometragem: ${vehicleMileage} km. Valor pretendido: R$ ${proposedPrice?.toLocaleString('pt-BR') || 'A combinar'}. ${vehicleDescription || ''}`
      : message || `Olá! Tenho interesse em negociar. ${vehicleInterest || ''}`

    const msg = createMessage({
      negotiationId: negotiation.id,
      content: initialMessage,
      sender: 'cliente',
      senderName: customerName,
    })

    // Criar sessão de chat persistente
    const car = getCarById(carId || 'generic')
    createChatSession({
      type: 'negotiation',
      referenceId: negotiation.id,
      clientId: `client-${customerPhone.replace(/\D/g, '')}`,
      clientName: customerName,
      clientPhone: customerPhone,
      vehicleName: type === 'SELL' ? `${vehicleBrand} ${vehicleName}` : car.name,
      vehiclePrice: type === 'SELL' ? (proposedPrice || 0) : car.price,
      status: 'waiting_response',
    })

    // Atualizar sessão com a mensagem inicial
    onMessageSent('negotiation', negotiation.id, msg, true)

    console.log('✅ Negociação criada:', negotiation.id)

    return NextResponse.json({
      id: negotiation.id,
      message: 'Negociação criada com sucesso',
      status: negotiation.status,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar negociação:', error)
    return NextResponse.json(
      { error: 'Erro ao criar negociação' },
      { status: 500 }
    )
  }
}

// GET - Listar negociações
export async function GET() {
  try {
    const negotiations = getNegotiations()
    
    const formattedNegotiations = negotiations.map(neg => {
      const car = getCarById(neg.carId)
      return {
        ...neg,
        car,
      }
    })

    return NextResponse.json(formattedNegotiations)
  } catch (error) {
    console.error('Erro ao buscar negociações:', error)
    return NextResponse.json([])
  }
}
