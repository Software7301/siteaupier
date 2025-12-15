import { NextResponse } from 'next/server'
import { createOrder, getOrders, getOrderById, updateOrder, getCarById, createChatSession } from '@/lib/storage'

// Validação de RG (exatamente 6 dígitos)
function validateRg(rg: string): boolean {
  const rgNumbers = rg.replace(/\D/g, '')
  return /^\d{6}$/.test(rgNumbers)
}

// Validação de telefone (mínimo 6 dígitos)
function validatePhone(phone: string): boolean {
  const phoneNumbers = phone.replace(/\D/g, '')
  return phoneNumbers.length >= 6
}

// Formas de pagamento válidas
const validPaymentMethods = ['PIX', 'DINHEIRO', 'CARTAO_CREDITO']

// POST - Criar pedido
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      carId,
      customerName,
      customerRg,
      customerPhone,
      paymentMethod,
      installments,
      totalPrice,
      selectedColor,
    } = body

    // ========== VALIDAÇÕES ==========
    const errors: Record<string, string> = {}

    if (!customerName || !customerName.trim()) {
      errors.name = 'Nome completo é obrigatório'
    }

    if (!customerRg || !validateRg(customerRg)) {
      errors.rg = 'RG inválido. O RG deve ter exatamente 6 dígitos.'
    }

    if (!customerPhone || !validatePhone(customerPhone)) {
      errors.phone = 'Número de telefone inválido. Mínimo 6 dígitos.'
    }

    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      errors.payment = 'Forma de pagamento inválida'
    }

    if (paymentMethod === 'CARTAO_CREDITO') {
      const numInstallments = parseInt(installments)
      if (isNaN(numInstallments) || numInstallments < 1 || numInstallments > 12) {
        errors.installments = 'Parcelamento deve ser entre 1 e 12 vezes'
      }
    }

    if (paymentMethod !== 'CARTAO_CREDITO' && installments && installments > 1) {
      errors.installments = 'Parcelamento disponível apenas para Cartão de Crédito'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Dados inválidos', errors },
        { status: 400 }
      )
    }

    // ========== CRIAR PEDIDO ==========
    const order = createOrder({
      carId,
      customerName: customerName.trim(),
      customerRg: customerRg.replace(/\D/g, ''),
      customerPhone: customerPhone.replace(/\D/g, ''),
      paymentMethod,
      installments: paymentMethod === 'CARTAO_CREDITO' ? parseInt(installments) : 1,
      selectedColor: selectedColor || 'Preto',
      totalPrice,
      status: 'PENDING',
    })

    // Criar sessão de chat persistente para o pedido
    const car = getCarById(carId)
    createChatSession({
      type: 'order',
      referenceId: order.id,
      clientId: `client-${customerPhone.replace(/\D/g, '')}`,
      clientName: customerName.trim(),
      clientPhone: customerPhone.replace(/\D/g, ''),
      vehicleName: car.name,
      vehiclePrice: totalPrice,
      status: 'active',
    })

    console.log('✅ Pedido criado:', order.id)

    return NextResponse.json({
      success: true,
      message: 'Pedido criado com sucesso',
      orderId: order.id,
    })
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar pedido' },
      { status: 500 }
    )
  }
}

// GET - Listar pedidos
export async function GET() {
  try {
    const orders = getOrders()
    
    // Adicionar dados do veículo
    const ordersWithCars = orders.map(order => ({
      ...order,
      car: getCarById(order.carId),
    }))

    return NextResponse.json(ordersWithCars)
  } catch (error) {
    console.error('Erro ao listar pedidos:', error)
    return NextResponse.json([])
  }
}
