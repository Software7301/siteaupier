import { NextResponse } from 'next/server'
import { getNegotiationById, updateNegotiation, getMessagesByNegotiationId, getCarById } from '@/lib/storage'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const negotiation = getNegotiationById(id)

    if (!negotiation) {
      return NextResponse.json(
        { error: 'Negociação não encontrada' },
        { status: 404 }
      )
    }

    const car = getCarById(negotiation.carId)
    const messages = getMessagesByNegotiationId(id)

    const formattedNegotiation = {
      id: negotiation.id,
      cliente: {
        id: negotiation.id,
        nome: negotiation.customerName,
        telefone: negotiation.customerPhone,
        email: negotiation.customerEmail,
      },
      veiculo: {
        id: car.id,
        nome: car.name,
        ano: car.year,
        preco: car.price,
        imageUrl: car.imageUrl,
      },
      tipo: negotiation.type,
      status: negotiation.status,
      criadoEm: negotiation.createdAt,
      mensagens: messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        senderName: msg.senderName,
        createdAt: msg.createdAt,
      })),
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
    const { status } = body

    const negotiation = updateNegotiation(id, { status })

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
