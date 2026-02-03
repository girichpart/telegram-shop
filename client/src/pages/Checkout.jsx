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
    <div className="min-h-screen flex flex-col bg-[#f0f2f0] text-[#222222]">
      <header className="sticky top-0 z-50 bg-[#f0f2f0]/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#d1d5db]/30">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#248bfe] cursor-pointer">arrow_back_ios</span>
          <span className="text-[#248bfe] font-medium">Back</span>
        </div>
        <h1 className="text-[17px] font-semibold">Checkout</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 pb-44">
        <div className="max-w-md mx-auto w-full pt-6">
          <div className="mb-8">
            <h2 className="section-label px-4 pb-2">Express Checkout</h2>
            <div className="bg-white border-y border-[#d1d5db]">
              <button className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors border-b border-[#d1d5db]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-black rounded flex items-center justify-center">
                    <img alt="Apple Pay" className="h-4 invert" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApNiAGM56z71YsptQBdmDebZX9g3f95LAHVxHvTmpcT5rXHAjb12EICzXrNbY7K3JaTQvnJuccyldMbM2Nf3bRKhjT__sI2hV2HzlSvFwr7K9zprAb8EEOt-LE-1sa_TEqEKJ_ggd9-4ICb4QpjEgzxyI2yK0CgTZptNoXk3VdmgGa145gSVfcoPYRLpZjXjRDvlxeSQVB4qnOph8H-FzLVUNV59GkwsgCobHOOAZ9Xkl9BzinEPH5cUHCvrRbWBAcdMSufUf-A_U" />
                  </div>
                  <span className="text-[16px]">Apple Pay</span>
                </div>
                <span className="material-symbols-outlined text-[#8e8e93]">chevron_right</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#4a5d4e] text-lg">account_balance_wallet</span>
                  </div>
                  <span className="text-[16px]">Telegram Wallet</span>
                </div>
                <span className="material-symbols-outlined text-[#8e8e93]">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="mb-8 px-4">
            <h2 className="section-label px-0">Shipping Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input className="tma-input" placeholder="First Name" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
                <input className="tma-input" placeholder="Last Name" type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <input className="tma-input" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <input className="tma-input" placeholder="Phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
              <input className="tma-input" placeholder="Shipping Address" type="text" value={address} onChange={e => setAddress(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <input className="tma-input" placeholder="City" type="text" value={city} onChange={e => setCity(e.target.value)} />
                <input className="tma-input" placeholder="Postal Code" type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDeliveryType('pvz')} className={deliveryType === 'pvz' ? 'flex-1 py-3 rounded-xl border-2 border-[#4a5d4e] bg-[#4a5d4e]/10 font-bold text-sm text-[#4a5d4e]' : 'flex-1 py-3 rounded-xl border border-[#d1d5db] bg-white font-medium text-sm'}>PVZ</button>
                <button onClick={() => setDeliveryType('courier')} className={deliveryType === 'courier' ? 'flex-1 py-3 rounded-xl border-2 border-[#4a5d4e] bg-[#4a5d4e]/10 font-bold text-sm text-[#4a5d4e]' : 'flex-1 py-3 rounded-xl border border-[#d1d5db] bg-white font-medium text-sm'}>Courier</button>
              </div>
              <button onClick={handleCalculateDelivery} className="w-full border border-[#d1d5db] rounded-xl py-3 text-sm font-medium">Calculate delivery</button>
              {etaDays && (
                <p className="text-xs text-[#8e8e93]">Delivery: {deliveryCost} ₽, {etaDays} days</p>
              )}
            </div>
          </div>

          <div className="mb-8 px-4">
            <h2 className="section-label px-0">Card Details</h2>
            <div className="space-y-4">
              <div className="relative">
                <input className="tma-input pr-12" placeholder="Card Number" type="text" />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#8e8e93]">credit_card</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="tma-input" placeholder="MM / YY" type="text" />
                <input className="tma-input" placeholder="CVC" type="password" />
              </div>
            </div>
          </div>

          <div className="px-4 mb-10">
            <h2 className="section-label px-0">Order Summary</h2>
            <div className="bg-white rounded-2xl p-4 border border-[#d1d5db]">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-3 overflow-hidden">
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs text-[#4a5d4e]">checkroom</span>
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs text-[#4a5d4e]">apparel</span>
                  </div>
                </div>
                <p className="text-[14px] text-[#8e8e93]">{items.length} items in cart</p>
              </div>
              <div className="space-y-2 pt-2 border-t border-[#d1d5db]/30">
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#8e8e93]">Subtotal</span>
                  <span>{total} ₽</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#8e8e93]">Shipping</span>
                  <span>{deliveryCost} ₽</span>
                </div>
                <div className="flex justify-between text-[17px] font-bold mt-2 pt-2 border-t border-[#d1d5db]/30">
                  <span>Total</span>
                  <span className="text-[#4a5d4e]">{total + deliveryCost} ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#f0f2f0]/95 backdrop-blur-xl border-t border-[#d1d5db]/50">
        <div className="max-w-md mx-auto w-full">
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <button onClick={handleSubmit} className="w-full bg-[#4a5d4e] text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 active:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-[#4a5d4e]/20" disabled={loading}>
            <span>{loading ? 'Paying...' : `Pay ${total + deliveryCost} ₽`}</span>
          </button>
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-[#8e8e93]">lock</span>
            <span className="text-[11px] text-[#8e8e93] uppercase tracking-widest font-medium">Secured by Telegram</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
