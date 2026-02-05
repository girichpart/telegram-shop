import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Success from './pages/Success.jsx';
import Info from './pages/Info.jsx';
import Account from './pages/Account.jsx';
import { CartProvider } from './context/CartContext.jsx';

function App() {
  const [isTelegram, setIsTelegram] = useState(true);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      setIsTelegram(true);
    } else {
      setIsTelegram(false);
    }
  }, []);

  if (!isTelegram) {
    return (
      <div className="min-h-screen bg-[--secondary] px-6 py-12 text-[11px] uppercase tracking-[0.3em]">
        Откройте магазин в Telegram, чтобы продолжить.
      </div>
    );
  }

  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/success" element={<Success />} />
          <Route path="/info/:slug" element={<Info />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
