import { CartProvider } from './context/CartContext';
import CartIcon from './components/CartIcon';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <title>Mini App Shop</title>
      </head>
      <body>
        <CartProvider>
          {children}
          <CartIcon />
        </CartProvider>
      </body>
    </html>
  );
}


