import React from 'react';
import { Sparkles, Truck, ShieldCheck, HeartHandshake, ArrowLeft, Store } from 'lucide-react';

interface HeroBannerProps {
  onExplore: () => void;
  onJoinVendor: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExplore, onJoinVendor }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#064e3b] via-[#053f30] to-[#042d22] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-amber-900/20 shadow-md">
      {/* Decorative Tunisian mosaic geometric background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      {/* Subtle glowing orb */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left Column: Headlines & CTA */}
        <div className="flex-1 text-center lg:text-right space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>السوق الإلكتروني التونسي الأول متعدد البائعين</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-['Cairo'] tracking-tight leading-tight sm:leading-snug">
            خيرات تونس وصناعاتها الأصيلة، <br className="hidden sm:inline" />
            <span className="text-amber-400">من الحرفي والمحل إلى باب دارك</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-200/90 max-w-2xl leading-relaxed font-normal">
            منصة <strong className="text-white font-bold">سوقنا</strong> تجمع كبار وصغار التجار، الفلاحين وأصحاب الحرف اليدوية من بنزرت إلى تطاوين، مع ضمان الدفع عند الاستلام وشحن سريع لكافة الولايات الـ 24.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
            <button
              onClick={onExplore}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>تسوق الآن واستكشف المنتجات</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onJoinVendor}
              className="px-5 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/90 text-amber-200 border border-emerald-600/70 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>افتح متجرك (عمولة 10% فقط)</span>
            </button>
          </div>

          {/* Key Trust Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-emerald-800/80 text-right">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-800/60 flex items-center justify-center text-amber-300 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">توصيل 24 ولاية</p>
                <p className="text-emerald-200/70 text-[11px]">شحن سريع ومضمون</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-800/60 flex items-center justify-center text-amber-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">دفع عند الاستلام</p>
                <p className="text-emerald-200/70 text-[11px]">تفقد طردك قبل الدفع</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-800/60 flex items-center justify-center text-amber-300 shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">دعم الاقتصاد المحلي</p>
                <p className="text-emerald-200/70 text-[11px]">حرفيون وتجار معتمدون</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Feature Card */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs text-amber-300 pb-2 border-b border-white/10">
              <span className="font-bold">منتج الأسبوع المميز</span>
              <span className="px-2 py-0.5 rounded bg-emerald-700/80 text-white text-[10px]">ولاية نابل</span>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1615865417491-9941019fbc00?auto=format&fit=crop&w=800&q=80"
                alt="خزف نابل"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 bg-stone-900/80 backdrop-blur-sm text-amber-300 text-xs px-2.5 py-1 rounded-md font-bold">
                85.000 د.ت
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-white">فخار وخزف نابل اليدوي التقليدي</h3>
              <p className="text-xs text-stone-200 line-clamp-2">
                مصنوع بدقة وحرفية توارثتها الأجيال بزخارف أندلسية وتونسية عريقة.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-emerald-200">
              <span>البائع: حرفيو الوطن القبلي</span>
              <span className="text-amber-400 font-bold">★ 4.9 (24 تقييم)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
