import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { init } from '@twa-dev/sdk'; // Telegram SDK
import Home from './pages/Home';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Track from './pages/Track';
import Header from './components/Header';

init(); // Инициализация Telegram Mini App

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track" element={<Track />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;