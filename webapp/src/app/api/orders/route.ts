import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { userId, products, total } = await req.json()
  const order = await prisma.order.create({
    data: {
      userId,
      total,
      products: {
        create: products.map((item: { productId: number, quantity: number }) => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      }
    }
  })
  return NextResponse.json(order)
}