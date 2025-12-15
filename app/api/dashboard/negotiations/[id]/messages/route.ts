import { NextResponse } from 'next/server'
import { getNegotiationById, updateNegotiation, getMessagesByNegotiationId, createMessage, onMessageSent, markChatAsRead } from '@/lib/storage'

// GET - Buscar mensagens da negociação
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

    const messages = getMessagesByNegotiationId(id)

    // Marcar chat como lido (funcionário está visualizando)
    markChatAsRead('negotiation', id)

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return NextResponse.json([])
  }
}

// POST - Enviar mensagem (funcionário)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content } = body

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

    // Criar mensagem do funcionário
    const message = createMessage({
      negotiationId: id,
      content: content.trim(),
      sender: 'funcionario',
      senderName: 'AutoPier',
    })

    // Atualizar status da negociação para "em andamento" se estiver pendente
    if (negotiation.status === 'PENDING') {
      updateNegotiation(id, { status: 'IN_PROGRESS' })
    }

    // Atualizar sessão de chat (persistência)
    onMessageSent('negotiation', id, message, false)

    console.log('✅ Mensagem enviada:', message.id)

    return NextResponse.json(message)
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem' },
      { status: 500 }
    )
  }
}
