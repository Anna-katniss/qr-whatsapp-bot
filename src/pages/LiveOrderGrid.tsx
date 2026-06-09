import { useState, useMemo } from 'react';
import { OrderTicket } from '../components/OrderTicket';
import { useKitchenStore } from '../store/kitchen-store';

export function LiveOrderGrid() {
  const { orders, updateOrderStatus, completeOrder } = useKitchenStore();
  const [viewMode, setViewMode] = useState<'active' | 'completed'>('active');

  const filteredOrders = useMemo(() => {
    const filtered = viewMode === 'active'
      ? orders.filter((o) => o.status !== 'completed')
      : orders.filter((o) => o.status === 'completed');

    // Sort by time - oldest first for active, newest first for completed
    return filtered.sort((a, b) => {
      if (viewMode === 'active') {
        return a.receivedAt.getTime() - b.receivedAt.getTime();
      }
      return (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0);
    });
  }, [orders, viewMode]);

  return (
    <div>
      {/* View Toggle and Stats */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('active')}
            className={`px-6 py-3 rounded-lg text-lg transition-colors ${
              viewMode === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Active Tickets ({orders.filter((o) => o.status !== 'completed').length})
          </button>
          <button
            onClick={() => setViewMode('completed')}
            className={`px-6 py-3 rounded-lg text-lg transition-colors ${
              viewMode === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Completed History ({orders.filter((o) => o.status === 'completed').length})
          </button>
        </div>

        {/* Time Legend */}
        <div className="text-slate-400 text-lg flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-slate-200 rounded-full"></span>
            0-5min
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-amber-400 rounded-full"></span>
            5-12min
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-red-500 rounded-full"></span>
            12min+
          </span>
        </div>
      </div>

      {/* Order Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-xl">
            {viewMode === 'active' ? 'No active orders' : 'No completed orders'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOrders.map((order) => (
            <OrderTicket
              key={order.id}
              order={order}
              onStatusChange={updateOrderStatus}
              onComplete={completeOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}
