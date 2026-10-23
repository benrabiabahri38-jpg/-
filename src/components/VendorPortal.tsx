import React, { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  Package,
  TrendingUp,
  Coins,
  Edit,
  Trash2,
  Image as ImageIcon,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle,
  Truck,
  Upload,
  X,
  Search,
} from 'lucide-react';
import { Product, Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { TUNISIAN_GOVERNORATES, CATEGORIES } from '../data/tunisiaData';
import { createProduct, updateProduct, deleteProduct } from '../services/productService';
import { fetchOrdersByVendor, updateOrderStatus } from '../services/orderService';

interface VendorPortalProps {
  products: Product[];
  onRefreshProducts: () => Promise<void>;
  onClose: () => void;
}

export const VendorPortal: React.FC<VendorPortalProps> = ({
  products,
  onRefreshProducts,
  onClose,
}) => {
  const { profile, currentUser, updateVendorShop } = useAuth();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  const [vendorOrders, setVendorOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Shop Settings State
  const [shopName, setShopName] = useState(profile?.shopName || 'متجر الحرف والخيرات التونسية');
  const [shopDesc, setShopDesc] = useState(profile?.shopDescription || 'متجر متخصص في بيع السلع والمنتجات التونسية الأصيلة مباشرة من الحرفيين.');
  const [shopGov, setShopGov] = useState(profile?.governorate || 'تونس');
  const [shopPhone, setShopPhone] = useState(profile?.phone || '+216 98 000 000');
  const [shopSavedMsg, setShopSavedMsg] = useState(false);

  // New Product Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formComparePrice, setFormComparePrice] = useState<number | ''>('');
  const [formCategory, setFormCategory] = useState('crafts');
  const [formGov, setFormGov] = useState(profile?.governorate || 'تونس');
  const [formStock, setFormStock] = useState<number>(10);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImageFiles, setFormImageFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const vendorId = currentUser?.uid || profile?.uid || 'vendor_default';

  // Filter products belonging to this vendor
  // In demo mode, if the user has created products or all products
  const myProducts = products.filter(
    (p) => p.vendorId === vendorId || p.vendorId.startsWith('vendor_') || p.vendorName === profile?.shopName
  );

  const loadVendorOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const orders = await fetchOrdersByVendor(vendorId);
      setVendorOrders(orders);
    } catch (err) {
      console.error('Failed to load vendor orders', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadVendorOrders();
  }, [vendorId]);

  // Handle local image file upload (converts to base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormImageFiles((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDesc('');
    setFormPrice('');
    setFormComparePrice('');
    setFormCategory('crafts');
    setFormGov(profile?.governorate || 'تونس');
    setFormStock(10);
    setFormImageUrl('');
    setFormImageFiles([]);
    setEditingProduct(null);
    setErrorMsg('');
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormTitle(prod.title);
    setFormDesc(prod.description);
    setFormPrice(prod.price);
    setFormComparePrice(prod.comparePrice || '');
    setFormCategory(prod.category);
    setFormGov(prod.governorate);
    setFormStock(prod.stock);
    setFormImageUrl(prod.images[0] || '');
    setFormImageFiles(prod.images.slice(1) || []);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formTitle.trim()) {
      setErrorMsg('يرجى إدخال عنوان المنتج.');
      return;
    }

    if (!formPrice || Number(formPrice) <= 0) {
      setErrorMsg('يرجى تحديد سعر صالح بالدينار التونسي.');
      return;
    }

    const allImages = [
      ...(formImageUrl ? [formImageUrl.trim()] : []),
      ...formImageFiles,
    ];

    if (allImages.length === 0) {
      allImages.push('https://images.unsplash.com/photo-1546749839-2a9a7b5790c9?auto=format&fit=crop&w=800&q=80');
    }

    setIsSubmitting(true);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          title: formTitle.trim(),
          description: formDesc.trim(),
          price: Number(formPrice),
          comparePrice: formComparePrice ? Number(formComparePrice) : undefined,
          category: formCategory,
          governorate: formGov,
          stock: Number(formStock),
          images: allImages,
        });
      } else {
        await createProduct({
          title: formTitle.trim(),
          description: formDesc.trim(),
          price: Number(formPrice),
          comparePrice: formComparePrice ? Number(formComparePrice) : undefined,
          category: formCategory,
          governorate: formGov,
          stock: Number(formStock),
          images: allImages,
          vendorId,
          vendorName: profile?.shopName || 'تاجر سوقنا',
          vendorPhone: profile?.phone || '',
          status: 'active',
          featured: false,
          rating: 5.0,
          reviewCount: 1,
        });
      }

      await onRefreshProducts();
      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error saving product', err);
      setErrorMsg('فشل حفظ المنتج، يرجى التحقق من المدخلات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (prodId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج من متجرك في سوقنا؟')) {
      try {
        await deleteProduct(prodId);
        await onRefreshProducts();
      } catch (err) {
        alert('حدث خطأ أثناء حذف المنتج');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      const targetOrder = vendorOrders.find((o) => o.id === orderId);
      if (targetOrder) {
        const { notifyBuyerOrderStatus } = await import('../services/notificationService');
        await notifyBuyerOrderStatus(
          targetOrder.customerId || 'guest_buyer',
          targetOrder.orderNumber,
          newStatus
        );
      }
      await loadVendorOrders();
    } catch (err) {
      alert('فشل تحديث حالة الطلب');
    }
  };

  const handleSaveShopInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateVendorShop(shopName, shopDesc, shopGov, shopPhone);
    setShopSavedMsg(true);

    try {
      const { notifyAdminNewSeller } = await import('../services/notificationService');
      await notifyAdminNewSeller(vendorId, shopName, shopGov, shopPhone);
    } catch (notifErr) {
      console.warn('Seller registration notification error:', notifErr);
    }

    setTimeout(() => setShopSavedMsg(false), 2500);
  };

  // Calculations for vendor sales and commission
  const totalGrossSales = vendorOrders.reduce((sum, order) => {
    const myItems = order.items.filter((i) => i.vendorId === vendorId);
    return sum + myItems.reduce((isum, item) => isum + item.price * item.quantity, 0);
  }, 0);

  const platformFee = Number((totalGrossSales * 0.10).toFixed(3)); // 10% platform commission
  const netVendorPayout = Number((totalGrossSales - platformFee).toFixed(3));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-right">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#064e3b] via-[#053d2e] to-[#042d22] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold shadow-lg shrink-0">
            <Store className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black font-['Cairo']">
                {profile?.shopName || 'فضاء البائع في سوقنا'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-amber-300 text-xs font-bold border border-emerald-500">
                بائع معتمد
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>ولاية {profile?.governorate || 'تونس'}</span>
              <span>•</span>
              <span>نسبة عمولة سوقنا: 10% فقط</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
          >
            العودة للمتجر
          </button>
        </div>
      </div>

      {/* Financial & Performance Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>إجمالي المبيعات</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-black text-stone-900 font-['Cairo']">
            {totalGrossSales.toFixed(3).replace(/\.?0+$/, '')} <span className="text-xs font-bold text-emerald-800">د.ت</span>
          </p>
          <p className="text-[11px] text-stone-400">إجمالي قيمة طلبات متجرك</p>
        </div>

        {/* Commission (10%) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>عمولة المنصة (10%)</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 font-['Cairo']">
            {platformFee.toFixed(3).replace(/\.?0+$/, '')} <span className="text-xs font-bold">د.ت</span>
          </p>
          <p className="text-[11px] text-stone-400">حصة منصة سوقنا للتسويق</p>
        </div>

        {/* Net Payout */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>صافي أرباح البائع</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-800 font-['Cairo']">
            {netVendorPayout.toFixed(3).replace(/\.?0+$/, '')} <span className="text-xs font-bold">د.ت</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">المستحق للدفع للبائع (90%)</p>
        </div>

        {/* Listed Products */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>المنتجات المعروضة</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-stone-900 font-['Cairo']">
            {myProducts.length} <span className="text-xs font-bold text-stone-500">منتج</span>
          </p>
          <p className="text-[11px] text-stone-400">في قائمة منتجاتك</p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-[#064e3b] text-amber-300 shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>منتجاتي المعروضة ({myProducts.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('orders');
            loadVendorOrders();
          }}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-[#064e3b] text-amber-300 shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>الطلبات الواردة للمتجر ({vendorOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-[#064e3b] text-amber-300 shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>بيانات المتجر والولاية</span>
        </button>
      </div>

      {/* Tab 1: Products Management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm">قائمة المنتجات في متجرك:</h3>
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="text-xs text-emerald-800 font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة منتج آخر</span>
            </button>
          </div>

          {myProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-stone-800">لم تضف أي منتج بعد في متجرك</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                ابدأ بإضافة منتجاتك وصناعاتك التونسية مع تحديد السعر والولاية والكمية المتاحة لتظهر لجميع زوار سوقنا.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs shadow-md"
              >
                إضافة أول منتج الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-4 flex gap-3">
                    <img
                      src={prod.images[0] || 'https://images.unsplash.com/photo-1546749839-2a9a7b5790c9?auto=format&fit=crop&w=800&q=80'}
                      alt={prod.title}
                      className="w-20 h-20 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-50"
                    />

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span className="bg-stone-100 px-2 py-0.5 rounded font-medium">
                          ولاية {prod.governorate}
                        </span>
                        <span className="text-emerald-700 font-bold">
                          المخزون: {prod.stock} قطعة
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-stone-900 line-clamp-2 leading-snug">
                        {prod.title}
                      </h4>
                      <p className="text-sm font-black text-emerald-900 font-['Cairo']">
                        {prod.price.toFixed(3).replace(/\.?0+$/, '')} د.ت
                      </p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="bg-stone-50 px-4 py-2.5 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">
                      التصنيف: {prod.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-1 rounded-lg text-stone-400 hover:text-red-600 transition-colors"
                        title="حذف المنتج"
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

      {/* Tab 2: Vendor Incoming Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm">طلبات الشراء الواردة لمتجرك:</h3>
            <span className="text-xs text-stone-500">الدفع نقداً عند استلام الحريف للطرد</span>
          </div>

          {vendorOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-2">
              <Truck className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="font-bold text-stone-700">لا توجد طلبات جديدة لمتجرك حالياً</h4>
              <p className="text-xs text-stone-500">
                عند قيام أي حريف بإتمام طلب شراء يحتوي على منتجاتك، ستظهر تفاصيل الشحن والاتصال هنا فوراً.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vendorOrders.map((order) => {
                const myItems = order.items.filter((i) => i.vendorId === vendorId);
                const orderSubtotal = myItems.reduce((s, i) => s + i.price * i.quantity, 0);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black font-mono text-emerald-900">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              order.orderStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.orderStatus === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : order.orderStatus === 'processing'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {order.orderStatus === 'delivered'
                              ? 'تم التوصيل بنجاح'
                              : order.orderStatus === 'shipped'
                              ? 'في الطريق مع الموصّل'
                              : order.orderStatus === 'processing'
                              ? 'قيد التجهيز والتغليف'
                              : 'طلب جديد'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-TN')}
                        </p>
                      </div>

                      {/* Status Update Control */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-600 font-semibold">تحديث الحالة:</span>
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className="text-xs bg-stone-100 border border-stone-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                        >
                          <option value="new">طلب جديد</option>
                          <option value="processing">قيد التجهيز</option>
                          <option value="shipped">تم الشحن مع شركة التوصيل</option>
                          <option value="delivered">تم التسليم وقبض المبلغ</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-stone-500 block">اسم الحريف:</span>
                        <span className="font-bold text-stone-900">{order.customerName}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block">الهاتف الجوال:</span>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="font-bold text-emerald-800 dir-ltr inline-block hover:underline"
                        >
                          {order.customerPhone}
                        </a>
                      </div>
                      <div>
                        <span className="text-stone-500 block">عنوان الشحن:</span>
                        <span className="font-bold text-stone-900">
                          ولاية {order.governorate} - {order.shippingAddress}
                        </span>
                      </div>
                    </div>

                    {/* Items from this vendor */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-stone-700">السلع المطلوبة من متجرك:</p>
                      <div className="divide-y divide-stone-100">
                        {myItems.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-bold text-stone-900">{item.title}</p>
                                <p className="text-stone-500 text-[11px]">
                                  الكمية: {item.quantity} × {item.price.toFixed(3).replace(/\.?0+$/, '')} د.ت
                                </p>
                              </div>
                            </div>
                            <span className="font-black text-emerald-900">
                              {(item.price * item.quantity).toFixed(3).replace(/\.?0+$/, '')} د.ت
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total for vendor */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-stone-500">
                        مجموع منتجاتك: {orderSubtotal.toFixed(3).replace(/\.?0+$/, '')} د.ت | عمولة سوقنا 10%: {(orderSubtotal * 0.10).toFixed(3).replace(/\.?0+$/, '')} د.ت
                      </span>
                      <span className="text-sm font-black text-emerald-800">
                        صافي المتجر: {(orderSubtotal * 0.90).toFixed(3).replace(/\.?0+$/, '')} د.ت
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Shop Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 max-w-2xl space-y-5">
          <div className="border-b border-stone-200 pb-3">
            <h3 className="font-bold text-lg text-stone-900">إعدادات وبيانات متجرك في سوقنا</h3>
            <p className="text-xs text-stone-500">
              تظهر هذه البيانات للحرفاء عند زيارة بطاقة منتجاتك أو التواصل معك.
            </p>
          </div>

          {shopSavedMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>تم حفظ بيانات المتجر بنجاح!</span>
            </div>
          )}

          <form onSubmit={handleSaveShopInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">اسم المتجر *</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                نبذة عن المتجر والحرفة *
              </label>
              <textarea
                rows={3}
                required
                value={shopDesc}
                onChange={(e) => setShopDesc(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">الولاية *</label>
                <select
                  value={shopGov}
                  onChange={(e) => setShopGov(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white"
                >
                  {TUNISIAN_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      ولاية {gov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  رقم الهاتف للاتصال والطلبات *
                </label>
                <input
                  type="text"
                  required
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none dir-ltr text-right"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs shadow-md transition-colors"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add or Edit Product */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-stone-200 text-right">
            {/* Modal Header */}
            <div className="bg-[#064e3b] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base font-['Cairo']">
                  {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد لمتجرك في سوقنا'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="p-1 rounded-lg text-stone-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  عنوان المنتج *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فخار نابل يدوي الصنع، شاشية صوف مهدية..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  وصف المنتج ومميزاته *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="صف خامات المنتج، طريقة الصنع، المقاسات، والفوائد..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    السعر بالدينار التونسي (د.ت) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    required
                    placeholder="مثال: 45.0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    السعر الأصلي قبل التخفيض (اختياري)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    placeholder="مثال: 55.0 (سيظهر كشارة تخفيض)"
                    value={formComparePrice}
                    onChange={(e) =>
                      setFormComparePrice(e.target.value ? Number(e.target.value) : '')
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none dir-ltr text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">التصنيف *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">الولاية *</label>
                  <select
                    value={formGov}
                    onChange={(e) => setFormGov(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white cursor-pointer"
                  >
                    {TUNISIAN_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        ولاية {gov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    الكمية المتوفرة بالمخزون *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Images (URL and File Upload) */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <label className="block text-xs font-bold text-stone-700">
                  صور المنتج (رابط صورة أو رفع من الجهاز) *
                </label>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="ضع رابط صورة من الإنترنت (https://...)"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none dir-ltr text-right"
                  />
                </div>

                {/* File picker */}
                <div className="flex items-center gap-2">
                  <label className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors border border-stone-300">
                    <Upload className="w-4 h-4 text-emerald-800" />
                    <span>رفع صورة من الهاتف أو الحاسوب</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-stone-400">يدعم PNG, JPG, WEBP</span>
                </div>

                {/* Previews */}
                {(formImageUrl || formImageFiles.length > 0) && (
                  <div className="flex gap-2 pt-2 overflow-x-auto">
                    {formImageUrl && (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-700 shrink-0">
                        <img src={formImageUrl} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-emerald-900/80 text-[9px] text-white text-center">
                          رئيسية
                        </span>
                      </div>
                    )}
                    {formImageFiles.map((f, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200 shrink-0">
                        <img src={f} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormImageFiles((files) => files.filter((_, idx) => idx !== i))}
                          className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Commission reminder */}
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 text-[11px] text-amber-900">
                تذكير: تحتسب منصة «سوقنا» عمولة تنافسية ثابتة بنسبة <strong>10%</strong> من قيمة المبيعات لتغطية التسويق واستقطاب الحرفاء.
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#053d2e] text-amber-300 font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'جارٍ الحفظ...' : editingProduct ? 'تحديث المنتج' : 'نشر المنتج في سوقنا'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
