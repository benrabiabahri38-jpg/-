import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Order, OrderStatus } from '../types';

const COLLECTION_NAME = 'orders';

export async function createOrder(orderPayload: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'platformCommissionAmount'> & { platformCommissionRate?: number }): Promise<Order> {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `SKN-${randomSuffix}-TN`;
  const orderId = `order_${timestamp}_${randomSuffix}`;
  const commissionRate = orderPayload.platformCommissionRate ?? 0.10;
  const platformCommissionAmount = Number((orderPayload.subtotal * commissionRate).toFixed(2));

  const newOrder: Order = {
    ...orderPayload,
    id: orderId,
    orderNumber,
    platformCommissionRate: commissionRate,
    platformCommissionAmount,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, COLLECTION_NAME, orderId), newOrder);
    return newOrder;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${orderId}`);
  }
}

export async function fetchAllOrders(): Promise<Order[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((snap) => {
      orders.push(snap.data() as Order);
    });
    // Sort descending by creation date
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

export async function fetchOrdersByCustomer(customerId: string): Promise<Order[]> {
  try {
    const all = await fetchAllOrders();
    return all.filter((o) => o.customerId === customerId);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

export async function fetchOrdersByVendor(vendorId: string): Promise<Order[]> {
  try {
    const all = await fetchAllOrders();
    return all.filter((o) => Array.isArray(o.vendorIds) && o.vendorIds.includes(vendorId));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

export async function updateOrderStatus(orderId: string, orderStatus: OrderStatus, paymentStatus?: 'pending' | 'paid'): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, orderId);
    const updates: Partial<Order> = {
      orderStatus,
      updatedAt: new Date().toISOString(),
    };
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${orderId}`);
  }
}
