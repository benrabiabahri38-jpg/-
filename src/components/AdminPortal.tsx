import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Coins,
  Package,
  Users,
  Percent,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Star,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Truck,
  ArrowRight,
  MessageSquare,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Product, Order, OrderStatus, PlatformSettings, Review, ReviewStatus } from '../types';
import { fetchAllOrders, updateOrderStatus } from '../services/orderService';
import { deleteProduct, updateProduct, seedSampleProducts } from '../services/productService';
import { getPlatformSettings, updatePlatformSettings } from '../services/settingsService';
import { fetchAllReviews, updateReviewStatus, deleteReview } from '../services/reviewService';

interface AdminPortalProps {
  products: Product[];
  onRefreshProducts: () => Promise<void>;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  products,
  onRefreshProducts,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'vendors' | 'reviews'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings>({
    commissionRate: 0.10, // 10%
    supportPhone: '+216 71 800 900',
    supportEmail: 'admin@soukna.tn',
    maintenanceMode: false,
    defaultShippingCost: 7.0,
  });

  const [commissionInput, setCommissionInput] = useState<number>(10);
  const [commissionSavedMsg, setCommissionSavedMsg] = useState(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [reviewFilter, setReviewFilter] = useState<string>('all');

  const loadData = async () => {
    setIsLoadingOrders(true);
    try {
      const [allOrders, currentSettings, allReviews] = await Promise.all([
        fetchAllOrders(),
        getPlatformSettings(),
        fetchAllReviews(),
      ]);
      setOrders(allOrders);
      setReviews(allReviews);
      if (currentSettings) {
        setSettings(currentSettings);
        setCommissionInput(Math.round(currentSettings.commissionRate * 100));
      }
    } catch (e) {
      console.error('Error loading admin data', e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateDecimal = Number((commissionInput / 100).toFixed(2));
    try {
      const updated = await updatePlatformSettings({ commissionRate: rateDecimal });
      setSettings(updated);
      setCommissionSavedMsg(true);
      setTimeout(() => setCommissionSavedMsg(false), 2500);
    } catch (err) {
      alert('فشل حفظ نسبة العمولة');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      await updateProduct(product.id, { featured: !product.featured });
      await onRefreshProducts();
    } catch (e) {
      alert('فشل تعديل حالة التمييز');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك كمسؤول المنصة في حذف هذا المنتج نهائياً؟')) {
      try {
        await deleteProduct(productId);
        await onRefreshProducts();
      } catch (e) {
        alert('فشل حذف المنتج');
      }
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      const target = orders.find((o) => o.id === orderId);
      if (target) {
        const { notifyBuyerOrderStatus } = await import('../services/notificationService');
        await notifyBuyerOrderStatus(
          target.customerId || 'guest_buyer',
          target.orderNumber,
          status
        );
      }
      await loadData();
    } catch (e) {
      alert('فشل تحديث حالة الطلب');
    }
  };

  // Review Moderation Actions
  const handleModerateReview = async (reviewId: string, newStatus: ReviewStatus) => {
    try {
      await updateReviewStatus(reviewId, newStatus);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert('فشل تحديث حالة مراجعة التقييم');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التقييم نهائياً من قاعدة البيانات؟')) {
      try {
        await deleteReview(reviewId);
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } catch (err) {
        alert('فشل حذف التقييم');
      }
    }
  };

  const handleSeedCatalog = async () => {
    if (window.confirm('هل تريد إعادة تغذية قاعدة بيانات سوقنا بالمنتجات والتقييمات التونسية الأصيلة؟')) {
      setIsSeeding(true);
      try {
        await seedSampleProducts();
        await onRefreshProducts();
        await loadData();
        setSeedSuccessMsg(true);
        setTimeout(() => setSeedSuccessMsg(false), 3000);
      } catch (e) {
        alert('فشل تغذية المنتجات');
      } finally {
        setIsSeeding(false);
      }
    }
  };

  // Financial metrics
  const totalGrossSales = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const platformEstimatedRevenue = orders.reduce(
    (sum, o) => sum + (o.platformCommissionAmount || o.subtotal * (settings.commissionRate || 0.10)),
    0
  );
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? totalGrossSales / totalOrdersCount : 0;

  // Vendors extraction
  const uniqueVendorsMap = new Map<string, { vendorId: string; vendorName: string; governorate: string; productCount: number }>();
  products.forEach((p) => {
    const existing = uniqueVendorsMap.get(p.vendorId || p.vendorName);
    if (existing) {
      existing.productCount += 1;
    } else {
      uniqueVendorsMap.set(p.vendorId || p.vendorName, {
        vendorId: p.vendorId,
        vendorName: p.vendorName,
        governorate: p.governorate,
        productCount: 1,
      });
    }
  });
  const vendorsList = Array.from(uniqueVendorsMap.values());

  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'all' && o.orderStatus !== orderFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.governorate.includes(q)
      );
    }
    return true;
  });

  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter !== 'all' && r.status !== reviewFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-right font-['Cairo']">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-[#064e3b] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-bold shadow-lg shrink-0">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black font-['Cairo']">
                لوحة الإدارة العليا | منصة سوقنا
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-xs font-black">
                Super Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              متابعة مبيعات التجار، نسبة عمولة المنصة ({Math.round(settings.commissionRate * 100)}%)، ومراقبة الجودة والتقييمات.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSeedCatalog}
            disabled={isSeeding}
            className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-200 border border-emerald-600 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>تغذية المنتجات والتقييمات</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
          >
            الخروج من الإدارة
          </button>
        </div>
      </div>

      {seedSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <span>تمت تغذية كتالوج المنتجات والتقييمات التونسية في Cloud Firestore بنجاح!</span>
        </div>
      )}

      {/* High-Level Financial Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>حجم المبيعات الإجمالي</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-black text-stone-900 font-['Cairo']">
            {totalGrossSales.toFixed(3).replace(/\.?0+$/, '')} <span className="text-xs font-bold text-emerald-800">د.ت</span>
          </p>
          <p className="text-[11px] text-stone-400">إجمالي قيمة كل الطلبات</p>
        </div>

        {/* Platform Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-1 bg-gradient-to-br from-amber-50/50 to-white">
          <div className="flex items-center justify-between text-amber-900 text-xs font-bold">
            <span>أرباح المنصة التقديرية</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-800 font-['Cairo']">
            {platformEstimatedRevenue.toFixed(3).replace(/\.?0+$/, '')} <span className="text-xs font-bold">د.ت</span>
          </p>
          <p className="text-[11px] text-amber-700">
            بناءً على نسبة عمولة {Math.round(settings.commissionRate * 100)}%
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>إجمالي الطلبات</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-stone-900 font-['Cairo']">
            {totalOrdersCount} <span className="text-xs font-bold text-stone-500">طلب</span>
          </p>
          <p className="text-[11px] text-stone-400">
            معدل قيمة الطلب: {avgOrderValue.toFixed(3).replace(/\.?0+$/, '')} د.ت
          </p>
        </div>

        {/* Reviews Metric */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>تقييمات الحرفاء</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <p className="text-2xl font-black text-stone-900 font-['Cairo']">
            {reviews.length} <span className="text-xs font-bold text-stone-500">تقييم</span>
          </p>
          <p className="text-[11px] text-stone-400">
            متوسط رضا الزبائن: {reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '4.9'} / 5
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#064e3b] text-amber-300 shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          نظرة عامة والعمولة
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'orders'
              ? 'bg-[#064e3b] text-amber-300 shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          إدارة الطلبات ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'products'
              ? 'bg-[#064e3b] text-amber-300 shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          إدارة المنتجات ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'vendors'
              ? 'bg-[#064e3b] text-amber-300 shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          البائعون والمتاجر ({vendorsList.length})
        </button>

        {/* Review Moderation Tab */}
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'reviews'
              ? 'bg-[#064e3b] text-amber-300 shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>مراجعة وتقييمات الحرفاء ({reviews.length})</span>
        </button>
      </div>

      {/* TAB 1: Overview & Commission Control */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commission Config Box */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-stone-900 border-b border-stone-100 pb-3">
              <Percent className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-base">تحديد نسبة عمولة منصة سوقنا</h3>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              المطلوب: تحديد نسبة العمولة مبدئياً بـ <strong>10%</strong>. يمكنك تعديل النسبة هنا وستحفظ مباشرة في قاعدة بيانات Cloud Firestore ويتم تطبيقها على كل الطلبات الجديدة.
            </p>

            {commissionSavedMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تم تحديث نسبة العمولة بنجاح وحفظها في قاعدة البيانات!</span>
              </div>
            )}

            <form onSubmit={handleSaveCommission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  نسبة العمولة المئوية (%)
                </label>
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(Number(e.target.value))}
                    className="w-28 px-3 py-2 border border-stone-300 rounded-xl text-sm font-bold text-center focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                  <span className="text-sm font-bold text-stone-600">%</span>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs shadow-md transition-colors"
                  >
                    حفظ النسبة
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  النسبة المعتمدة حالياً: {Math.round(settings.commissionRate * 100)}% (يحصل التاجر على {100 - Math.round(settings.commissionRate * 100)}% من سعر المنتج).
                </p>
              </div>
            </form>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
              <span className="font-bold text-stone-800">مثال توضيحي للعملية:</span>
              <p className="text-stone-600 text-[11px]">
                إذا اشترى حريف منتجاً بقيمة 100 دينار تونسي، تكون عمولة المنصة 10 دنانير، ويحوّل للبائع 90 ديناراً بعد تحصيل ثمن الطلب نقداً عند الاستلام.
              </p>
            </div>
          </div>

          {/* Quick Platform Security & Verification Notice */}
          <div className="bg-[#fcfaf6] rounded-3xl p-6 border border-amber-200/80 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-950 border-b border-amber-200/60 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-base">حالة قاعدة البيانات وسياسات الأمان</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200">
                <span className="font-medium text-stone-700">قاعدة البيانات:</span>
                <span className="font-bold text-emerald-700">Cloud Firestore (متصلة ومفعلة)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200">
                <span className="font-medium text-stone-700">نظام تقييم المنتجات:</span>
                <span className="font-bold text-emerald-700">1 إلى 5 نجوم مع مراجعة الإدارة</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200">
                <span className="font-medium text-stone-700">نظام الدفع:</span>
                <span className="font-bold text-amber-800">الدفع عند الاستلام (COD) الحقيقي</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200">
                <span className="font-medium text-stone-700">حساب مالك المنصة:</span>
                <span className="font-bold text-stone-900 font-mono text-[11px]">lamia1990ben@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Orders Management */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-stone-900">سجل طلبات المنصة كاملة</h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                {filteredOrders.length} طلب
              </span>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
                {['all', 'new', 'processing', 'shipped', 'delivered'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      orderFilter === st
                        ? 'bg-emerald-800 text-amber-300 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {st === 'all'
                      ? 'الكل'
                      : st === 'new'
                      ? 'جديد'
                      : st === 'processing'
                      ? 'قيد التجهيز'
                      : st === 'shipped'
                      ? 'تم الشحن'
                      : 'تم التسليم'}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="بحث برقم الطلب، الحريف، الولاية..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-3 py-1.5 border border-stone-200 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <Package className="w-10 h-10 mx-auto" />
              <p className="text-xs font-semibold">لا توجد طلبات تطابق هذا التصفية</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredOrders.map((ord) => (
                <div key={ord.id} className="py-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-emerald-900">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs text-stone-500">
                        • ولاية {ord.governorate} ({ord.customerName})
                      </span>
                      <a
                        href={`tel:${ord.customerPhone}`}
                        className="text-xs font-bold text-emerald-800 dir-ltr hover:underline"
                      >
                        {ord.customerPhone}
                      </a>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-stone-900 font-['Cairo']">
                        المبلغ: {ord.totalAmount.toFixed(3).replace(/\.?0+$/, '')} د.ت
                      </span>

                      {/* Status changer */}
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value as OrderStatus)}
                        className="text-xs bg-stone-100 border border-stone-300 rounded-lg px-2 py-1 focus:outline-none font-semibold cursor-pointer"
                      >
                        <option value="new">جديد</option>
                        <option value="processing">قيد التجهيز</option>
                        <option value="shipped">تم الشحن</option>
                        <option value="delivered">تم التسليم</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="bg-stone-50 p-2.5 rounded-xl text-xs text-stone-600 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-stone-800">السلع:</span>
                      {ord.items.map((it, i) => (
                        <span key={i} className="bg-white px-2 py-0.5 rounded border border-stone-200 text-[11px]">
                          {it.title} (×{it.quantity}) - {it.vendorName}
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] font-semibold text-emerald-800">
                      عمولة المنصة: {(ord.platformCommissionAmount || ord.subtotal * 0.10).toFixed(3).replace(/\.?0+$/, '')} د.ت
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Products Management */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-base text-stone-900">
              جميع المنتجات المعروضة في المنصة ({products.length})
            </h3>
            <span className="text-xs text-stone-500">
              يمكنك تمييز المنتجات في الصفحة الرئيسية أو حذف المنتجات المخالفة
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {products.map((prod) => (
              <div key={prod.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900">{prod.title}</h4>
                    <p className="text-[11px] text-stone-500 flex items-center gap-2">
                      <span>البائع: {prod.vendorName}</span>
                      <span>•</span>
                      <span>ولاية {prod.governorate}</span>
                      <span>•</span>
                      <span>المخزون: {prod.stock}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {prod.rating || 5.0}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-black text-sm text-emerald-900 font-['Cairo']">
                    {prod.price.toFixed(3).replace(/\.?0+$/, '')} د.ت
                  </span>

                  {/* Feature toggle */}
                  <button
                    onClick={() => handleToggleFeatured(prod)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      prod.featured
                        ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${prod.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                    <span>{prod.featured ? 'مميز' : 'تمييز'}</span>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                    title="حذف المنتج"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Vendors List */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 space-y-4 shadow-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-bold text-base text-stone-900">
              سجل التجار والحرفيين المسجلين ({vendorsList.length})
            </h3>
            <p className="text-xs text-stone-500">
              قائمة البائعين المعتمدين في ولايات الجمهورية التونسية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorsList.map((ven, idx) => (
              <div
                key={idx}
                className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900">{ven.vendorName}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    نشط ومعتمد
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  الولاية: ولاية {ven.governorate || 'تونس'}
                </p>
                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs font-semibold text-emerald-900">
                  <span>المنتجات المعروضة:</span>
                  <span>{ven.productCount} منتج</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Customer Reviews Moderation (User Requirement) */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                <span>إدارة ومراجعة تقييمات الحرفاء ({filteredReviews.length})</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                يمكن للمسؤول مراجعة التعليقات المكتوبة، قبول التقييمات، أو حجب التعليقات غير اللائقة وحذفها.
              </p>
            </div>

            {/* Filter by status */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  reviewFilter === 'all' ? 'bg-[#064e3b] text-amber-300' : 'text-stone-600'
                }`}
              >
                كل التقييمات ({reviews.length})
              </button>
              <button
                onClick={() => setReviewFilter('approved')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  reviewFilter === 'approved' ? 'bg-[#064e3b] text-amber-300' : 'text-stone-600'
                }`}
              >
                المعتمدة ({reviews.filter((r) => r.status === 'approved').length})
              </button>
              <button
                onClick={() => setReviewFilter('rejected')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  reviewFilter === 'rejected' ? 'bg-[#064e3b] text-amber-300' : 'text-stone-600'
                }`}
              >
                المحجوبة ({reviews.filter((r) => r.status === 'rejected').length})
              </button>
            </div>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto" />
              <p className="text-xs font-semibold">لا توجد تقييمات مطابقة لهذا الفلتر</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredReviews.map((rev) => (
                <div key={rev.id} className="py-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-stone-900">
                        {rev.userName}
                      </span>
                      {rev.userGov && (
                        <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
                          ولاية {rev.userGov}
                        </span>
                      )}
                      <span className="text-xs text-stone-400">
                        • {new Date(rev.createdAt).toLocaleDateString('ar-TN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Star Display */}
                      <div className="flex items-center gap-0.5 dir-ltr">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rev.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rev.status === 'approved' ? 'معتمد ومعروض' : 'محجوب من العرض'}
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80 text-xs text-stone-800">
                    <p className="leading-relaxed">"{rev.comment}"</p>
                  </div>

                  {/* Moderation Controls */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-stone-400 text-[11px]">
                      معرف المنتج: {rev.productId}
                    </span>

                    <div className="flex items-center gap-2">
                      {rev.status !== 'approved' ? (
                        <button
                          onClick={() => handleModerateReview(rev.id, 'approved')}
                          className="px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>اعتماد ونشر التقييم</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModerateReview(rev.id, 'rejected')}
                          className="px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>حجب التقييم</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1 rounded-lg text-stone-400 hover:text-red-600 transition-colors"
                        title="حذف نهائي"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
