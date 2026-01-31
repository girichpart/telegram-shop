import { useCart } from '../store/cart';

export default function ProductCard({ product }: { product: any }) {
  const addItem = useCart(state => state.addItem);

  const image =
    product?.image?.data?.attributes?.url
      ? `http://localhost:1337${product.image.data.attributes.url}`
      : undefined;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      {image ? (
        <img src={image} className="w-full h-40 object-cover" />
      ) : (
        <div className="h-40 bg-gray-200 flex items-center justify-center">
          Нет фото
        </div>
      )}

      <div className="p-3">
        <h3 className="text-sm font-medium line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-2 flex justify-between items-center">
          <span className="font-bold">{product.price} ₽</span>

          <button
            onClick={() =>
              addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image,
              })
            }
            className="px-3 py-1 bg-black text-white text-sm rounded-lg"
          >
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}
