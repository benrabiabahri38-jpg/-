import React from 'react';
import { ShoppingBag, Star, MapPin, Store, Check, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart, items } = useCart();
  const [addedRecently, setAddedRecently] = React.useState(false);

  const cartItem = items.find((item) => item.product.id === product.id);
  const isInCart = Boolean(cartItem);

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 1500);
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-600/50 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1546749839-2a9a7b5790c9?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end">
          {discountPercent && (
            <span className="bg-red-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-lg shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.featured && (
            <span className="bg-amber-400 text-stone-900 font-bold text-[10px] px-2 py-0.5 rounded-lg shadow-sm">
              مميز
            </span>
          )}
        </div>

        {/* Governorate Tag */}
        <div className="absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-stone-100 text-[11px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 shadow-xs">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span>ولاية {product.governorate}</span>
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 text-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md">
              نفد من المخزون
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 text-right">
        <div>
          {/* Vendor info & rating */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="flex items-center gap-1 font-medium truncate max-w-[140px] text-stone-600">
              <Store className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
              <span className="truncate">{product.vendorName}</span>
            </span>

            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
              <span>{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-stone-900 text-sm leading-snug line-clamp-2 group-hover:text-emerald-900 transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price & Action Button */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-emerald-900 font-['Cairo']">
                {product.price.toFixed(3).replace(/\.?0+$/, '')}
              </span>
              <span className="text-xs font-bold text-emerald-700">د.ت</span>
            </div>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[11px] text-stone-400 line-through">
                {product.comparePrice.toFixed(3).replace(/\.?0+$/, '')} د.ت
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : addedRecently
                ? 'bg-emerald-700 text-white'
                : isInCart
                ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
                : 'bg-amber-400 hover:bg-amber-300 text-stone-950 hover:shadow-md'
            }`}
          >
            {addedRecently ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>أُضيف!</span>
              </>
            ) : isInCart ? (
              <>
                <ShoppingBag className="w-4 h-4 text-emerald-800" />
                <span>بالسلة ({cartItem?.quantity})</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-stone-900" />
                <span>أضف للسلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
