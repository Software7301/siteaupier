import { NextResponse } from 'next/server'
import { getOrderById, getMessagesByOrderId, createMessage, onMessageSent, markChatAsRead } from '@/lib/storage'

// GET - Buscar mensagens do pedido
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const clientPhone = searchParams.get('phone') // Telefone do cliente para validação
    
    const order = getOrderById(id)
    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Validação de acesso: cliente só pode acessar seus próprios pedidos
    if (clientPhone) {
      const normalizedClientPhone = clientPhone.replace(/\D/g, '')
      const normalizedOrderPhone = order.customerPhone.replace(/\D/g, '')
      
      if (normalizedClientPhone !== normalizedOrderPhone) {
        return NextResponse.json(
          { error: 'Acesso negado. Este pedido não pertence a você.' },
          { status: 403 }
        )
      }
    }

    const messages = getMessagesByOrderId(id)

    return NextResponse.json({
      orderId: id,
      customerName: order.customerName,
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        senderName: msg.senderName,
        createdAt: msg.createdAt,
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar mensagens do pedido:', error)
    return NextResponse.json({ messages: [] })
  }
}

// POST - Enviar mensagem no chat do pedido
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, sender, senderName } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Mensagem não pode ser vazia' },
        { status: 400 }
      )
    }

    const order = getOrderById(id)
    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Criar mensagem vinculada ao pedido
    const message = createMessage({
      orderId: id,
      content: content.trim(),
      sender: sender || 'cliente',
      senderName: senderName || order.customerName,
    })

    // Atualizar sessão de chat (persistência)
    const isFromClient = (sender || 'cliente') === 'cliente'
    onMessageSent('order', id, message, isFromClient)

    console.log('✅ Mensagem do pedido criada:', message.id)

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem' },
      { status: 500 }
    )
  }
}

