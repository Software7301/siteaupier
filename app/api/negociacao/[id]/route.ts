import { NextResponse } from 'next/server'
import { getNegotiationById, updateNegotiation, getMessagesByNegotiationId, createMessage, getCarById } from '@/lib/storage'

// GET - Buscar negociação por ID com mensagens
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const clientPhone = searchParams.get('phone') // Telefone do cliente para validação
    
    const negotiation = getNegotiationById(id)

    if (!negotiation) {
      return NextResponse.json(
        { error: 'Negociação não encontrada' },
        { status: 404 }
      )
    }

    // Validação de acesso: cliente só pode acessar suas próprias negociações
    if (clientPhone) {
      const normalizedClientPhone = clientPhone.replace(/\D/g, '')
      const normalizedNegPhone = negotiation.customerPhone.replace(/\D/g, '')
      
      if (normalizedClientPhone !== normalizedNegPhone) {
        return NextResponse.json(
          { error: 'Acesso negado. Esta negociação não pertence a você.' },
          { status: 403 }
        )
      }
    }

    const car = getCarById(negotiation.carId)
    const messages = getMessagesByNegotiationId(id)

    const formattedNegotiation = {
      id: negotiation.id,
      type: negotiation.type,
      status: negotiation.status,
      vehicleName: car.name,
      vehicleBrand: car.brand,
      vehicleYear: car.year,
      proposedPrice: car.price,
      buyer: {
        id: 'buyer-' + negotiation.id,
        name: negotiation.customerName,
        role: 'CUSTOMER',
      },
      seller: {
        id: 'seller-autopier',
        name: 'AutoPier Concessionária',
        role: 'DEALER',
      },
      car: car,
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        sender: {
          id: msg.sender === 'cliente' ? 'buyer-' + negotiation.id : 'seller-autopier',
          name: msg.senderName,
          role: msg.sender === 'cliente' ? 'CUSTOMER' : 'DEALER',
        },
      })),
      createdAt: negotiation.createdAt,
    }

    return NextResponse.json(formattedNegotiation)
  } catch (error) {
    console.error('Erro ao buscar negociação:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar negociação' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar status da negociação
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const negotiation = updateNegotiation(id, { status: body.status })

    if (!negotiation) {
      return NextResponse.json(
        { error: 'Negociação não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(negotiation)
  } catch (error) {
    console.error('Erro ao atualizar negociação:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar negociação' },
      { status: 500 }
    )
  }
}

// POST - Enviar mensagem na negociação (cliente)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, senderName } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Mensagem não pode ser vazia' },
        { status: 400 }
      )
    }

    const negotiation = getNegotiationById(id)

    if (!negotiation) {
      return NextResponse.json(
        { error: 'Negociação não encontrada' },
        { status: 404 }
      )
    }

    // Criar mensagem do cliente
    const message = createMessage({
      negotiationId: id,
      content: content.trim(),
      sender: 'cliente',
      senderName: senderName || negotiation.customerName,
    })

    console.log('✅ Mensagem do cliente:', message.id)

    return NextResponse.json({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      sender: {
        id: 'buyer-' + id,
        name: message.senderName,
        role: 'CUSTOMER',
      },
    })
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem' },
      { status: 500 }
    )
  }
}
