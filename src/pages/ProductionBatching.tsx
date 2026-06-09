import { useMemo, useState } from 'react';
import { useKitchenStore } from '../store/kitchen-store';
import { OrderItem } from '../types';

type CategoryFilter = 'all' | 'starters' | 'mains' | 'desserts' | 'beverages';

interface AggregatedItem {
  name: string;
  totalQuantity: number;
  orderIds: string[];
  category?: string;
}

export function ProductionBatching() {
  const { orders } = useKitchenStore();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'completed'),
    [orders]
  );

  const aggregatedItems = useMemo(() => {
    const itemMap = new Map<string, AggregatedItem>();

    activeOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = itemMap.get(item.name);
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.orderIds.push(order.id);
        } else {
          itemMap.set(item.name, {
            name: item.name,
            totalQuantity: item.quantity,
            orderIds: [order.id],
          });
        }
      });
    });

    return Array.from(itemMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [activeOrders]);

  const categoryMap: Record<string, string> = {
    'Burger & Fries': 'mains',
    'Caesar Salad': 'starters',
    'Pasta Carbonara': 'mains',
    'Grilled Salmon': 'mains',
    'Pizza Margherita': 'mains',
    'Chicken Wings': 'starters',
    'Steak Medium Rare': 'mains',
    'Garlic Bread': 'starters',
    'House Salad': 'starters',
    'Steamed Vegetables': 'mains',
    'Mashed Potatoes': 'mains',
  };

  const filteredItems = useMemo(() => {
    if (categoryFilter === 'all') return aggregatedItems;
    return aggregatedItems.filter((item) => categoryMap[item.name] === categoryFilter);
  }, [aggregatedItems, categoryFilter]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl text-white mb-4">Production Batching Panel</h2>
        <p className="text-slate-400 text-lg mb-6">
          Consolidated view of all open orders. Items are aggregated to optimize batch production.
        </p>

        {/* Category Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'starters', 'mains', 'desserts', 'beverages'] as CategoryFilter[]).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-6 py-3 rounded-lg text-lg capitalize transition-colors ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-6 border-2 border-slate-700">
          <div className="text-slate-400 text-sm mb-1">ACTIVE ORDERS</div>
          <div className="text-4xl text-white">{activeOrders.length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border-2 border-slate-700">
          <div className="text-slate-400 text-sm mb-1">UNIQUE ITEMS</div>
          <div className="text-4xl text-white">{aggregatedItems.length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border-2 border-slate-700">
          <div className="text-slate-400 text-sm mb-1">TOTAL ITEMS</div>
          <div className="text-4xl text-white">
            {aggregatedItems.reduce((sum, item) => sum + item.totalQuantity, 0)}
          </div>
        </div>
      </div>

      {/* Aggregated Items List */}
      <div className="bg-slate-800 rounded-lg border-2 border-slate-700 overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-700">
          <h3 className="text-xl text-white">Aggregated Production Queue</h3>
        </div>
        <div className="divide-y divide-slate-700">
          {filteredItems.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400 text-lg">
              No items in this category
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.name} className="px-6 py-4 hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-white text-xl mb-1">{item.name}</div>
                    <div className="text-slate-400 text-sm">
                      Across {item.orderIds.length} order{item.orderIds.length !== 1 ? 's' : ''}
                      {categoryMap[item.name] && (
                        <span className="ml-3 px-2 py-1 bg-slate-600 rounded text-xs uppercase">
                          {categoryMap[item.name]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 text-sm mb-1">TOTAL QUANTITY</div>
                    <div className="text-5xl tabular-nums text-white">×{item.totalQuantity}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
