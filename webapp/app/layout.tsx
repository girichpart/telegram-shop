import './globals.css';
import { CartProvider } from './context/CartContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-gray-100">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

