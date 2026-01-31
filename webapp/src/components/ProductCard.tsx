import { FC } from 'react'

interface Product {
  id: number
  name: string
  price: number
  stock: number
  image?: string
  sizes?: string
}

const ProductCard: FC<{ product: Product }> = ({ product }) => {
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find((item: any) => item.id === product.id)
    if (existing) existing.quantity += 1
    else cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 })
    localStorage.setItem('cart', JSON.stringify(cart))
    alert('Добавлено в корзину!')
  }

  const imageUrl = product.image || '/placeholder.jpg'

  return (
    <div className="border p-2">
      <img src={imageUrl} alt={product.name} className="w-full h-40 object-cover" />
      <h2>{product.name}</h2>
      <p>{product.price} ₽</p>
      <p>{product.stock > 0 ? 'В наличии' : 'Нет в наличии'}</p>
      {product.stock > 0 && <button onClick={addToCart} className="bg-blue-500 text-white p-1">Добавить в корзину</button>}
    </div>
  )
}

export default ProductCard