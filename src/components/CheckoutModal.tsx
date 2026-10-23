import React, { useState } from 'react';
import {
  X,
  Truck,
  ShieldCheck,
  Phone,
  User,
  MapPin,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { TUNISIAN_GOVERNORATES } from '../data/tunisiaData';
import { createOrder } from '../services/orderService';
import { Order, OrderItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { items, subtotal, shippingCost, totalAmount, clearCart } = useCart();
  const { profile, currentUser } = useAuth();

  const [fullName, setFullName] = useState(profile?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [governorate, setGovernorate] = useState(profile?.governorate || 'تونس');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('يرجى إدخال الاسم واللقب.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMsg('يرجى إدخال رقم هاتف تونسي صحيح (مثال: 98123456 أو 20123456).');
      return;
    }

    if (!governorate) {
      setErrorMsg('يرجى اختيار الولاية التونسية للتوصيل.');
      return;
    }

    if (!address.trim()) {
      setErrorMsg('يرجى كتابة العنوان بالتفصيل لضمان سرعة التوصيل.');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('سلة المشتريات فارغة.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems: OrderItem[] = items.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        vendorId: item.product.vendorId,
        vendorName: item.product.vendorName,
        image: item.product.images[0] || '',
        governorate: item.product.governorate,
      }));

      // Gather distinct vendor IDs
      const vendorIds = Array.from(new Set(orderItems.map((i) => i.vendorId)));

      const newOrder = await createOrder({
        customerId: currentUser?.uid || profile?.uid || 'guest_buyer',
        customerName: fullName.trim(),
        customerPhone: cleanPhone,
        shippingAddress: address.trim(),
        governorate,
        city: city.trim() || governorate,
        items: orderItems,
        subtotal,
        shippingCost,
        totalAmount,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        orderStatus: 'new',
        platformCommissionRate: 0.10, // 10% platform commission
        vendorIds,
        notes: notes.trim(),
      });

      clearCart();
      onClose();
      onOrderSuccess(newOrder);

      // Trigger real-time notifications for each vendor involved
      try {
        const { notifySellerNewOrder, sendNotification } = await import('../services/notificationService');
        for (const vId of vendorIds) {
          await notifySellerNewOrder(vId, newOrder.orderNumber, newOrder.totalAmount, newOrder.customerName);
        }
        // Also notify admin
        await sendNotification({
          recipientRole: 'admin',
          title: `🛒 طلب شراء جديد في سوقنا (${newOrder.orderNumber})`,
          body: `سجل الحريف ${newOrder.customerName} طلباً جديداً بقيمة ${newOrder.totalAmount.toFixed(3).replace(/\.?0+$/, '')} د.ت موجه لولاية ${newOrder.governorate}.`,
          type: 'new_order',
          data: { orderId: newOrder.id, orderNumber: newOrder.orderNumber },
        });
      } catch (notifErr) {
        console.warn('Notification dispatch error (non-blocking):', notifErr);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg('حدث خطأ أثناء تسجيل طلبك، يرجى إعادة المحاولة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-stone-200 text-right">
        {/* Header */}
        <div className="bg-[#064e3b] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-lg font-['Cairo']">
              إتمام الطلب والتوصيل إلى باب منزلك
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer Personal Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-stone-900 border-b border-stone-200 pb-2">
              1. معلومات المستلم والاتصال
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  الاسم واللقب *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="مثال: محمد بن سالم"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 pr-9 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  رقم الهاتف الجوال التونسي *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="tel"
                    required
                    placeholder="مثال: 98123456 أو 24123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 pr-9 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none dir-ltr text-right"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute right-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  سيتم الاتصال بك لتأكيد ميعاد التسليم.
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-stone-900 border-b border-stone-200 pb-2">
              2. عنوان التوصيل في تونس
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  الولاية *
                </label>
                <div className="relative flex items-center">
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white cursor-pointer"
                  >
                    {TUNISIAN_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        ولاية {gov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  المدينة / المعتمدية والرمز البريدي
                </label>
                <input
                  type="text"
                  placeholder="مثال: نابل المدينة، 8000"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                العنوان المفصل (الشارع، رقم العمارة أو المنزل) *
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  placeholder="مثال: نهج الحبيب بورقيبة، عمارة الأمل، الطابق 2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 pr-9 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
                <MapPin className="w-4 h-4 text-stone-400 absolute right-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ملاحظات إضافية للتوصيل (اختياري)
              </label>
              <textarea
                rows={2}
                placeholder="توجيهات للموصّل، وقت مفضل للتسليم..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method Section (Strict compliance with User Rule 9: No fake electronic payment!) */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-stone-900 border-b border-stone-200 pb-2">
              3. طريقة الدفع
            </h3>

            {/* Selected COD box */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-700 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-xs text-emerald-950">
                  الدفع نقداً عند الاستلام (Paiement à la livraison)
                </p>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  تدفع بالدينار التونسي للموصّل عند استلامك الطرد ومعاينته. لا توجد أي مصاريف خفية.
                </p>
              </div>
            </div>

            {/* Transparency Note about Tunisian payment gateways */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-300/70 text-[11px] text-amber-950 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>إشعار الشفافية والموثوقية:</span>
              </div>
              <p>
                منصة «سوقنا» ملتزمة بالوضوح التام، ولا تفعّل أي دفع إلكتروني صوري أو وهمي. سيتم ربط بوابات الدفع الإلكتروني التونسية المعتمدة رسمياً (GIM-TEL / Konnect / Flouci) في المراحل القادمة بعد استكمال التدقيق المصرفي.
              </p>
            </div>
          </div>

          {/* Order Summary & Pricing */}
          <div className="bg-[#fbf9f4] p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>عدد المنتجات في السلة:</span>
              <span className="font-bold text-stone-800">
                {items.reduce((s, i) => s + i.quantity, 0)} قطعة
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>المجموع الفرعي للسلع:</span>
              <span className="font-bold text-stone-800">
                {subtotal.toFixed(3).replace(/\.?0+$/, '')} د.ت
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>معلوم التوصيل لكامل تراب الجمهورية:</span>
              <span className="font-bold text-stone-800">
                {shippingCost === 0 ? (
                  <span className="text-emerald-700 font-bold">مجاني</span>
                ) : (
                  `${shippingCost.toFixed(3).replace(/\.?0+$/, '')} د.ت`
                )}
              </span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-black text-emerald-950">
              <span>المبلغ الإجمالي المستحق عند الاستلام:</span>
              <span className="text-base text-emerald-900 font-['Cairo']">
                {totalAmount.toFixed(3).replace(/\.?0+$/, '')} د.ت
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جارٍ تسجيل طلبك في المنصة...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تأكيد الطلب الآن ({totalAmount.toFixed(3).replace(/\.?0+$/, '')} د.ت)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
