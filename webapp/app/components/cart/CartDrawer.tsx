'use client';
import { useCart } from '../../store/cart';

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, removeItem, total } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Корзина</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {items.length === 0 && (
          <p className="text-center text-gray-500">
            Корзина пуста
          </p>
        )}

        {items.map(item => (
          <div
            key={item.id}
            className="flex justify-between items-center mb-3"
          >
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">
                {item.qty} × {item.price} ₽
              </p>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="text-red-500 text-sm"
            >
              Удалить
            </button>
          </div>
        ))}

        {items.length > 0 && (
          <>
            <div className="border-t pt-3 mt-4 flex justify-between font-bold">
              <span>Итого</span>
              <span>{total()} ₽</span>
            </div>

            <button
              className="w-full mt-4 bg-black text-white py-3 rounded-xl"
            >
              Оформить заказ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
