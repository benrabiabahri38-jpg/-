import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Filter,
  X,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  ShoppingBag,
  Store,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { VendorPortal } from './components/VendorPortal';
import { AdminPortal } from './components/AdminPortal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { Product, Order } from './types';
import { fetchAllProducts } from './services/productService';
import { TUNISIAN_GOVERNORATES } from './data/tunisiaData';
import { testConnection } from './firebase/config';

function MarketplaceContent() {
  const { role, isVendor, isAdmin } = useAuth();

  // Navigation & Views
  const [activeView, setActiveView] = useState<'home' | 'vendor' | 'admin' | 'my-orders'>('home');

  // Products Data
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGov, setSelectedGov] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'latest' | 'price-asc' | 'price-desc' | 'rating'>('latest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const categoriesRef = useRef<HTMLDivElement>(null);

  // Load products from Firestore
  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const data = await fetchAllProducts();
      setProducts(data);
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    // Validate Firestore connection on boot
    testConnection();
    loadProducts();
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchVendor = p.vendorName.toLowerCase().includes(q);
          const matchGov = p.governorate.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchVendor && !matchGov) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // Governorate filter
        if (selectedGov && p.governorate !== selectedGov) {
          return false;
        }

        // Price range
        if (minPrice !== '' && p.price < Number(minPrice)) return false;
        if (maxPrice !== '' && p.price > Number(maxPrice)) return false;

        // Stock filter
        if (inStockOnly && p.stock <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, searchQuery, selectedCategory, selectedGov, minPrice, maxPrice, sortBy, inStockOnly]);

  // Featured products for carousel
  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.featured || (p.rating && p.rating >= 4.9)).slice(0, 4);
  }, [products]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedGov('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('latest');
    setInStockOnly(false);
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategory !== 'all' ||
    Boolean(selectedGov) ||
    minPrice !== '' ||
    maxPrice !== '' ||
    inStockOnly;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col font-['Cairo',sans-serif]">
      {/* Global Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedGov={selectedGov}
        setSelectedGov={setSelectedGov}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: Vendor Portal */}
        {activeView === 'vendor' ? (
          <VendorPortal
            products={products}
            onRefreshProducts={loadProducts}
            onClose={() => setActiveView('home')}
          />
        ) : activeView === 'admin' ? (
          /* VIEW 2: Platform Admin Portal */
          <AdminPortal
            products={products}
            onRefreshProducts={loadProducts}
            onClose={() => setActiveView('home')}
          />
        ) : (
          /* VIEW 3: Main Marketplace Homepage */
          <div className="space-y-6">
            {/* Hero Banner (Only on clean homepage) */}
            {!hasActiveFilters && (
              <HeroBanner
                onExplore={() => {
                  categoriesRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                onJoinVendor={() => {
                  setActiveView('vendor');
                }}
              />
            )}

            {/* Category Selector Bar */}
            <div ref={categoriesRef}>
              <CategoryBar
                selectedCategory={selectedCategory}
                onSelectCategory={(catId) => setSelectedCategory(catId)}
              />
            </div>

            {/* Filter and Control Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-right">
                {/* Right: Results Count & Active Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-stone-900">
                    تم العثور على{' '}
                    <span className="text-emerald-800 font-black">{filteredProducts.length}</span>{' '}
                    منتج تونسي
                  </span>

                  {selectedGov && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      <MapPin className="w-3 h-3 text-emerald-700" />
                      ولاية {selectedGov}
                      <button
                        onClick={() => setSelectedGov('')}
                        className="hover:text-red-600 mr-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                      التصنيف: {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="hover:text-red-600 mr-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {hasActiveFilters && (
                    <button
                      onClick={resetAllFilters}
                      className="text-[11px] text-red-600 hover:text-red-700 font-bold underline"
                    >
                      إعادة ضبط الفلاتر
                    </button>
                  )}
                </div>

                {/* Left: Sorting & Quick Filters */}
                <div className="flex items-center gap-3">
                  {/* Governorate Selector */}
                  <div className="hidden sm:flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-700">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <select
                      value={selectedGov}
                      onChange={(e) => setSelectedGov(e.target.value)}
                      className="bg-transparent font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="">تصفية حسب الولاية (الكل)</option>
                      {TUNISIAN_GOVERNORATES.map((g) => (
                        <option key={g} value={g}>
                          ولاية {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stock Toggle */}
                  <label className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-stone-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-700 w-4 h-4"
                    />
                    <span>المتوفر بالمخزون فقط</span>
                  </label>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-700">
                    <span className="text-stone-400 font-medium">الترتيب:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent font-bold text-stone-800 focus:outline-none cursor-pointer"
                    >
                      <option value="latest">الأحدث إضافة</option>
                      <option value="price-asc">الأقل سعراً</option>
                      <option value="price-desc">الأعلى سعراً</option>
                      <option value="rating">الأعلى تقييماً</option>
                    </select>
                  </div>

                  {/* Mobile Filters Drawer Trigger */}
                  <button
                    onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                    className="sm:hidden p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800"
                    title="خيارات الفلترة"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile Filter Drawer */}
              {isFilterDrawerOpen && (
                <div className="sm:hidden mt-2 p-4 bg-white rounded-2xl border border-stone-200 shadow-lg space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold border-b border-stone-100 pb-2">
                    <span>خيارات الفلترة المتقدمة</span>
                    <button
                      onClick={() => setIsFilterDrawerOpen(false)}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">تصفية حسب الولاية:</label>
                    <select
                      value={selectedGov}
                      onChange={(e) => setSelectedGov(e.target.value)}
                      className="w-full p-2 border border-stone-200 rounded-xl text-xs bg-white"
                    >
                      <option value="">كل الولايات (24)</option>
                      {TUNISIAN_GOVERNORATES.map((g) => (
                        <option key={g} value={g}>
                          ولاية {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold mb-1">أدنى سعر (د.ت):</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full p-2 border border-stone-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">أقصى سعر (د.ت):</label>
                      <input
                        type="number"
                        placeholder="500"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full p-2 border border-stone-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded border-stone-300 text-emerald-700"
                    />
                    <span>المتوفر بالمخزون فقط</span>
                  </label>
                </div>
              )}
            </div>

            {/* Featured Products Section (Shown when no specific filter is active) */}
            {!hasActiveFilters && featuredProducts.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg sm:text-xl font-black text-stone-900 font-['Cairo']">
                      مختارات سوقنا المميزة لهذا الأسبوع
                    </h2>
                  </div>
                  <span className="text-xs text-stone-500 hidden sm:inline">
                    جودة عالية معتمدة وتوصيل لكافة الولايات
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredProducts.map((product) => (
                    <ProductCard
                      key={`feat_${product.id}`}
                      product={product}
                      onOpenDetails={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Products Catalog Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-black text-stone-900 font-['Cairo']">
                  {hasActiveFilters ? 'نتائج البحث والتصفية' : 'كافة المنتجات المتاحة في سوقنا'}
                </h2>
                <button
                  onClick={loadProducts}
                  className="text-xs text-emerald-800 font-semibold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProducts ? 'animate-spin' : ''}`} />
                  <span>تحديث المعروض</span>
                </button>
              </div>

              {isLoadingProducts ? (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-800 mx-auto" />
                  <p className="text-xs text-stone-500 font-medium">
                    جارٍ تحميل المنتجات من قاعدة بيانات سوقنا...
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4 max-w-lg mx-auto shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-800 text-base">لا توجد منتجات تطابق بحثك</h3>
                    <p className="text-xs text-stone-500">
                      جرب تغيير الكلمات المفتاحية، اختيار ولاية أخرى، أو إعادة ضبط الفلاتر.
                    </p>
                  </div>
                  <button
                    onClick={resetAllFilters}
                    className="px-6 py-2.5 rounded-xl bg-emerald-800 text-amber-300 font-bold text-xs shadow-md"
                  >
                    عرض جميع المنتجات التونسية
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetails={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Global Modals & Drawers */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onProductUpdated={loadProducts}
      />

      <CartDrawer
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => setRecentOrder(order)}
      />

      <OrderSuccessModal
        order={recentOrder}
        onClose={() => setRecentOrder(null)}
        onViewOrders={() => {
          setRecentOrder(null);
          setActiveView('my-orders');
        }}
      />

      <MyOrdersModal
        isOpen={activeView === 'my-orders'}
        onClose={() => setActiveView('home')}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Global Footer */}
      <Footer
        onSelectGov={(gov) => {
          setSelectedGov(gov);
          setActiveView('home');
        }}
        onOpenVendor={() => setActiveView('vendor')}
        onOpenAdmin={() => setActiveView('admin')}
      />

      {/* Floating Mobile Bottom Navigation */}
      <MobileNav
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenCategories={() => {
          setActiveView('home');
          categoriesRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MarketplaceContent />
      </CartProvider>
    </AuthProvider>
  );
}
