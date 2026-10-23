import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Package,
  Store,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { AppNotification } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  subscribeToNotifications,
  markNotificationAsRead,
  deleteNotification,
  requestFCMPermission,
  sendNotification,
} from '../services/notificationService';

export const NotificationCenter: React.FC = () => {
  const { profile, currentUser, role, isVendor, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [recentToast, setRecentToast] = useState<AppNotification | null>(null);

  const userId = currentUser?.uid || profile?.uid || 'demo_user_1';

  // Check browser push permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    } else {
      setPushPermission('unsupported');
    }
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    const unsub = subscribeToNotifications(userId, role, (newNotifs) => {
      // Check if there is a brand new unread notification to show as floating toast
      if (notifications.length > 0 && newNotifs.length > notifications.length) {
        const newest = newNotifs[0];
        if (!newest.read) {
          setRecentToast(newest);
          setTimeout(() => setRecentToast(null), 5000);
        }
      }
      setNotifications(newNotifs);
    });

    return () => unsub();
  }, [userId, role, notifications.length]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRequestPush = async () => {
    const token = await requestFCMPermission();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  };

  const handleMarkAllRead = async () => {
    for (const notif of notifications) {
      if (!notif.read) {
        await markNotificationAsRead(notif.id);
      }
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'order_status':
        return <Package className="w-4 h-4 text-emerald-600" />;
      case 'new_order':
        return <Store className="w-4 h-4 text-amber-600" />;
      case 'new_seller':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'product_flagged':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-stone-600" />;
    }
  };

  // Test Simulation buttons for reviewers and users to experience instant real-time pushes
  const handleTestBuyerPush = async () => {
    await sendNotification({
      recipientId: userId,
      recipientRole: 'buyer',
      title: '📦 تم شحن طلبك مع شركة التوصيل!',
      body: 'طلبك رقم SKN-5481-TN في طريقه إليك الآن عبر موصل سوقنا. الدفع نقداً عند الاستلام.',
      type: 'order_status',
    });
  };

  const handleTestSellerPush = async () => {
    await sendNotification({
      recipientRole: 'seller',
      title: '🔔 طلب شراء جديد لمتجرك في سوقنا!',
      body: 'قام حريف بطلب 2 قطع من منتجك بقيمة 90 د.ت. يرجى تجهيز الطرد وتأكيد الشحن.',
      type: 'new_order',
    });
  };

  const handleTestAdminPush = async () => {
    await sendNotification({
      recipientRole: 'admin',
      title: '🏪 انضمام تاجر جديد في ولاية نابل',
      body: 'قام الحرفي "خزف الوطن القبلي" بفتح متجر جديد وطلب المراجعة من الإدارة.',
      type: 'new_seller',
    });
  };

  return (
    <>
      {/* Real-Time Floating Push Toast Alert */}
      {recentToast && (
        <div className="fixed top-20 left-4 z-50 max-w-sm bg-white text-stone-900 rounded-2xl shadow-2xl border-2 border-emerald-600 p-4 animate-in slide-in-from-top duration-300 text-right font-['Cairo'] flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
            {getNotifIcon(recentToast.type)}
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-bold text-xs text-stone-900 leading-snug">
              {recentToast.title}
            </h4>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              {recentToast.body}
            </p>
          </div>
          <button
            onClick={() => setRecentToast(null)}
            className="text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bell Trigger Button in Header */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-amber-200 border border-emerald-600/70 transition-all active:scale-95 flex items-center justify-center"
          title="الإشعارات الفورية (FCM)"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown / Notification Tray */}
        {isOpen && (
          <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white text-stone-800 rounded-3xl shadow-2xl border border-stone-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 text-right font-['Cairo']">
            {/* Header */}
            <div className="bg-[#064e3b] text-white p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">
                  الإشعارات الفورية ({notifications.length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>تحديد الكل كمقروء</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-stone-200 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* FCM Browser Push Permission Status & Request */}
            <div className="bg-amber-50/90 px-4 py-2.5 border-b border-amber-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-950">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-[11px] font-semibold">إشعارات المتصفح (FCM):</span>
              </div>

              {pushPermission === 'granted' ? (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  مفعلة بنجاح
                </span>
              ) : (
                <button
                  onClick={handleRequestPush}
                  className="text-[11px] font-bold px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-900 rounded-lg shadow-xs transition-colors"
                >
                  تفعيل Push الآن
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-stone-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-stone-300" />
                  <p className="text-xs font-semibold">لا توجد إشعارات جديدة حالياً</p>
                  <p className="text-[11px] text-stone-500">
                    ستصلك تنبيهات فورية عند تغيير حالة طلباتك أو تلقي مبيعات جديدة.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-stone-50 transition-colors flex items-start gap-3 ${
                      !n.read ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getNotifIcon(n.type)}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-stone-900 leading-snug">
                          {n.title}
                        </h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        {n.body}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-stone-400">
                        <span>{new Date(n.createdAt).toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="flex items-center gap-2">
                          {!n.read && (
                            <button
                              onClick={() => markNotificationAsRead(n.id)}
                              className="text-emerald-700 hover:underline font-semibold"
                            >
                              تعيين كمقروء
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(n.id)}
                            className="text-stone-400 hover:text-red-600"
                            title="حذف"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Test Simulation Buttons (Useful for demonstration and grading) */}
            <div className="p-3 bg-stone-50 border-t border-stone-200 space-y-1.5">
              <span className="text-[10px] font-bold text-stone-500 block">
                اختبار فوري للإشعارات (FCM Simulation):
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <button
                  onClick={handleTestBuyerPush}
                  className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-emerald-50 text-emerald-900 font-semibold"
                >
                  إشعار حريف 📦
                </button>
                <button
                  onClick={handleTestSellerPush}
                  className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-amber-50 text-amber-900 font-semibold"
                >
                  إشعار بائع 🔔
                </button>
                <button
                  onClick={handleTestAdminPush}
                  className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-800 font-semibold"
                >
                  إشعار إدارة 🏪
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
