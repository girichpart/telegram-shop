import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext.jsx';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryType, setDeliveryType] = useState('pvz');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [etaDays, setEtaDays] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCalculateDelivery = async () => {
    if (!city) {
      setError('Укажите город для расчета доставки');
      return;
    }

    setError('');
    try {
      const res = await api.post('/api/delivery/calculate', {
        city,
        type: deliveryType
      });
      setDeliveryCost(res.data.cost || 0);
      setEtaDays(res.data.etaDays || null);
    } catch (err) {
      console.error(err);
      setError('Не удалось рассчитать доставку');
    }
  };

  const handleSubmit = async () => {
    if (!phone || !email || !city) {
      setError('Заполните телефон, email и город');
      return;
    }
    if (items.length === 0) {
      setError('Корзина пуста');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderRes = await api.post('/api/orders', {
        phone,
        email,
        products: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        delivery: {
          type: deliveryType,
          address,
          city,
          pvz: deliveryType === 'pvz' ? 'ПВЗ' : '',
          cost: deliveryCost
        }
      });

      const paymentRes = await api.post('/api/payments/create', {
        orderId: orderRes.data._id
      });

      if (paymentRes.data.confirmationUrl && paymentRes.data.status !== 'paid') {
        window.location.href = paymentRes.data.confirmationUrl;
        return;
      }

      if (paymentRes.data.status === 'paid') {
        clear();
        navigate(`/success?orderId=${orderRes.data._id}`);
      } else {
        setError('Оплата не прошла');
      }
    } catch (err) {
      console.error(err);
      setError('Ошибка оформления заказа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--tma-bg)', color: 'var(--tma-text)' }}>
      <header className="sticky top-0 z-50 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b" style={{ background: 'var(--tma-bg)', borderColor: 'var(--tma-border)' }}>
        <button className="flex items-center gap-1" style={{ color: 'var(--tma-link)' }} onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-[22px]">chevron_left</span>
          <span className="text-[17px]">Back</span>
        </button>
        <h1 className="text-[17px] font-semibold">Checkout</h1>
        <div className="w-16"></div>
      </header>

      <main className="flex-1 pb-44 px-4">
        <div className="max-w-md mx-auto w-full pt-4">
          <div className="mb-10">
            <h2 className="section-label">Payment Method</h2>
            <div className="rounded-2xl overflow-hidden border bg-white/50" style={{ borderColor: 'var(--tma-border)' }}>
              <button className="w-full flex items-center justify-between p-4 bg-white/90 border-b active:bg-black/5 transition-colors" style={{ borderColor: 'var(--tma-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-black rounded flex items-center justify-center">
                    <img alt="Apple Pay" className="h-3.5 invert" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApNiAGM56z71YsptQBdmDebZX9g3f95LAHVxHvTmpcT5rXHAjb12EICzXrNbY7K3JaTQvnJuccyldMbM2Nf3bRKhjT__sI2hV2HzlSvFwr7K9zprAb8EEOt-LE-1sa_TEqEKJ_ggd9-4ICb4QpjEgzxyI2yK0CgTZptNoXk3VdmgGa145gSVfcoPYRLpZjXjRDvlxeSQVB4qnOph8H-FzLVUNV59GkwsgCobHOOAZ9Xkl9BzinEPH5cUHCvrRbWBAcdMSufUf-A_U" />
                  </div>
                  <span className="text-[16px] font-medium">Apple Pay</span>
                </div>
                <span className="material-symbols-outlined text-lg" style={{ color: 'var(--tma-muted)' }}>chevron_right</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white/90 active:bg-black/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-white border rounded flex items-center justify-center" style={{ borderColor: 'var(--tma-border)' }}>
                    <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--tma-link)' }}>account_balance_wallet</span>
                  </div>
                  <span className="text-[16px] font-medium">Telegram Wallet</span>
                </div>
                <span className="material-symbols-outlined text-lg" style={{ color: 'var(--tma-muted)' }}>chevron_right</span>
              </button>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="section-label">Shipping Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input className="tma-input" placeholder="First Name" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
                <input className="tma-input" placeholder="Last Name" type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <input className="tma-input" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <input className="tma-input" placeholder="Phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
              <input className="tma-input" placeholder="Shipping Address" type="text" value={address} onChange={e => setAddress(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <input className="tma-input" placeholder="City" type="text" value={city} onChange={e => setCity(e.target.value)} />
                <input className="tma-input" placeholder="Postal Code" type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeliveryType('pvz')}
                  className={deliveryType === 'pvz' ? 'flex-1 py-3 rounded-xl border-2 font-bold text-sm' : 'flex-1 py-3 rounded-xl border bg-white/60 font-medium text-sm'}
                  style={deliveryType === 'pvz' ? { borderColor: 'var(--tma-button)', color: 'var(--tma-button)', background: 'rgba(74, 93, 78, 0.1)' } : { borderColor: 'var(--tma-border)' }}
                >
                  PVZ
                </button>
                <button
                  onClick={() => setDeliveryType('courier')}
                  className={deliveryType === 'courier' ? 'flex-1 py-3 rounded-xl border-2 font-bold text-sm' : 'flex-1 py-3 rounded-xl border bg-white/60 font-medium text-sm'}
                  style={deliveryType === 'courier' ? { borderColor: 'var(--tma-button)', color: 'var(--tma-button)', background: 'rgba(74, 93, 78, 0.1)' } : { borderColor: 'var(--tma-border)' }}
                >
                  Courier
                </button>
              </div>
              <button onClick={handleCalculateDelivery} className="w-full border rounded-xl py-3 text-sm font-medium" style={{ borderColor: 'var(--tma-border)' }}>Calculate delivery</button>
              {etaDays && (
                <p className="text-xs" style={{ color: 'var(--tma-muted)' }}>Delivery: {deliveryCost} ₽, {etaDays} days</p>
              )}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="section-label">Order Summary</h2>
            <div className="bg-white/70 rounded-2xl p-6 border" style={{ borderColor: 'var(--tma-border)' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex -space-x-3 overflow-hidden">
                  <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-black/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--tma-link)' }}>apparel</span>
                  </div>
                  <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--tma-link)' }}>checkroom</span>
                  </div>
                  <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--tma-link)' }}>shopping_bag</span>
                  </div>
                </div>
                <p className="text-[15px] font-medium">{items.length} items in cart</p>
              </div>
              <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--tma-border)' }}>
                <div className="flex justify-between text-[14px]">
                  <span style={{ color: 'var(--tma-muted)' }}>Subtotal</span>
                  <span className="font-medium">{total} ₽</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span style={{ color: 'var(--tma-muted)' }}>Shipping</span>
                  <span className="font-medium" style={{ color: 'var(--tma-link)' }}>{deliveryCost === 0 ? 'Free' : `${deliveryCost} ₽`}</span>
                </div>
                <div className="flex justify-between text-[18px] font-bold mt-2 pt-3 border-t" style={{ borderColor: 'var(--tma-border)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--tma-link)' }}>{total + deliveryCost} ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 backdrop-blur-xl border-t" style={{ background: 'var(--tma-bg)', borderColor: 'var(--tma-border)' }}>
        <div className="max-w-md mx-auto w-full">
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <button onClick={handleSubmit} className="w-full text-white font-bold text-[17px] py-4.5 rounded-2xl flex items-center justify-center gap-2 active:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-black/10" style={{ background: 'var(--tma-button)' }} disabled={loading}>
            <span>{loading ? 'Paying...' : `Pay ${total + deliveryCost} ₽`}</span>
          </button>
          <div className="mt-5 flex items-center justify-center gap-1.5 opacity-60">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span className="text-[11px] uppercase tracking-widest font-bold">Secured by Telegram</span>
          </div>
        </div>
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default Checkout;
