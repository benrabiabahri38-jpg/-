import React from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    shippingCost,
    totalAmount,
    itemCount,
  } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 120;
  const neededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between text-right border-r border-stone-200">
          {/* Header */}
          <div className="px-6 py-4 bg-[#064e3b] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-lg font-['Cairo']">سلة المشتريات ({itemCount})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-stone-200 hover:text-white hover:bg-emerald-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#fbf9f4] px-6 py-3 border-b border-stone-200 text-xs">
            {subtotal >= freeShippingThreshold ? (
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>مبروك! لقد حصلت على توصيل مجاني لكافة ولايات تونس 🎉</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-stone-700">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>توصيل مجاني عند الوصول إلى 120 د.ت</span>
                  </span>
                  <span className="font-bold text-emerald-800">
                    باقي {neededForFreeShipping.toFixed(3).replace(/\.?0+$/, '')} د.ت
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-stone-800">سلتك فارغة حالياً</h3>
                  <p className="text-xs text-stone-500">
                    استكشف منتجات الحرفيين والتجار التونسيين وأضف ما يعجبك.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 text-amber-300 text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 flex gap-3">
                  {/* Thumbnail */}
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-18 h-18 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-50"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-1 leading-snug">
                          {product.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-stone-400 hover:text-red-600 p-0.5 transition-colors"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <span>ولاية {product.governorate}</span> • <span>{product.vendorName}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Price */}
                      <span className="font-black text-xs text-emerald-900 font-['Cairo']">
                        {(product.price * quantity).toFixed(3).replace(/\.?0+$/, '')} د.ت
                      </span>

                      {/* Quantity buttons */}
                      <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 rounded bg-white flex items-center justify-center text-stone-700 hover:bg-stone-50 shadow-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-stone-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="w-6 h-6 rounded bg-white flex items-center justify-center text-stone-700 hover:bg-stone-50 shadow-xs disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {items.length > 0 && (
            <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-4">
              {/* Summary lines */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>المجموع الفرعي:</span>
                  <span className="font-bold text-stone-900">
                    {subtotal.toFixed(3).replace(/\.?0+$/, '')} د.ت
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>معلوم التوصيل (لكل الولايات):</span>
                  <span className="font-bold text-stone-900">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-700">مجاني</span>
                    ) : (
                      `${shippingCost.toFixed(3).replace(/\.?0+$/, '')} د.ت`
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-black text-emerald-950">
                  <span>المبلغ الجملي للدفع:</span>
                  <span className="text-base text-emerald-900 font-['Cairo']">
                    {totalAmount.toFixed(3).replace(/\.?0+$/, '')} د.ت
                  </span>
                </div>
              </div>

              {/* Payment disclaimer */}
              <div className="bg-amber-50 border border-amber-200/80 p-2 rounded-xl text-[11px] text-amber-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>الدفع نقداً عند استلام الطرد وفحصه مع الموصّل.</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onOpenCheckout();
                }}
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>إتمام الطلب الآن (الدفع عند الاستلام)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={clearCart}
                className="w-full text-center text-xs text-stone-400 hover:text-red-600 font-medium transition-colors"
              >
                تفريغ السلة بالكامل
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
