import { create } from 'zustand';
import { Order, MenuItem, OrderStatus, OrderItem, OrderNote } from '../types';
import { supabase } from '../lib/supabase';

interface KitchenStore {
  orders: Order[];
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
  toggleMenuItemAvailability: (itemId: string) => Promise<void>;
  toggleModifier: (itemId: string, modifierId: string) => void;
}

// Keep mock menu items as fallback if the database menu_items table is empty
const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Burger & Fries',
    category: 'mains',
    available: true,
    modifiers: [
      { id: 'm1', name: 'No Onions', enabled: true },
      { id: 'm2', name: 'Extra Cheese', enabled: true },
      { id: 'm3', name: 'No Pickles', enabled: true },
    ],
  },
  {
    id: '2',
    name: 'Caesar Salad',
    category: 'starters',
    available: true,
    modifiers: [
      { id: 'm4', name: 'No Croutons', enabled: true },
      { id: 'm5', name: 'Extra Dressing', enabled: true },
    ],
  },
  { id: '3', name: 'Pasta Carbonara', category: 'mains', available: true },
  { id: '4', name: 'Grilled Salmon', category: 'mains', available: false },
  { id: '5', name: 'Pizza Margherita', category: 'mains', available: true },
  { id: '6', name: 'Chicken Wings', category: 'starters', available: true },
  { id: '7', name: 'Chocolate Cake', category: 'desserts', available: true },
  { id: '8', name: 'Ice Cream', category: 'desserts', available: true },
];

export const useKitchenStore = create<KitchenStore>((set, get) => ({
  orders: [],
  menuItems: mockMenuItems,
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      // 1. Fetch menu items to get names
      const { data: dbMenuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('id, name, category, is_available');
      
      if (menuError) {
        console.warn('Could not fetch menu_items, RLS might be blocking it:', menuError.message);
      }
      
      const menuMap = new Map();
      if (dbMenuItems && dbMenuItems.length > 0) {
        dbMenuItems.forEach((item: any) => menuMap.set(item.id, item.name));
        // Update the store's menuItems
        set({
          menuItems: dbMenuItems.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category || 'mains',
            available: item.is_available,
            modifiers: []
          }))
        });
      }

      // 2. Fetch orders and their related items
      const { data: dbOrders, error } = await supabase
        .from('orders')
        .select(`
              id,
              status,
              created_at,
              table_number,
              order_items (
                    id,
                    quantity,
                    customizations,
                    menu_item_id
              ),
              order_notes (
                    id,
                    text,
                    is_allergy
              )
          `);

      if (error) throw error;

      // Transform DB orders to match the app's Order type
      const transformedOrders: Order[] = (dbOrders || []).map((dbOrder: any) => {
        const items: OrderItem[] = (dbOrder.order_items || []).map((item: any) => {
          // Resolve name using the menuMap, fallback to ID substring if not found
          const resolvedName = menuMap.get(item.menu_item_id) || `Item ${item.menu_item_id?.substring(0, 4) || 'Unknown'}`;
          return {
            name: resolvedName,
            quantity: item.quantity || 1,
            modifiers: item.customizations ? [item.customizations] : []
          };
        });

        return {
              id: dbOrder.id,
              tableNumber: dbOrder.table_number || 'Takeaway',
              items: items,
              notes: (dbOrder.order_notes || []).map((n: any) => ({
              text: n.text,
              isAllergy: n.is_allergy
          })),
              receivedAt: new Date(dbOrder.created_at),
              status: (dbOrder.status === 'placed' ? 'pending' : dbOrder.status) as OrderStatus || 'pending',
              };
      });

      set({ orders: transformedOrders, isLoading: false });

      // Set up realtime subscription for new or updated orders
      supabase
        .channel('kitchen_orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('Realtime change received!', payload);
            // Re-fetch everything to keep items in sync easily
            get().initialize();
          }
        )
        .subscribe();

    } catch (err: any) {
      console.error('Error initializing store:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  addOrder: (order) =>
    set((state) => ({ orders: [...state.orders, order] })),

  updateOrderStatus: async (orderId, status) => {
    // Optimistic update
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    }));

    // Update DB
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Failed to update order status:', error);
      // Re-fetch to revert on failure
      get().initialize();
    }
  },

  completeOrder: async (orderId) => {
    // Optimistic update
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? { ...order, status: 'completed' as OrderStatus, completedAt: new Date() }
          : order
      ),
    }));

    // Update DB
    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId);

    if (error) {
      console.error('Failed to complete order:', error);
      // Re-fetch to revert on failure
      get().initialize();
    }
  },

  toggleMenuItemAvailability: async (itemId) => {
    const item = get().menuItems.find(i => i.id === itemId);
    const newAvailable = item ? !item.available : false;

    set((state) => ({
      menuItems: state.menuItems.map((item) =>
        item.id === itemId ? { ...item, available: newAvailable } : item
      ),
    }));

    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: newAvailable })
      .eq('id', itemId);

    if (error) {
      console.error('Failed to update menu item availability:', error);
      get().initialize();
    }
  },

  toggleModifier: (itemId, modifierId) =>
    set((state) => ({
      menuItems: state.menuItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              modifiers: item.modifiers?.map((mod) =>
                mod.id === modifierId ? { ...mod, enabled: !mod.enabled } : mod
              ),
            }
          : item
      ),
    })),
}));
