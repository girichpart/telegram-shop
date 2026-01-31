'use client';

export default function ProductCard({ product }: { product: any }) {
  const image =
    product?.image?.data?.attributes?.url
      ? `http://localhost:1337${product.image.data.attributes.url}`
      : null;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      {image ? (
        <img src={image} className="w-full h-40 object-cover" />
      ) : (
        <div className="h-40 bg-gray-200 flex items-center justify-center text-sm">
          Нет фото
        </div>
      )}

      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold">{product.price} ₽</span>
          <button className="text-sm px-3 py-1 bg-black text-white rounded-lg">
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}
