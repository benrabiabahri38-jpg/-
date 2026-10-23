import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  X,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { Order } from '../types';
import { fetchOrdersByCustomer, fetchAllOrders } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const customerId = currentUser?.uid || profile?.uid || 'demo_user_1';

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      // In guest/demo mode, fetch all or customer specific
      const customerOrders = await fetchOrdersByCustomer(customerId);
      if (customerOrders.length > 0) {
        setOrders(customerOrders);
      } else {
        // Fallback: load recent orders so the user can immediately see their test orders
        const all = await fetchAllOrders();
        setOrders(all.slice(0, 5));
      }
    } catch (e) {
      console.error('Error fetching customer orders', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-stone-200 text-right flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#064e3b] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-lg font-['Cairo']">طلباتي في سوقنا</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>متابعة حالة الشحن والتوصيل لطلباتك:</span>
            <button
              onClick={loadOrders}
              className="text-emerald-800 font-bold hover:underline flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-3">
              <Package className="w-12 h-12 mx-auto text-stone-300" />
              <p className="font-bold text-stone-700">لم تقم بإتمام أي طلب بعد</p>
              <p className="text-xs text-stone-500">
                تسوق من تشكيلة الحرف والتجارة التونسية، وسيتم تسجيل طلباتك هنا.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-emerald-900">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        order.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : order.orderStatus === 'processing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {order.orderStatus === 'delivered'
                        ? 'تم التوصيل'
                        : order.orderStatus === 'shipped'
                        ? 'في الطريق مع الموصّل'
                        : order.orderStatus === 'processing'
                        ? 'قيد التجهيز والتغليف'
                        : 'طلب مسجل'}
                    </span>
                  </div>

                  <span className="text-[11px] text-stone-400">
                    {new Date(order.createdAt).toLocaleDateString('ar-TN')}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.image}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-stone-800">{item.title}</p>
                          <p className="text-[10px] text-stone-500">
                            {item.quantity} × {item.price.toFixed(3).replace(/\.?0+$/, '')} د.ت
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">
                        {(item.price * item.quantity).toFixed(3).replace(/\.?0+$/, '')} د.ت
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom line: Total & Address */}
                <div className="pt-2 border-t border-stone-200/60 flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-1 text-stone-500 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>توصيل إلى: ولاية {order.governorate} ({order.shippingAddress})</span>
                  </div>

                  <div className="font-black text-emerald-900 font-['Cairo'] text-sm">
                    المجموع: {order.totalAmount.toFixed(3).replace(/\.?0+$/, '')} د.ت (نقداً عند الاستلام)
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
