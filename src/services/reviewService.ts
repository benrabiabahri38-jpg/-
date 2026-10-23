import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Review, ReviewStatus } from '../types';

const COLLECTION_NAME = 'reviews';

// Sample seed reviews for Tunisian products
const SAMPLE_REVIEWS: Omit<Review, 'id'>[] = [
  {
    productId: 'prod_tn_1',
    productTitle: 'زيت زيتون تونسي بكر ممتاز بيولوجي',
    userId: 'user_review_1',
    userName: 'أنيس الطرابلسي',
    userGov: 'تونس',
    rating: 5,
    comment: 'زيت زيتون ممتاز بريحة ونكهة شتوية تفكرنا في زيت بلادنا. تغليف محكم وتوصيل سريع في يومين.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    productId: 'prod_tn_1',
    productTitle: 'زيت زيتون تونسي بكر ممتاز بيولوجي',
    userId: 'user_review_2',
    userName: 'مريم بن خليفة',
    userGov: 'سوسة',
    rating: 5,
    comment: 'الجودة عالية جداً، نكهة فاكهية خفيفة بدون أي مرارة قوية. يعطيهم الصحة معصرة الأصالة.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    productId: 'prod_tn_2',
    productTitle: 'طقم أواني وضيافة فخار نابل يدوي الصنع',
    userId: 'user_review_3',
    userName: 'سفيان الغربي',
    userGov: 'صفاقس',
    rating: 5,
    comment: 'تحفة فنية تونسية أصيلة! النقش والزخرفة دقيقة جداً والصحن كبير يعمر العين.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    productId: 'prod_tn_3',
    productTitle: 'شاشية تونسية أصلية صوف 100% مهدية ملونة',
    userId: 'user_review_4',
    userName: 'بلقاسم الزواري',
    userGov: 'المنستير',
    rating: 5,
    comment: 'شاشية مطابقة للأصلية ومريحة جداً وصوفها حنين، خذيتها للمولد النبوي الشريف وطلعت ممتازة.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    productId: 'prod_tn_4',
    productTitle: 'دقلة النور التونسية الفاخرة رطبة ممتازة',
    userId: 'user_review_5',
    userName: 'هندة الماجري',
    userGov: 'بنزرت',
    rating: 5,
    comment: 'تمور عسل صافي، رطبة وشفافة ووصلت طازجة كأنها مقطوفة اليوم من واحات توزر.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export async function fetchReviewsByProduct(productId: string): Promise<Review[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    const reviews: Review[] = [];

    snapshot.forEach((snap) => {
      const data = snap.data() as Review;
      if (data.productId === productId && data.status !== 'rejected') {
        reviews.push({ ...data, id: snap.id });
      }
    });

    if (reviews.length === 0) {
      // Check if sample reviews exist for this product
      const relevantSamples = SAMPLE_REVIEWS.filter((r) => r.productId === productId);
      if (relevantSamples.length > 0) {
        // Seed them
        for (let i = 0; i < relevantSamples.length; i++) {
          const sample = relevantSamples[i];
          const newId = `sample_rev_${productId}_${i}`;
          const revObj: Review = { ...sample, id: newId };
          await setDoc(doc(db, COLLECTION_NAME, newId), revObj).catch(() => {});
          reviews.push(revObj);
        }
      }
    }

    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

export async function fetchAllReviews(): Promise<Review[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    const reviews: Review[] = [];

    snapshot.forEach((snap) => {
      reviews.push({ ...(snap.data() as Review), id: snap.id });
    });

    if (reviews.length === 0) {
      // Seed sample reviews into Firestore
      for (let i = 0; i < SAMPLE_REVIEWS.length; i++) {
        const sample = SAMPLE_REVIEWS[i];
        const newId = `sample_rev_${i}`;
        const revObj: Review = { ...sample, id: newId };
        await setDoc(doc(db, COLLECTION_NAME, newId), revObj).catch(() => {});
        reviews.push(revObj);
      }
    }

    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

export async function addReview(reviewPayload: Omit<Review, 'id' | 'createdAt' | 'status'> & { status?: ReviewStatus }): Promise<Review> {
  const newId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newReview: Review = {
    ...reviewPayload,
    id: newId,
    status: reviewPayload.status || 'approved', // auto-approved with admin moderation power
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, COLLECTION_NAME, newId), newReview);

    // Update product rating and review count in Firestore
    try {
      const prodRef = doc(db, 'products', reviewPayload.productId);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) {
        const prodData = prodSnap.data();
        const currentCount = Number(prodData.reviewCount) || 0;
        const currentRating = Number(prodData.rating) || 5.0;
        const newCount = currentCount + 1;
        const newRating = Number(((currentRating * currentCount + reviewPayload.rating) / newCount).toFixed(1));

        await updateDoc(prodRef, {
          rating: newRating,
          reviewCount: newCount,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Could not update product rating summary doc', e);
    }

    return newReview;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
  }
}

export async function updateReviewStatus(reviewId: string, status: ReviewStatus): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, reviewId);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${reviewId}`);
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, reviewId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${reviewId}`);
  }
}
