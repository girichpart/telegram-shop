'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'

interface Product {
  id: number
  name: string
  price: number
  description: string
  stock: number
  image?: string
  sizes?: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
    }
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts)
  }, [])

  return (
    <main className="p-4">
      <h1 className="text-2xl mb-4">Каталог</h1>
      <div className="grid grid-cols-2 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <a href="/cart" className="block mt-4 text-blue-500">Корзина</a>
      <a href="/admin" className="block mt-2 text-blue-500">Админка</a>
    </main>
  )
}