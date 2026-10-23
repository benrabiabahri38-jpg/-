import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Product } from '../types';
import { INITIAL_TUNISIAN_PRODUCTS } from '../data/tunisiaData';

const COLLECTION_NAME = 'products';

export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      products.push({
        id: docSnap.id,
        title: data.title || '',
        description: data.description || '',
        price: Number(data.price) || 0,
        comparePrice: data.comparePrice ? Number(data.comparePrice) : undefined,
        category: data.category || 'all',
        governorate: data.governorate || 'تونس',
        images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [
          'https://images.unsplash.com/photo-1546749839-2a9a7b5790c9?auto=format&fit=crop&w=800&q=80'
        ],
        stock: Number(data.stock) ?? 10,
        vendorId: data.vendorId || '',
        vendorName: data.vendorName || 'بائع سوقنا',
        vendorPhone: data.vendorPhone || '',
        status: data.status || 'active',
        featured: Boolean(data.featured),
        rating: Number(data.rating) || 4.8,
        reviewCount: Number(data.reviewCount) || 12,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt,
      });
    });

    // If Firestore has 0 products yet, auto-seed realistic Tunisian marketplace products
    if (products.length === 0) {
      console.log('Seeding initial Tunisian marketplace catalog into Firestore...');
      return await seedSampleProducts();
    }

    return products;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

export async function seedSampleProducts(): Promise<Product[]> {
  const seededList: Product[] = [];
  try {
    for (let i = 0; i < INITIAL_TUNISIAN_PRODUCTS.length; i++) {
      const sample = INITIAL_TUNISIAN_PRODUCTS[i];
      const newId = `prod_tn_${i + 1}`;
      const productData: Product = {
        ...sample,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, COLLECTION_NAME, newId), productData);
      seededList.push(productData);
    }
    return seededList;
  } catch (error) {
    console.warn('Seeding failed (perhaps guest or permission limits), using local fallback', error);
    return INITIAL_TUNISIAN_PRODUCTS.map((p, idx) => ({ ...p, id: `local_tn_${idx + 1}` }));
  }
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const product: Product = {
    ...productData,
    id: newId,
    createdAt: new Date().toISOString(),
    status: productData.status || 'active',
    rating: productData.rating || 5.0,
    reviewCount: productData.reviewCount || 1,
  };

  try {
    await setDoc(doc(db, COLLECTION_NAME, newId), product);
    return product;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}
