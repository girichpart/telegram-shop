'use client'

import { useEffect, useState } from 'react'

export default function Admin() {
  const [token, setToken] = useState(typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '')
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState(0)
  const [sizes, setSizes] = useState('')

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  const loadProducts = async () => {
    const res = await fetch('/api/products')
    const prods = await res.json()
    setProducts(prods)
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
    }
    if (token) loadProducts()
  }, [token])

  const login = () => {
    if (identifier === 'admin' && password === 'adminpass') {
      const fakeToken = 'admin_token'
      setToken(fakeToken)
      if (typeof window !== 'undefined') localStorage.setItem('adminToken', fakeToken)
      alert('Вход выполнен!')
    } else alert('Ошибка входа')
  }

  const addProduct = async () => {
    if (!token) return alert('Войдите как админ')
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price, stock, sizes })
    })
    loadProducts()
    alert('Товар добавлен!')
  }

  const deleteProduct = async (id: number) => {
    await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    loadProducts()
  }

  if (!token) {
    return (
      <div className="p-4">
        <h1>Вход в админку</h1>
        <input type="text" placeholder="Login" value={identifier} onChange={e => setIdentifier(e.target.value)} className="border p-1 mb-2 block" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border p-1 mb-2 block" />
        <button onClick={login} className="bg-green-500 text-white p-2">Войти</button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Админка: Добавить товар</h1>
      <input placeholder="Имя" value={name} onChange={e => setName(e.target.value)} className="border p-1 mb-2 block" />
      <input type="number" placeholder="Цена" value={price} onChange={e => setPrice(+e.target.value)} className="border p-1 mb-2 block" />
      <textarea placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} className="border p-1 mb-2 block" />
      <input type="number" placeholder="Наличие" value={stock} onChange={e => setStock(+e.target.value)} className="border p-1 mb-2 block" />
      <input placeholder="Размеры (S,M,L)" value={sizes} onChange={e => setSizes(e.target.value)} className="border p-1 mb-2 block" />
      <button onClick={addProduct} className="bg-green-500 text-white p-2">Добавить</button>

      <h2 className="mt-4">Товары</h2>
      {products.map((p: any) => (
        <div key={p.id} className="border p-2 mb-2 flex justify-between">
          <span>{p.name} - {p.price} ₽ - Наличие: {p.stock}</span>
          <button onClick={() => deleteProduct(p.id)} className="text-red-500">Удалить</button>
        </div>
      ))}
    </div>
  )
}