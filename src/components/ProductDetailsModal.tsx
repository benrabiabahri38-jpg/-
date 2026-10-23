import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Star,
  MapPin,
  Store,
  Phone,
  Truck,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  Sparkles,
  MessageSquare,
  Send,
  User,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchReviewsByProduct, addReview } from '../services/reviewService';
import { TUNISIAN_GOVERNORATES } from '../data/tunisiaData';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onProductUpdated?: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onProductUpdated,
}) => {
  const { addToCart, items } = useCart();
  const { profile, currentUser } = useAuth();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // New Review Form State
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState<string>('');
  const [userNameInput, setUserNameInput] = useState<string>(profile?.displayName || 'حريف من تونس');
  const [userGovInput, setUserGovInput] = useState<string>(profile?.governorate || 'تونس');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Load reviews when product opens
  useEffect(() => {
    if (product) {
      setSelectedImage('');
      setQuantity(1);
      setActiveTab('details');
      setReviewSuccessMsg(false);
      setReviewError('');
      loadReviews(product.id);
    }
  }, [product]);

  useEffect(() => {
    if (profile) {
      setUserNameInput(profile.displayName || 'حريف من تونس');
      setUserGovInput(profile.governorate || 'تونس');
    }
  }, [profile]);

  const loadReviews = async (productId: string) => {
    setIsLoadingReviews(true);
    try {
      const data = await fetchReviewsByProduct(productId);
      setReviews(data);
    } catch (e) {
      console.error('Error loading reviews', e);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  if (!product) return null;

  const currentImg = selectedImage || product.images[0];
  const cartItem = items.find((i) => i.product.id === product.id);

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  // Calculate live average rating from reviews if present
  const calculatedRating =
    reviews.length > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : product.rating || 5.0;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');

    if (!commentInput.trim()) {
      setReviewError('يرجى كتابة رأيك أو تجربتك مع المنتج.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const newRev = await addReview({
        productId: product.id,
        productTitle: product.title,
        userId: currentUser?.uid || profile?.uid || 'guest_user',
        userName: userNameInput.trim() || 'حريف سوقنا',
        userGov: userGovInput,
        rating: ratingInput,
        comment: commentInput.trim(),
        status: 'approved',
      });

      setReviews((prev) => [newRev, ...prev]);
      setCommentInput('');
      setReviewSuccessMsg(true);
      if (onProductUpdated) onProductUpdated();
      setTimeout(() => setReviewSuccessMsg(false), 3000);
    } catch (err) {
      console.error(err);
      setReviewError('تعذر إضافة التقييم حالياً.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-stone-200 text-right flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery Column */}
            <div className="bg-stone-50 p-6 flex flex-col gap-4 border-b md:border-b-0 md:border-l border-stone-200">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-inner">
                <img
                  src={currentImg}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {discountPercent && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    تخفيض -{discountPercent}%
                  </span>
                )}
              </div>

              {/* Thumbnail selector */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        currentImg === img
                          ? 'border-emerald-700 scale-105 shadow-xs'
                          : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Vendor Card */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2 text-right">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">معلومات البائع:</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    بائع معتمد في سوقنا
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">{product.vendorName}</h4>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        ولاية {product.governorate}
                      </p>
                    </div>
                  </div>

                  {product.vendorPhone && (
                    <a
                      href={`tel:${product.vendorPhone}`}
                      className="p-2 bg-stone-100 hover:bg-stone-200 text-emerald-800 rounded-lg text-xs flex items-center gap-1 font-semibold"
                      title="الاتصال بالبائع"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">اتصال</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Details & Reviews Column */}
            <div className="p-6 flex flex-col justify-between text-right space-y-5">
              <div className="space-y-4">
                {/* Category & Overall Rating */}
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-900 font-bold">
                    {product.category}
                  </span>

                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="flex items-center gap-1.5 text-amber-500 font-bold hover:underline"
                  >
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= Math.round(calculatedRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-stone-800 font-black">{calculatedRating}</span>
                    <span className="text-stone-400 font-normal">
                      ({reviews.length > 0 ? reviews.length : product.reviewCount || 1} تقييم)
                    </span>
                  </button>
                </div>

                {/* Title */}
                <h2 className="text-xl font-black text-stone-900 leading-snug font-['Cairo']">
                  {product.title}
                </h2>

                {/* Price display */}
                <div className="flex items-baseline gap-2 bg-[#fbf9f4] p-3 rounded-2xl border border-stone-200/80">
                  <span className="text-3xl font-black text-emerald-900 font-['Cairo']">
                    {product.price.toFixed(3).replace(/\.?0+$/, '')}
                  </span>
                  <span className="text-sm font-bold text-emerald-800">دينار تونسي (د.ت)</span>

                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-sm text-stone-400 line-through mr-2">
                      {product.comparePrice.toFixed(3).replace(/\.?0+$/, '')} د.ت
                    </span>
                  )}
                </div>

                {/* Tab Switcher: Description vs Customer Reviews */}
                <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'details'
                        ? 'bg-emerald-800 text-amber-300 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    تفاصيل ومواصفات المنتج
                  </button>

                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'reviews'
                        ? 'bg-emerald-800 text-amber-300 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>آراء وتقييمات الحرفاء ({reviews.length})</span>
                  </button>
                </div>

                {/* TAB 1: Product Description */}
                {activeTab === 'details' ? (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-h-40 overflow-y-auto pl-1">
                      {product.description}
                    </p>

                    {/* Stock status */}
                    <div className="flex items-center justify-between text-xs font-semibold pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-500">حالة التوفر:</span>
                        {product.stock > 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                            <Check className="w-3.5 h-3.5" />
                            متوفر في المخزون ({product.stock} قطعة)
                          </span>
                        ) : (
                          <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold">
                            غير متوفر حالياً
                          </span>
                        )}
                      </div>

                      {/* Flag product for admin review */}
                      <button
                        type="button"
                        onClick={async () => {
                          const { notifyAdminProductFlagged } = await import('../services/notificationService');
                          await notifyAdminProductFlagged(product.id, product.title, 'طلب تدقيق جودة من حريف');
                          alert('تم إرسال إشعار فوري لإدارة سوقنا لمراجعة وتدقيق بيانات المنتج.');
                        }}
                        className="text-[11px] text-stone-400 hover:text-red-600 transition-colors flex items-center gap-1"
                        title="إبلاغ الإدارة لمراجعة المنتج"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>طلب مراجعة الإدارة</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* TAB 2: Ratings & Reviews System (User Requirement) */
                  <div className="space-y-4 max-h-72 overflow-y-auto pl-1">
                    {/* Add Review Form */}
                    <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/90 space-y-3">
                      <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>أضف تقييمك ورأيك في المنتج:</span>
                      </h4>

                      {reviewSuccessMsg && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-xl text-[11px] flex items-center gap-1.5 font-bold">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>شكراً لك! تم تسجيل ونشر تقييمك بنجاح.</span>
                        </div>
                      )}

                      {reviewError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-xl text-[11px] flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                          <span>{reviewError}</span>
                        </div>
                      )}

                      <form onSubmit={handleReviewSubmit} className="space-y-2.5">
                        {/* 1-5 Star Picker */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-stone-700">
                            التقييم بالنجوم:
                          </span>
                          <div className="flex items-center gap-1 dir-ltr">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(null)}
                                onClick={() => setRatingInput(star)}
                                className="p-1 hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= (hoverRating ?? ratingInput)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-stone-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Comment text */}
                        <textarea
                          rows={2}
                          required
                          placeholder="اكتب تجربتك مع جودة السلعة وسرعة التوصيل..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white"
                        />

                        {/* Name and Wilaya */}
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="اسمك الكريم"
                            value={userNameInput}
                            onChange={(e) => setUserNameInput(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl text-xs bg-white"
                          />

                          <select
                            value={userGovInput}
                            onChange={(e) => setUserGovInput(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl text-xs bg-white cursor-pointer"
                          >
                            {TUNISIAN_GOVERNORATES.map((g) => (
                              <option key={g} value={g}>
                                ولاية {g}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="w-full py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmittingReview ? 'جارٍ الإرسال...' : 'إرسال التقييم'}</span>
                        </button>
                      </form>
                    </div>

                    {/* Existing Reviews List */}
                    <div className="space-y-2.5 pt-1">
                      <h4 className="font-bold text-xs text-stone-900">
                        الآراء الموثقة من الحرفاء:
                      </h4>

                      {isLoadingReviews ? (
                        <p className="text-center text-xs text-stone-400 py-4">
                          جارٍ تحميل التقييمات...
                        </p>
                      ) : reviews.length === 0 ? (
                        <p className="text-center text-xs text-stone-500 py-4">
                          كن أول من يقيم هذا المنتج التونسي المميز!
                        </p>
                      ) : (
                        reviews.map((rev) => (
                          <div
                            key={rev.id}
                            className="bg-white p-3 rounded-xl border border-stone-200/90 shadow-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-stone-900">
                                  {rev.userName}
                                </span>
                                {rev.userGov && (
                                  <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded font-medium">
                                    ولاية {rev.userGov}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-0.5 dir-ltr">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${
                                      s <= rev.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-stone-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="text-xs text-stone-700 leading-relaxed">
                              {rev.comment}
                            </p>

                            <p className="text-[10px] text-stone-400">
                              {new Date(rev.createdAt).toLocaleDateString('ar-TN')} • شراء موثق
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions: Quantity + Add to Cart */}
              <div className="space-y-4 pt-4 border-t border-stone-200">
                {product.stock > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">الكمية:</span>
                    <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-stone-800 hover:bg-stone-50"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-stone-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-stone-800 hover:bg-stone-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAdd}
                  disabled={product.stock <= 0}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    product.stock <= 0
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : added
                      ? 'bg-emerald-700 text-white'
                      : 'bg-amber-400 hover:bg-amber-300 text-stone-950 hover:shadow-lg'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5 text-white" />
                      <span>تمت الإضافة للسلة بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>أضف {quantity > 1 ? `(${quantity}) قطع` : ''} إلى سلة المشتريات</span>
                    </>
                  )}
                </button>

                {/* Delivery assurance */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>توصيل لكافة ولايات تونس</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>الدفع عند الاستلام</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
