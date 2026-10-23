import React from 'react';
import {
  Store,
  Sparkles,
  Palette,
  UtensilsCrossed,
  Shirt,
  Droplet,
  Home,
  Cpu,
} from 'lucide-react';
import { CATEGORIES } from '../data/tunisiaData';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sparkles':
      return <Sparkles className="w-5 h-5" />;
    case 'Palette':
      return <Palette className="w-5 h-5" />;
    case 'UtensilsCrossed':
      return <UtensilsCrossed className="w-5 h-5" />;
    case 'Shirt':
      return <Shirt className="w-5 h-5" />;
    case 'Droplet':
      return <Droplet className="w-5 h-5" />;
    case 'Home':
      return <Home className="w-5 h-5" />;
    case 'Cpu':
      return <Cpu className="w-5 h-5" />;
    default:
      return <Store className="w-5 h-5" />;
  }
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="bg-[#fdfbf7] border-b border-stone-200 py-3 shadow-xs sticky top-[110px] sm:top-[68px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-[#064e3b] text-amber-300 border-[#064e3b] shadow-md scale-[1.02]'
                    : 'bg-white text-stone-700 border-stone-200/80 hover:bg-stone-50 hover:border-emerald-600/40'
                }`}
              >
                <span className={isSelected ? 'text-amber-300' : 'text-emerald-800'}>
                  {getCategoryIcon(cat.icon)}
                </span>
                <span>{cat.name}</span>
                {cat.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected
                        ? 'bg-amber-400 text-stone-900'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
