import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black p-4 flex justify-between items-center z-10">
      <Link to="/" className="text-xl font-bold">.solutions</Link>
      <div className="flex space-x-4">
        <Link to="/cart">Корзина</Link>
        <Link to="/track">Отслеживание</Link>
      </div>
    </header>
  );
};

export default Header;