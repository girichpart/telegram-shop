import { FC } from 'react'

interface Item {
  id: number
  name: string
  price: number
  quantity: number
}

const CartItem: FC<{ item: Item, setCart: (cart: Item[]) => void }> = ({ item, setCart }) => {
  const remove = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]').filter((i: Item) => i.id !== item.id)
    localStorage.setItem('cart', JSON.stringify(cart))
    setCart(cart)
  }

  return (
    <div className="border p-2 mb-2 flex justify-between">
      <div>
        <h3>{item.name}</h3>
        <p>{item.price} ₽ x {item.quantity}</p>
      </div>
      <button onClick={remove} className="text-red-500">Удалить</button>
    </div>
  )
}

export default CartItem