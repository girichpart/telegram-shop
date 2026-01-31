import './globals.css';
import Layout from './components/layout/Layout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-gray-100 text-gray-900">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}

