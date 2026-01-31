'use client';

import OrderTracker from '@/components/OrderTracker';

export default function TrackPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Отслеживание заказов</h1>
      <OrderTracker />
    </div>
  );
}