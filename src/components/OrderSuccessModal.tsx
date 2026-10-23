import React from 'react';
import { CheckCircle, Package, Truck, Phone, MapPin, ArrowRight, Store } from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewOrders,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-stone-200 text-right p-6 sm:p-8 space-y-6">
        {/* Success Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-9 h-9" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-['Cairo']">
            تم تسجيل طلبك بنجاح في سوقنا!
          </h2>
          <p className="text-xs text-stone-600">
            شكراً لثقتك ودعمك للتجارة والحرف التونسية الأصيلة.
          </p>
        </div>

        {/* Tracking Number Box */}
        <div className="bg-[#fbf9f4] border-2 border-dashed border-amber-300 rounded-2xl p-4 text-center space-y-1">
          <p className="text-xs font-semibold text-stone-500">رقم تتبع الطلب في سوقنا:</p>
          <p className="text-xl font-black tracking-widest text-emerald-900 font-mono">
            {order.orderNumber}
          </p>
          <p className="text-[11px] text-amber-800 font-medium">
            احفظ هذا الرقم لمتابعة حالة الشحن مع الموصّل.
          </p>
        </div>

        {/* Order Details Brief */}
        <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-stone-500">المستلم:</span>
            <span className="font-bold text-stone-900">{order.customerName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-500">الهاتف الجوال:</span>
            <span className="font-bold text-stone-900 dir-ltr">{order.customerPhone}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-500">وجهة التوصيل:</span>
            <span className="font-bold text-stone-900">
              ولاية {order.governorate} - {order.shippingAddress}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-500">طريقة الدفع:</span>
            <span className="font-bold text-emerald-800">الدفع نقداً عند الاستلام</span>
          </div>

          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-sm font-black text-emerald-950">
            <span>المبلغ الجملي المطلوب:</span>
            <span className="text-base font-black text-emerald-900">
              {order.totalAmount.toFixed(3).replace(/\.?0+$/, '')} د.ت
            </span>
          </div>
        </div>

        {/* Delivery Note */}
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>سيقوم فريق التوصيل بالاتصال بك هاتفياً لتنسيق وقت التسليم.</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onViewOrders();
            }}
            className="w-full py-3 rounded-xl bg-[#064e3b] hover:bg-[#053d2e] text-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>عرض طلباتي السابقة</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors flex items-center justify-center gap-1"
          >
            <span>مواصلة التسوق</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
