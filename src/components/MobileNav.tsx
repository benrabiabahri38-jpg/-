import React from 'react';
import { Home, Grid, ShoppingBag, Store, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface MobileNavProps {
  activeView: 'home' | 'vendor' | 'admin' | 'my-orders';
  setActiveView: (view: 'home' | 'vendor' | 'admin' | 'my-orders') => void;
  onOpenCategories: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeView,
  setActiveView,
  onOpenCategories,
}) => {
  const { itemCount, setIsCartOpen } = useCart();
  const { isVendor } = useAuth();

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 z-40 py-1.5 px-3 shadow-2xl flex items-center justify-around text-[10px] font-bold text-stone-600 font-['Cairo']">
      <button
        onClick={() => setActiveView('home')}
        className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
          activeView === 'home' ? 'text-emerald-800 font-extrabold' : 'text-stone-500'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>الرئيسية</span>
      </button>

      <button
        onClick={onOpenCategories}
        className="flex flex-col items-center gap-0.5 p-1 text-stone-500 hover:text-emerald-800 transition-colors"
      >
        <Grid className="w-5 h-5" />
        <span>التصنيفات</span>
      </button>

      {/* Cart button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center gap-0.5 p-1 text-stone-800"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-amber-500" />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
        <span>السلة</span>
      </button>

      {/* Vendor button */}
      <button
        onClick={() => setActiveView(activeView === 'vendor' ? 'home' : 'vendor')}
        className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
          activeView === 'vendor' ? 'text-emerald-800 font-extrabold' : 'text-stone-500'
        }`}
      >
        <Store className="w-5 h-5" />
        <span>فضاء البائع</span>
      </button>

      {/* Orders button */}
      <button
        onClick={() => setActiveView(activeView === 'my-orders' ? 'home' : 'my-orders')}
        className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
          activeView === 'my-orders' ? 'text-emerald-800 font-extrabold' : 'text-stone-500'
        }`}
      >
        <Package className="w-5 h-5" />
        <span>طلباتي</span>
      </button>
    </div>
  );
};
