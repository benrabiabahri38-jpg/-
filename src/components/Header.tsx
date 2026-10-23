import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Store,
  ShieldCheck,
  User,
  LogOut,
  MapPin,
  Menu,
  X,
  Package,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { TUNISIAN_GOVERNORATES } from '../data/tunisiaData';
import { NotificationCenter } from './NotificationCenter';
import { UserRole } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedGov: string;
  setSelectedGov: (gov: string) => void;
  activeView: 'home' | 'vendor' | 'admin' | 'my-orders';
  setActiveView: (view: 'home' | 'vendor' | 'admin' | 'my-orders') => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedGov,
  setSelectedGov,
  activeView,
  setActiveView,
  onOpenAuth,
}) => {
  const { currentUser, profile, role, isAdmin, isVendor, signOut, setDemoRole } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    setDemoRole(newRole);
    setRoleMenuOpen(false);
    if (newRole === 'vendor') {
      setActiveView('vendor');
    } else if (newRole === 'admin') {
      setActiveView('admin');
    } else {
      setActiveView('home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#064e3b] text-white shadow-lg border-b border-[#053d2e]">
      {/* Top Bar for quick announcement & role test switcher */}
      <div className="bg-[#043d2e] px-4 py-1.5 text-xs text-amber-100 flex flex-wrap items-center justify-between border-b border-[#065f46]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            توصيل لجميع ولايات تونس الـ 24 | الدفع عند الاستلام
          </span>
          <span className="hidden md:inline text-emerald-300/60">|</span>
          <span className="hidden md:inline text-emerald-200">
            شحن مجاني للطلبات فوق 120 د.ت
          </span>
        </div>

        {/* Multi-role demo switcher */}
        <div className="flex items-center gap-2">
          <span className="text-stone-300 text-[11px] hidden sm:inline">نوع الحساب:</span>
          <div className="flex items-center bg-[#032e22] rounded-full p-0.5 border border-emerald-700/60">
            <button
              onClick={() => handleRoleChange('customer')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                role === 'customer'
                  ? 'bg-amber-400 text-stone-900 shadow-sm font-bold'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              حريف
            </button>
            <button
              onClick={() => handleRoleChange('vendor')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                role === 'vendor'
                  ? 'bg-amber-400 text-stone-900 shadow-sm font-bold'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              بائع
            </button>
            <button
              onClick={() => handleRoleChange('admin')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                role === 'admin'
                  ? 'bg-amber-400 text-stone-900 shadow-sm font-bold'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              إدارة
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveView('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-900 shadow-md group-hover:scale-105 transition-transform">
            <Store className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-white font-['Cairo']">سوقنا</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                TN
              </span>
            </div>
            <span className="text-[10px] text-emerald-200/90 font-medium -mt-1 tracking-wider">
              سوق تونس الإلكتروني
            </span>
          </div>
        </div>

        {/* Search Bar & Governorate Filter (Desktop) */}
        <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-4 bg-white rounded-xl shadow-inner overflow-hidden border-2 border-emerald-700/50 focus-within:border-amber-400 transition-all text-stone-800">
          {/* Governorate Dropdown */}
          <div className="flex items-center gap-1.5 px-3 bg-stone-100 border-l border-stone-200 text-stone-700 text-xs py-2 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <select
              value={selectedGov}
              onChange={(e) => setSelectedGov(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="">كل الولايات (24)</option>
              {TUNISIAN_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  ولاية {gov}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              placeholder="ابحث عن زيت زيتون، فخار نابل، شاشية، أواني، زرابي..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'home') setActiveView('home');
              }}
              className="w-full px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-stone-400 hover:text-stone-600 ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setActiveView('home')}
            className="bg-emerald-800 hover:bg-emerald-900 text-amber-300 px-4 py-2 flex items-center gap-1 text-sm font-semibold transition-colors shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>بحث</span>
          </button>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Switchers: Vendor Portal Button */}
          {isVendor && (
            <button
              onClick={() => setActiveView(activeView === 'vendor' ? 'home' : 'vendor')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeView === 'vendor'
                  ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-md'
                  : 'bg-emerald-800/80 text-amber-200 border-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>فضاء البائع</span>
            </button>
          )}

          {/* Admin Portal Button */}
          {isAdmin && (
            <button
              onClick={() => setActiveView(activeView === 'admin' ? 'home' : 'admin')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeView === 'admin'
                  ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-md'
                  : 'bg-emerald-800/80 text-amber-200 border-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة الإدارة</span>
            </button>
          )}

          {/* Customer Orders */}
          <button
            onClick={() => setActiveView(activeView === 'my-orders' ? 'home' : 'my-orders')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              activeView === 'my-orders'
                ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-md'
                : 'bg-emerald-800/60 text-white border-emerald-700/60 hover:bg-emerald-700'
            }`}
          >
            <Package className="w-4 h-4 text-amber-300" />
            <span>طلباتي</span>
          </button>

          {/* Real-Time Push Notification Center */}
          <NotificationCenter />

          {/* Cart Icon with Counter */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-amber-400 text-stone-950 hover:bg-amber-300 transition-all shadow-md active:scale-95 flex items-center justify-center"
            title="سلة المشتريات"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#064e3b] shadow-sm animate-bounce">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Account Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 p-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-600 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-900 font-bold flex items-center justify-center text-xs">
                  {profile?.displayName?.charAt(0) || 'U'}
                </div>
                <span className="hidden xl:inline text-xs font-semibold max-w-[100px] truncate">
                  {profile?.displayName}
                </span>
              </button>

              {roleMenuOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-white text-stone-800 rounded-xl shadow-2xl py-2 border border-stone-200 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs text-stone-500">مرحباً بك</p>
                    <p className="text-sm font-bold text-emerald-900 truncate">
                      {profile?.displayName}
                    </p>
                    <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                      {role === 'admin' ? 'مدير المنصة' : role === 'vendor' ? 'بائع معتمد' : 'حريف'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveView('my-orders');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-right px-4 py-2 text-xs font-medium hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                  >
                    <Package className="w-4 h-4 text-emerald-700" />
                    <span>متابعة طلباتي</span>
                  </button>

                  {isVendor && (
                    <button
                      onClick={() => {
                        setActiveView('vendor');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-right px-4 py-2 text-xs font-medium hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                    >
                      <Store className="w-4 h-4 text-amber-600" />
                      <span>متجري والمنتجات</span>
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setActiveView('admin');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-right px-4 py-2 text-xs font-medium hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-800" />
                      <span>لوحة التحكم الإدارية</span>
                    </button>
                  )}

                  <div className="border-t border-stone-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        signOut();
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-right px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
            >
              <User className="w-4 h-4 text-amber-300" />
              <span>تسجيل الدخول</span>
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-200 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search & Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pb-4 pt-1 bg-[#043d2e] border-t border-emerald-800 flex flex-col gap-3">
          {/* Mobile Search Bar */}
          <div className="flex items-center bg-white rounded-lg overflow-hidden text-stone-800">
            <input
              type="text"
              placeholder="ابحث في سوقنا..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'home') setActiveView('home');
              }}
              className="w-full px-3 py-2 text-sm focus:outline-none"
            />
            <button
              onClick={() => {
                setActiveView('home');
                setMobileMenuOpen(false);
              }}
              className="bg-emerald-800 text-amber-300 px-3 py-2"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Governorate select */}
          <div className="flex items-center gap-2 bg-emerald-900/60 p-2 rounded-lg text-xs text-white border border-emerald-700">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">الولاية:</span>
            <select
              value={selectedGov}
              onChange={(e) => {
                setSelectedGov(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1"
            >
              <option value="" className="text-stone-900">كل الولايات التونسية (24)</option>
              {TUNISIAN_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov} className="text-stone-900">
                  ولاية {gov}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Quick Nav */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-800/80">
            <button
              onClick={() => {
                setActiveView('home');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-bold text-center ${
                activeView === 'home' ? 'bg-amber-400 text-stone-900' : 'bg-emerald-800 text-white'
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => {
                setActiveView('my-orders');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-bold text-center ${
                activeView === 'my-orders' ? 'bg-amber-400 text-stone-900' : 'bg-emerald-800 text-white'
              }`}
            >
              طلباتي
            </button>
            <button
              onClick={() => {
                setActiveView('vendor');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-bold text-center ${
                activeView === 'vendor' ? 'bg-amber-400 text-stone-900' : 'bg-emerald-800 text-white'
              }`}
            >
              فضاء البائع
            </button>
            <button
              onClick={() => {
                setActiveView('admin');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-bold text-center ${
                activeView === 'admin' ? 'bg-amber-400 text-stone-900' : 'bg-emerald-800 text-white'
              }`}
            >
              لوحة الإدارة
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
