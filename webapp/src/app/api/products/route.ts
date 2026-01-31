import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const products = await prisma.product.findMany()
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const product = await prisma.product.create({ data })
  return NextResponse.json(product)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ success: true })
}