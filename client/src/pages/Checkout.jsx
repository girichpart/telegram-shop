import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext.jsx';
import SiteShell from '../components/SiteShell.jsx';

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
    <SiteShell headerVariant="back" headerTitle="Checkout" showFooter={false} onBack={() => navigate(-1)}>
      <div className="px-5 pb-32">
        <div className="mt-8 grid gap-10">
          <section>
            <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Express checkout</p>
            <div className="mt-4 grid gap-3">
              <button type="button" className="flex items-center justify-between border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.25em]">
                <span>Apple Pay</span>
                <span>→</span>
              </button>
              <button type="button" className="flex items-center justify-between border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.25em]">
                <span>Telegram Wallet</span>
                <span>→</span>
              </button>
            </div>
          </section>

          <section>
            <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Shipping Information</p>
            <div className="mt-4 grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                  placeholder="First name"
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
                <input
                  className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                  placeholder="Last name"
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
              <input
                className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                placeholder="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <input
                className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                placeholder="Phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <input
                className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                placeholder="Shipping address"
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                  placeholder="City"
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
                <input
                  className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                  placeholder="Postal code"
                  type="text"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType('pvz')}
                  className={`border px-4 py-3 text-[12px] uppercase tracking-[0.2em] ${
                    deliveryType === 'pvz' ? 'border-black bg-black text-white' : 'border-black/10 bg-white'
                  }`}
                >
                  CDEK PVZ
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('courier')}
                  className={`border px-4 py-3 text-[12px] uppercase tracking-[0.2em] ${
                    deliveryType === 'courier' ? 'border-black bg-black text-white' : 'border-black/10 bg-white'
                  }`}
                >
                  Courier
                </button>
              </div>
              <button
                type="button"
                onClick={handleCalculateDelivery}
                className="border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.25em]"
              >
                Calculate delivery
              </button>
              {etaDays && (
                <p className="text-[11px] uppercase tracking-[0.25em] opacity-60">
                  Delivery {deliveryCost} ₽ · {etaDays} days
                </p>
              )}
            </div>
          </section>

          <section>
            <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Order Summary</p>
            <div className="mt-4 border border-black/10 bg-white p-5">
              <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.25em]">
                <span>{items.length} items</span>
                <span>{total} ₽</span>
              </div>
              <div className="mt-4 border-t border-black/10 pt-4 text-[12px] uppercase tracking-[0.25em]">
                <div className="flex items-center justify-between opacity-70">
                  <span>Shipping</span>
                  <span>{deliveryCost === 0 ? 'Free' : `${deliveryCost} ₽`}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span>Total</span>
                  <span>{total + deliveryCost} ₽</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/10 bg-[--secondary] px-5 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          {error && <p className="text-[11px] uppercase tracking-[0.25em] text-red-500">{error}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-between rounded-md bg-black px-5 py-4 text-[12px] uppercase tracking-[0.3em] text-white"
          >
            <span>{loading ? 'Paying...' : 'Pay now'}</span>
            <span>{total + deliveryCost} ₽</span>
          </button>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-50">Secured by Telegram · YooKassa ready</p>
        </div>
      </div>
    </SiteShell>
  );
};

export default Checkout;
