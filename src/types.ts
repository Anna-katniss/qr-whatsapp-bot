export interface OrderNote {
  text: string;
  isAllergy?: boolean;
}

export interface OrderItem {
  name: string;
  quantity: number;
  modifiers?: string[];
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';

export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  notes: OrderNote[];
  receivedAt: Date;
  status: OrderStatus;
  completedAt?: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'starters' | 'mains' | 'desserts' | 'beverages';
  available: boolean;
  modifiers?: MenuModifier[];
}

export interface MenuModifier {
  id: string;
  name: string;
  enabled: boolean;
}
