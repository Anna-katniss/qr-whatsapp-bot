import { useState } from 'react';
import { useKitchenStore } from '../store/kitchen-store';
import { Power, PowerOff, ChevronDown, ChevronUp } from 'lucide-react';

type CategoryFilter = 'all' | 'starters' | 'mains' | 'desserts' | 'beverages';

export function InventoryDashboard() {
  const { menuItems, toggleMenuItemAvailability, toggleModifier } = useKitchenStore();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredItems =
    categoryFilter === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === categoryFilter);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const availableCount = menuItems.filter((item) => item.available).length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl text-white mb-2">Menu Inventory Dashboard</h2>
        <p className="text-slate-400 text-lg mb-6">
          Manage item availability and modifiers. Changes sync instantly to customer menus.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-6 border-2 border-slate-700">
            <div className="text-slate-400 text-sm mb-1">TOTAL ITEMS</div>
            <div className="text-4xl text-white">{menuItems.length}</div>
          </div>
          <div className="bg-green-900/30 rounded-lg p-6 border-2 border-green-700">
            <div className="text-green-400 text-sm mb-1">AVAILABLE</div>
            <div className="text-4xl text-white">{availableCount}</div>
          </div>
          <div className="bg-red-900/30 rounded-lg p-6 border-2 border-red-700">
            <div className="text-red-400 text-sm mb-1">OUT OF STOCK</div>
            <div className="text-4xl text-white">{menuItems.length - availableCount}</div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2">
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

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          const hasModifiers = item.modifiers && item.modifiers.length > 0;

          return (
            <div
              key={item.id}
              className={`rounded-lg border-2 overflow-hidden transition-colors ${
                item.available
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-red-900/20 border-red-800'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl text-white mb-1">{item.name}</h3>
                    <span className="px-2 py-1 bg-slate-600 rounded text-xs uppercase text-slate-300">
                      {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleMenuItemAvailability(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      item.available
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {item.available ? (
                      <>
                        <Power className="w-5 h-5" />
                        <span>Available</span>
                      </>
                    ) : (
                      <>
                        <PowerOff className="w-5 h-5" />
                        <span>Out of Stock</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Modifiers Section */}
                {hasModifiers && (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-2"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        Modifiers ({item.modifiers?.length})
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="space-y-2 mt-3 pt-3 border-t border-slate-700">
                        {item.modifiers?.map((modifier) => (
                          <div
                            key={modifier.id}
                            className="flex items-center justify-between py-2 px-3 bg-slate-900 rounded"
                          >
                            <span className="text-slate-300">{modifier.name}</span>
                            <button
                              onClick={() => toggleModifier(item.id, modifier.id)}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                modifier.enabled
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-slate-600 text-slate-400 hover:bg-slate-500'
                              }`}
                            >
                              {modifier.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
