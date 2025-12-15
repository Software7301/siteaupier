import { NextResponse } from 'next/server'

// API simplificada para usuários (sem Prisma)
export async function GET() {
  return NextResponse.json([])
}

export async function POST(request: Request) {
  const body = await request.json()
  
  return NextResponse.json({
    id: `user-${Date.now()}`,
    name: body.name,
    email: body.email,
    phone: body.phone,
    role: body.role || 'CUSTOMER',
    createdAt: new Date().toISOString(),
  }, { status: 201 })
}
