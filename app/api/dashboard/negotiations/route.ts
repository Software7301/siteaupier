import { NextResponse } from 'next/server'
import { getNegotiations, getMessagesByNegotiationId, getCarById } from '@/lib/storage'

export async function GET() {
  try {
    const negotiations = getNegotiations()

    const formattedNegotiations = negotiations.map((neg) => {
      const car = getCarById(neg.carId)
      const messages = getMessagesByNegotiationId(neg.id)
      const lastMessage = messages[messages.length - 1]

      return {
        id: neg.id,
        cliente: {
          id: neg.id,
          nome: neg.customerName,
          telefone: neg.customerPhone,
          email: neg.customerEmail,
        },
        veiculo: {
          id: car.id,
          nome: car.name,
          ano: car.year,
          preco: car.price,
          imageUrl: car.imageUrl,
        },
        tipo: neg.type,
        status: neg.status,
        criadoEm: neg.createdAt,
        atualizadoEm: neg.updatedAt,
        ultimaMensagem: lastMessage?.content || null,
        mensagensNaoLidas: 0,
      }
    })

    // Ordenar por data (mais recente primeiro)
    formattedNegotiations.sort((a, b) => 
      new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    )

    return NextResponse.json(formattedNegotiations)
  } catch (error) {
    console.error('Erro ao buscar negociações:', error)
    return NextResponse.json([])
  }
}
