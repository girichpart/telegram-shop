import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext.jsx';
import SiteShell from '../components/SiteShell.jsx';

const sizes = ['S', 'M', 'L', 'XL'];

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');

  useEffect(() => {
    api.get(`/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || 'https://via.placeholder.com/300',
      size: selectedSize
    }, 1);
  };

  if (loading) {
    return (
      <SiteShell headerVariant="back" headerTitle="Product" showFooter={false} onBack={() => navigate(-1)}>
        <div className="px-5 py-16 text-[11px] uppercase tracking-[0.3em] opacity-50">Loading...</div>
      </SiteShell>
    );
  }

  if (!product) {
    return (
      <SiteShell headerVariant="back" headerTitle="Product" showFooter={false} onBack={() => navigate(-1)}>
        <div className="px-5 py-16 text-[11px] uppercase tracking-[0.3em] opacity-50">Product not found</div>
      </SiteShell>
    );
  }

  return (
    <SiteShell headerVariant="back" headerTitle="Product Detail" showFooter={false} onBack={() => navigate(-1)}>
      <div className="px-5 pb-24">
        <div className="mt-6 overflow-hidden rounded-md border border-black/10 bg-black/5">
          <div className="aspect-[4/5] w-full">
            <img
              alt={product.name}
              className="h-full w-full object-cover"
              src={product.images?.[0] || 'https://via.placeholder.com/600'}
            />
          </div>
        </div>

        <div className="mt-8">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">
            {product.category || 'Urban Excursion / FW24'}
          </p>
          <h1 className="heading-md mt-3">{product.name}</h1>
          <p className="mt-2 text-[13px] uppercase tracking-[0.24em] opacity-70">{product.price} ₽</p>
        </div>

        <div className="mt-10">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Select Size</p>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {sizes.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`rounded-md border px-2 py-3 text-[12px] uppercase tracking-[0.2em] ${
                  selectedSize === size ? 'border-black bg-black text-white' : 'border-black/20'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-black/10 pt-8">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Technical Specifications</p>
          <div className="mt-4 grid gap-3 text-[12px] uppercase tracking-[0.2em]">
            <div className="flex items-center justify-between">
              <span className="opacity-60">Water Resistance</span>
              <span>28,000 mm</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-60">Breathability</span>
              <span>20,000 g/m²</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-60">Product Weight</span>
              <span>{product.weight || '412 grams'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-60">Fabric Technology</span>
              <span>{product.fabric || 'Gore-Tex Pro 3L'}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-black/10 pt-8">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Description</p>
          <p className="mt-4 text-[13px] leading-relaxed opacity-70">
            {product.description || 'Designed for high-intensity movement in volatile urban environments.'}
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/10 bg-[--secondary] px-5 py-4">
        <button
          type="button"
          onClick={addToCart}
          className="flex w-full items-center justify-between rounded-md bg-black px-5 py-4 text-[12px] uppercase tracking-[0.3em] text-white"
        >
          <span>Add to Cart</span>
          <span>{product.price} ₽</span>
        </button>
      </div>
    </SiteShell>
  );
};

export default Product;
