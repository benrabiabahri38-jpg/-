export type UserRole = 'customer' | 'vendor' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  governorate?: string;
  shopName?: string;
  shopDescription?: string;
  shopStatus?: 'active' | 'pending' | 'suspended';
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  badge?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number; // in Tunisian Dinars (TND)
  comparePrice?: number; // original price for discounts
  category: string;
  governorate: string; // one of the 24 governorates
  images: string[];
  stock: number;
  vendorId: string;
  vendorName: string;
  vendorPhone?: string;
  status: 'active' | 'draft' | 'archived';
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  vendorId: string;
  vendorName: string;
  image: string;
  governorate: string;
}

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string; // e.g. SKN-7842-TN
  customerId?: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  governorate: string;
  city?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  paymentMethod: 'cod'; // Cash on delivery
  paymentStatus: 'pending' | 'paid';
  orderStatus: OrderStatus;
  platformCommissionRate: number; // 0.10 for 10%
  platformCommissionAmount: number;
  vendorIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PlatformSettings {
  commissionRate: number; // e.g. 0.10
  supportPhone: string;
  supportEmail: string;
  maintenanceMode: boolean;
  defaultShippingCost: number; // e.g. 7 TND
  updatedAt?: string;
}

export type ReviewStatus = 'approved' | 'pending' | 'rejected';

export interface Review {
  id: string;
  productId: string;
  productTitle?: string;
  userId: string;
  userName: string;
  userGov?: string;
  rating: number; // 1 to 5
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}

export type NotificationType =
  | 'order_status' // For buyers when their order status changes
  | 'new_order' // For sellers when they receive a new order
  | 'new_seller' // For administrators when a new seller registers
  | 'product_flagged' // For administrators when a product/review is flagged
  | 'general';

export interface AppNotification {
  id: string;
  recipientId?: string;
  recipientRole: 'buyer' | 'seller' | 'admin' | 'all';
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  governorate: string;
  minPrice: number | '';
  maxPrice: number | '';
  sortBy: 'latest' | 'price-asc' | 'price-desc' | 'rating';
  inStockOnly: boolean;
}
