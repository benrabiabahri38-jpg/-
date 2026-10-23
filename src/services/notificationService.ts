import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { AppNotification, NotificationType, OrderStatus } from '../types';

const COLLECTION_NAME = 'notifications';

// Safe FCM Messaging initialization
export async function initFCM(): Promise<any | null> {
  try {
    const supported = await isSupported();
    if (supported && typeof window !== 'undefined') {
      const messaging = getMessaging();
      return messaging;
    }
  } catch (err) {
    console.warn('FCM not supported in this browser or iframe environment:', err);
  }
  return null;
}

export async function requestFCMPermission(): Promise<string | null> {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = await initFCM();
      if (messaging) {
        // Attempt to get token
        try {
          const token = await getToken(messaging, {
            // Optional vapidKey if configured, or default project key
          });
          console.log('FCM Device Token registered:', token);
          return token;
        } catch (tokenErr) {
          console.warn('Could not retrieve FCM token (using local push bridge):', tokenErr);
          return 'browser_notification_granted';
        }
      }
      return 'browser_notification_granted';
    }
  } catch (e) {
    console.warn('Notification permission error:', e);
  }
  return null;
}

// Subscribe to real-time notifications for user / role
export function subscribeToNotifications(
  userId: string,
  userRole: 'customer' | 'vendor' | 'admin',
  onUpdate: (notifications: AppNotification[]) => void
) {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs: AppNotification[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as AppNotification;
          const notif = { ...data, id: docSnap.id };

          // Filter for this user or their role
          const isForUser = data.recipientId && data.recipientId === userId;
          const isForRole =
            (userRole === 'admin') ||
            (userRole === 'vendor' && data.recipientRole === 'seller') ||
            (userRole === 'customer' && data.recipientRole === 'buyer') ||
            data.recipientRole === 'all';

          if (isForUser || isForRole) {
            notifs.push(notif);
          }
        });

        // Sort descending
        const sorted = notifs.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        onUpdate(sorted);
      },
      (error) => {
        console.warn('Notifications onSnapshot error:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not establish notification stream', err);
    return () => {};
  }
}

// Send an App Notification
export async function sendNotification(payload: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<AppNotification> {
  const newId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const notif: AppNotification = {
    ...payload,
    id: newId,
    read: false,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, COLLECTION_NAME, newId), notif);

    // If browser supports Notification and permission is granted, display system push notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(payload.title, {
          body: payload.body,
          icon: '/favicon.ico',
          dir: 'rtl',
          lang: 'ar',
        });
      } catch (pushErr) {
        // inside iframe or restrictions
      }
    }

    return notif;
  } catch (error) {
    console.warn('Could not save notification to Firestore', error);
    return notif;
  }
}

// 1. Notify Buyer when order status changes
export async function notifyBuyerOrderStatus(
  customerId: string,
  orderNumber: string,
  newStatus: OrderStatus
): Promise<void> {
  const statusLabels: Record<OrderStatus, string> = {
    new: 'تم تسجيله في سوقنا بنجاح',
    processing: 'قيد التجهيز والتغليف لدى البائع',
    shipped: 'تم تسليمه للموصّل وهو في الطريق إليك',
    delivered: 'تم التوصيل بنجاح وتسليم الطرد',
    cancelled: 'تم إلغاء الطلب',
  };

  const statusLabel = statusLabels[newStatus] || newStatus;

  await sendNotification({
    recipientId: customerId,
    recipientRole: 'buyer',
    title: `📦 تحديث حالة طلبك ${orderNumber}`,
    body: `أصبح طلبك الآن: ${statusLabel}. يرجى التواجد واستلام الطرد مع الدفع نقداً.`,
    type: 'order_status',
    data: { orderNumber, newStatus },
  });
}

// 2. Notify Seller when receiving a new order
export async function notifySellerNewOrder(
  vendorId: string,
  orderNumber: string,
  totalAmount: number,
  customerName: string
): Promise<void> {
  await sendNotification({
    recipientId: vendorId,
    recipientRole: 'seller',
    title: `🔔 طلب شراء جديد لمتجرك! (${orderNumber})`,
    body: `تلقى متجرك طلباً جديداً من الحريف ${customerName} بقيمة ${totalAmount.toFixed(3).replace(/\.?0+$/, '')} د.ت. يرجى تجهيز الطرد.`,
    type: 'new_order',
    data: { orderNumber, totalAmount, customerName },
  });
}

// 3. Notify Admin when a new seller registers
export async function notifyAdminNewSeller(
  vendorId: string,
  shopName: string,
  governorate: string,
  phone: string
): Promise<void> {
  await sendNotification({
    recipientRole: 'admin',
    title: `🏪 تسجيل تاجر جديد في سوقنا`,
    body: `انضم بائع جديد باسم "${shopName}" من ولاية ${governorate}. رقم الهاتف: ${phone}.`,
    type: 'new_seller',
    data: { vendorId, shopName, governorate, phone },
  });
}

// 4. Notify Admin when a product or review is flagged
export async function notifyAdminProductFlagged(
  productId: string,
  productTitle: string,
  reason: string
): Promise<void> {
  await sendNotification({
    recipientRole: 'admin',
    title: `⚠️ تنبيه مراجعة لمنتج في سوقنا`,
    body: `تم الإبلاغ أو طلب فحص المنتج "${productTitle}". السبب: ${reason}`,
    type: 'product_flagged',
    data: { productId, productTitle, reason },
  });
}

// Mark as read
export async function markNotificationAsRead(notifId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, notifId);
    await updateDoc(docRef, { read: true });
  } catch (err) {
    console.warn('Failed to mark notification read', err);
  }
}

// Delete notification
export async function deleteNotification(notifId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, notifId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Failed to delete notification', err);
  }
}
