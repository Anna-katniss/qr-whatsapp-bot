import { useMemo } from 'react';
import { useKitchenStore } from '../store/kitchen-store';
import { OrderTicket } from '../components/OrderTicket';
import { Bell, TrendingUp } from 'lucide-react';

export function RunnerHandshake() {
  const { orders, completeOrder } = useKitchenStore();

  const readyOrders = useMemo(
    () => orders.filter((o) => o.status === 'ready').sort((a, b) => a.receivedAt.getTime() - b.receivedAt.getTime()),
    [orders]
  );

  const tableServedCounts = useMemo(() => {
    const counts = new Map<string, number>();
    orders
      .filter((o) => o.status === 'completed')
      .forEach((order) => {
        counts.set(order.tableNumber, (counts.get(order.tableNumber) || 0) + 1);
      });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [orders]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl text-white mb-2">Runner Handshake Screen</h2>
        <p className="text-slate-400 text-lg mb-6">
          Orders ready for service. Runners grab tickets from the pass and deliver to tables.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-900/30 rounded-lg p-6 border-2 border-green-700">
            <div className="text-green-400 text-sm mb-1">READY FOR PICKUP</div>
            <div className="text-4xl text-white">{readyOrders.length}</div>
          </div>
          <div className="bg-blue-900/30 rounded-lg p-6 border-2 border-blue-700">
            <div className="text-blue-400 text-sm mb-1">IN PREPARATION</div>
            <div className="text-4xl text-white">
              {orders.filter((o) => o.status === 'preparing').length}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border-2 border-slate-700">
            <div className="text-slate-400 text-sm mb-1">COMPLETED TODAY</div>
            <div className="text-4xl text-white">
              {orders.filter((o) => o.status === 'completed').length}
            </div>
          </div>
        </div>
      </div>

      {/* Ready Orders */}
      {readyOrders.length === 0 ? (
        <div className="bg-slate-800 rounded-lg border-2 border-slate-700 p-12 text-center">
          <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-xl">No orders ready for pickup</p>
          <p className="text-slate-500 mt-2">
            Orders will appear here when chefs mark them as ready
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-3">
            <Bell className="w-6 h-6 text-green-400 animate-pulse" />
            <h3 className="text-2xl text-white">Ready for Service ({readyOrders.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {readyOrders.map((order) => (
              <OrderTicket key={order.id} order={order} onComplete={completeOrder} />
            ))}
          </div>
        </>
      )}

      {/* Service Statistics */}
      {tableServedCounts.length > 0 && (
        <div className="bg-slate-800 rounded-lg border-2 border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl text-white">Top Served Tables Today</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {tableServedCounts.map(([table, count], index) => (
              <div
                key={table}
                className="bg-slate-900 rounded-lg p-4 border border-slate-700"
              >
                <div className="text-slate-400 text-sm mb-1">
                  #{index + 1} - TABLE {table}
                </div>
                <div className="text-3xl text-white tabular-nums">{count}</div>
                <div className="text-slate-500 text-xs mt-1">orders served</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
