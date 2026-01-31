'use client'

import { useEffect, useState } from 'react'
import CartItem from '@/components/CartItem'

interface CartItemType {
  id: number
  name: string
  price: number
  quantity: number
}

export default function Cart() {
  const [cart, setCart] = useState<CartItemType[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
    }
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(storedCart)
  }, [])

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const checkout = async () => {
    const userId = typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || 'test'
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, products: cart.map(item => ({ productId: item.id, quantity: item.quantity })), total })
    })
    alert('Заказ оформлен!')
    localStorage.removeItem('cart')
    setCart([])
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Корзина</h1>
      {cart.length === 0 ? <p>Корзина пуста</p> : (
        <>
          {cart.map(item => <CartItem key={item.id} item={item} setCart={setCart} />)}
          <p className="mt-4">Итого: {total} ₽</p>
          <button onClick={checkout} className="bg-blue-500 text-white p-2 mt-2">Оформить</button>
          <a href="/" className="block mt-2 text-blue-500">Вернуться к покупкам</a>
        </>
      )}
    </div>
  )
}