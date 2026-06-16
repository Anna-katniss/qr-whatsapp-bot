import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Check } from 'lucide-react';
import { Order } from '../types';

function getElapsedMinutes(receivedAt: Date): number {
  return Math.floor((Date.now() - receivedAt.getTime()) / 1000 / 60);
}

function getTicketColor(minutes: number, status: string): string {
  if (status === 'ready') return 'bg-green-100 border-green-500';
  if (status === 'preparing') return 'bg-blue-100 border-blue-500';
  if (minutes < 5) return 'bg-slate-50 border-slate-200';
  if (minutes < 12) return 'bg-amber-50 border-amber-400';
  return 'bg-red-50 border-red-500';
}

function getTimerColor(minutes: number, status: string): string {
  if (status === 'ready') return 'text-green-700';
  if (status === 'preparing') return 'text-blue-700';
  if (minutes < 5) return 'text-slate-700';
  if (minutes < 12) return 'text-amber-700';
  return 'text-red-700';
}

interface OrderTicketProps {
  order: Order;
  onStatusChange?: (orderId: string, status: Order['status']) => void;
  onComplete?: (orderId: string) => void;
  compact?: boolean;
}

export function OrderTicket({ order, onStatusChange, onComplete, compact = false }: OrderTicketProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(getElapsedMinutes(order.receivedAt));

  useEffect(() => {
  if (order.status === 'ready') return; // Don't start interval if already ready

  const interval = setInterval(() => {
    setElapsedMinutes(getElapsedMinutes(order.receivedAt));
  }, 1000);

  return () => clearInterval(interval);
}, [order.receivedAt, order.status]); // Add order.status to deps

  const ticketColor = getTicketColor(elapsedMinutes, order.status);
  const timerColor = getTimerColor(elapsedMinutes, order.status);

  return (
    <div className={`${ticketColor} border-2 rounded-lg p-6 shadow-lg transition-colors duration-500 ${compact ? 'w-full' : 'w-80'}`}>
      {/* Header: Table Number and Timer */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-current gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm opacity-60 mb-1">TABLE</div>
          <div className="text-3xl font-bold truncate" title={order.tableNumber}>{order.tableNumber}</div>
        </div>
        <div className={`flex items-center gap-1.5 flex-shrink-0 ${timerColor}`}>
          <Clock className="w-6 h-6" />
          <div className="text-2xl tabular-nums font-medium">
            {elapsedMinutes}m
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <div className="text-sm opacity-60 mb-2">ITEMS</div>
        <div className="space-y-1">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-baseline">
              <span className="text-lg">{item.name}</span>
              <span className="text-xl ml-2 tabular-nums">×{item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Special Notes and Allergies */}
      {order.notes.length > 0 && (
        <div className="space-y-2 mb-4">
          {order.notes.map((note, index) => (
            <div
              key={index}
              className={`p-3 rounded ${
                note.isAllergy
                  ? 'bg-red-600 text-white border-2 border-red-800'
                  : 'bg-yellow-100 border-2 border-yellow-600'
              }`}
            >
              <div className="flex items-center gap-2">
                {note.isAllergy && <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
                <div className="text-lg uppercase tracking-wide">
                  {note.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {(onStatusChange || onComplete) && (
        <div className="flex gap-2 mt-4">
          {order.status === 'pending' && onStatusChange && (
            <button
              onClick={() => onStatusChange(order.id, 'preparing')}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              Start Cooking
            </button>
          )}
          {order.status === 'preparing' && onStatusChange && (
            <button
              onClick={() => onStatusChange(order.id, 'ready')}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-lg flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Mark Ready
            </button>
          )}
          {order.status === 'ready' && onComplete && (
            <button
              onClick={() => onComplete(order.id)}
              className="flex-1 bg-slate-800 text-white py-3 px-4 rounded-lg hover:bg-slate-900 transition-colors text-lg"
            >
              Clear Ticket
            </button>
          )}
        </div>
      )}
    </div>
  );
}
