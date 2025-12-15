import { NextResponse } from 'next/server'
import { 
  getNegotiations, 
  createNegotiation, 
  getCarById, 
  createChatSession,
  getChatSessionByReference,
  createMessage,
  onMessageSent
} from '@/lib/storage'

// POST - Criar ou reutilizar negociação rapidamente (apenas carId e telefone)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { carId, customerPhone, customerName } = body

    if (!carId || !customerPhone) {
      return NextResponse.json(
        { error: 'carId e customerPhone são obrigatórios' },
        { status: 400 }
      )
    }

    const normalizedPhone = customerPhone.replace(/\D/g, '')

    // Verificar se já existe negociação ativa para este carro e telefone
    const existingNegotiations = getNegotiations()
    const existingNegotiation = existingNegotiations.find(
      n => n.carId === carId && 
           n.customerPhone.replace(/\D/g, '') === normalizedPhone &&
           (n.status === 'PENDING' || n.status === 'IN_PROGRESS' || n.status === 'OPEN')
    )

    if (existingNegotiation) {
      // Reutilizar negociação existente
      const chatSession = getChatSessionByReference('negotiation', existingNegotiation.id)
      
      return NextResponse.json({
        negotiationId: existingNegotiation.id,
        chatId: existingNegotiation.id, // O chatId é o negotiationId
        isNew: false,
        message: 'Negociação existente encontrada',
      })
    }

    // Criar nova negociação
    const car = getCarById(carId)
    const negotiation = createNegotiation({
      carId,
      customerName: customerName || 'Cliente',
      customerPhone: normalizedPhone,
      customerEmail: '',
      type: 'COMPRA',
      status: 'PENDING',
    })

    // Criar mensagem inicial
    const initialMessage = `Olá! Tenho interesse em negociar o veículo ${car.name}.`
    const msg = createMessage({
      negotiationId: negotiation.id,
      content: initialMessage,
      sender: 'cliente',
      senderName: customerName || 'Cliente',
    })

    // Criar sessão de chat persistente
    createChatSession({
      type: 'negotiation',
      referenceId: negotiation.id,
      clientId: `client-${normalizedPhone}`,
      clientName: customerName || 'Cliente',
      clientPhone: normalizedPhone,
      vehicleName: car.name,
      vehiclePrice: car.price,
      status: 'waiting_response',
    })

    // Atualizar sessão com a mensagem inicial
    onMessageSent('negotiation', negotiation.id, msg, true)

    console.log('✅ Negociação criada:', negotiation.id)

    return NextResponse.json({
      negotiationId: negotiation.id,
      chatId: negotiation.id,
      isNew: true,
      message: 'Negociação criada com sucesso',
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar/reutilizar negociação:', error)
    return NextResponse.json(
      { error: 'Erro ao criar negociação' },
      { status: 500 }
    )
  }
}


