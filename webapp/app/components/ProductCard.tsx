'use client';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="bg-white rounded-xl p-3 shadow hover:shadow-lg transition cursor-pointer"
        onClick={() => setOpen(true)}
      >
        {product.images?.data?.length ? (
          <Swiper spaceBetween={10} slidesPerView={1}>
            {product.images.data.map((img: any) => (
              <SwiperSlide key={img.id}>
                <img
                  src={img.attributes.url}
                  alt={product.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-40 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400">
            Нет изображения
          </div>
        )}

        <h3 className="font-semibold text-sm">{product.title}</h3>
        <p className="text-sm text-gray-600">{product.price} ₽</p>

        <button
          onClick={e => {
            e.stopPropagation();
            addToCart(product);
          }}
          className="mt-2 w-full bg-black text-white rounded-lg py-2 text-sm"
        >
          В корзину
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl max-w-sm w-full">
            <h2 className="font-bold text-lg mb-2">{product.title}</h2>
            <p className="mb-2">{product.description || 'Описание отсутствует'}</p>
            <p className="font-semibold mb-4">{product.price} ₽</p>
            <button
              onClick={() => { addToCart(product); setOpen(false); }}
              className="w-full bg-black text-white py-2 rounded-lg mb-2"
            >
              В корзину
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-full border py-2 rounded-lg"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
}


