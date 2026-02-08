import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext.jsx';
import SiteShell from '../components/SiteShell.jsx';

const Product = () => {
  const { id } = useParams();
  const { addItem, items, updateQuantity } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    api.get(`/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        const sizes = res.data?.sizes || [];
        if (sizes.length > 0) {
          const available = sizes.find(s => s.stock > 0) || sizes[0];
          setSelectedSize(available?.label || '');
        } else {
          setSelectedSize('ONE');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      return;
    }
    const sizeMatch = (product.sizes || []).find(s => s.label === (selectedSize || 'ONE'));
    const maxStock = sizeMatch ? Number(sizeMatch.stock || 0) : Number(product.stock || 0);
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || 'https://via.placeholder.com/300',
      size: selectedSize || 'ONE',
      maxStock
    }, 1);
  };

  if (loading) {
    return (
      <SiteShell headerVariant="site" headerTitle="grått" showFooter={false} showNotice>
        <div className="px-5 py-16 text-[11px] uppercase tracking-[0.3em] opacity-50">Загрузка...</div>
      </SiteShell>
    );
  }

  if (!product) {
    return (
      <SiteShell headerVariant="site" headerTitle="grått" showFooter={false} showNotice>
        <div className="px-5 py-16 text-[11px] uppercase tracking-[0.3em] opacity-50">Товар не найден</div>
      </SiteShell>
    );
  }

  const availableSizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : ['ONE'].map(label => ({ label, stock: product.stock || 0 }));
  const hasMultipleSizes = availableSizes.length > 1;

  const mainImage = product.images?.[selectedImage] || product.images?.[0] || 'https://via.placeholder.com/600';

  const sizeStock = Array.isArray(availableSizes) && availableSizes.length > 0
    ? availableSizes.map(s => s.stock || 0)
    : [product.stock || 0];
  const soldOut = sizeStock.every(stock => stock <= 0) || product.isActive === false;
  const selectedStock = Array.isArray(availableSizes)
    ? (availableSizes.find(s => s.label === (selectedSize || availableSizes[0]?.label))?.stock ?? product.stock)
    : product.stock;
  const showLastOne = Number(selectedStock) === 1;

  const cartItem = items.find(item =>
    item.productId === product._id && (item.size || 'ONE') === (selectedSize || 'ONE')
  );
  const cartQty = cartItem?.quantity || 0;

  return (
    <SiteShell headerVariant="site" headerTitle="grått" showFooter={false} showNotice>
      <div className="px-5 pb-24">
        <div className="mt-6 relative overflow-hidden rounded-md border border-black/10 bg-black/5">
          {soldOut && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 text-[12px] uppercase tracking-[0.3em] text-black backdrop-blur">
              SOLD OUT
            </div>
          )}
          <div className="aspect-[4/5] w-full">
            <img
              alt={product.name}
              className="h-full w-full object-cover"
              src={mainImage}
            />
          </div>
        </div>
        {product.images && product.images.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.images.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={`overflow-hidden rounded-md border ${selectedImage === index ? 'border-black' : 'border-black/10'}`}
              >
                <img src={url} alt="" className="h-16 w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">
              {product.category || 'Городская серия / FW24'}
            </p>
            {(product.statusTags || []).map(tag => (
              <span key={tag} className="text-[10px] uppercase tracking-[0.2em] opacity-60">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="heading-md mt-3">{product.name}</h1>
          <p className="mt-2 text-[13px] uppercase tracking-[0.24em] opacity-70">{product.price} ₽</p>
          {showLastOne && !soldOut && (
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-red-500">Осталась 1 штука</p>
          )}
        </div>

        <div className="mt-10">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Выберите размер</p>
          {hasMultipleSizes ? (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {availableSizes.map(size => (
                <button
                  key={size.label}
                  type="button"
                  onClick={() => size.stock > 0 && setSelectedSize(size.label)}
                  className={`rounded-md border px-2 py-3 text-[12px] uppercase tracking-[0.2em] ${
                    selectedSize === size.label ? 'border-black bg-black text-white' : 'border-black/20'
                  } ${size.stock === 0 ? 'opacity-40' : ''}`}
                  disabled={size.stock === 0}
                >
                  {size.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-[12px] uppercase tracking-[0.2em] opacity-70">
              {availableSizes[0]?.label || 'ONE'}
            </div>
          )}
        </div>

        <div className="mt-10 border-t border-black/10 pt-8">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Технические характеристики</p>
          <div className="mt-4 grid gap-3 text-[12px] uppercase tracking-[0.2em]">
            {(product.techSpecs || []).length === 0 && (
              <div className="text-[11px] uppercase tracking-[0.2em] opacity-60">
                Характеристики не заданы.
              </div>
            )}
            {(product.techSpecs || []).map((spec, index) => (
              <div key={`${spec.label}-${index}`} className="flex items-center justify-between">
                <span className="opacity-60">{spec.label}</span>
                <span>{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-black/10 pt-8">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Описание</p>
          <p className="mt-4 text-[13px] leading-relaxed opacity-70">
            {product.description || 'Создано для активного движения и городской динамики.'}
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/10 bg-[--secondary] px-5 py-4">
        {!soldOut && cartQty > 0 ? (
          <div className="flex items-center justify-between rounded-md border border-black/10 bg-white px-5 py-4 text-[12px] uppercase tracking-[0.3em]">
            <span className="opacity-60">{product.price} ₽</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateQuantity(product._id, selectedSize || 'ONE', cartQty - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-[14px] transition hover:bg-black hover:text-white"
                aria-label="Уменьшить"
              >
                –
              </button>
              <span className="min-w-[2ch] text-center">{cartQty}</span>
              <button
                type="button"
                onClick={() => addToCart()}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-[14px] transition hover:bg-black hover:text-white"
                aria-label="Увеличить"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={addToCart}
            disabled={soldOut || (product.sizes && product.sizes.length > 0 && !selectedSize)}
            className="btn-primary flex w-full items-center justify-between rounded-md px-5 py-4 text-[12px] uppercase tracking-[0.3em]"
          >
            <span>{soldOut ? 'SOLD OUT' : 'В корзину'}</span>
            <span>{product.price} ₽</span>
          </button>
        )}
      </div>
    </SiteShell>
  );
};

export default Product;
