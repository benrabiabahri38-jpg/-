import React from 'react';
import { Store, Phone, Mail, MapPin, ShieldCheck, Truck, Heart } from 'lucide-react';
import { TUNISIAN_GOVERNORATES } from '../data/tunisiaData';

interface FooterProps {
  onSelectGov: (gov: string) => void;
  onOpenVendor: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectGov, onOpenVendor, onOpenAdmin }) => {
  return (
    <footer className="bg-[#042d22] text-stone-200 border-t border-emerald-900/80 mt-16 text-right font-['Cairo'] pb-16 lg:pb-0">
      {/* Top Banner Highlights */}
      <div className="border-b border-emerald-900/60 bg-[#03231a] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-right">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/80 text-amber-300 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">توصيل للـ 24 ولاية</h4>
              <p className="text-xs text-stone-400">تغطية شاملة لكل معتمديات ومدن الجمهورية التونسية</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/80 text-amber-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">الدفع عند الاستلام فقط</h4>
              <p className="text-xs text-stone-400">شفافية تامة: تفقد طردك ومحتواه قبل دفع المليم</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/80 text-amber-300 flex items-center justify-center shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">دعم الاقتصاد المحلي</h4>
              <p className="text-xs text-stone-400">تمكين الحرفيين وصغار التجار بعمولة 10% فقط</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-white">سوقنا</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
              تونس 🇹🇳
            </span>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            المنصة التونسية المتكاملة لربط الحرفيين والتجار بالمستهلك التونسي مباشرة. تجربة تسوق مريحة، آمنة، وأصيلة تنقل روائح وخيرات تونس إلى منزلك.
          </p>

          <div className="space-y-2 text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span className="dir-ltr text-right">+216 71 800 900</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>contact@soukna.tn</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>المدينة العتيقة، تونس العاصمة</span>
            </div>
          </div>
        </div>

        {/* 24 Governorates Directory */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="font-bold text-sm text-white border-b border-emerald-800 pb-2">
            تصفح المنتجات حسب ولايات تونس (24 ولاية)
          </h4>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {TUNISIAN_GOVERNORATES.map((gov) => (
              <button
                key={gov}
                onClick={() => {
                  onSelectGov(gov);
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-800 text-stone-300 hover:text-amber-300 text-xs transition-colors border border-emerald-900/50"
              >
                {gov}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links & Portal Access */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-white border-b border-emerald-800 pb-2">
            فضاءات المنصة
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={onOpenVendor}
                className="hover:text-amber-300 transition-colors text-right flex items-center gap-1.5"
              >
                <span>فضاء البائع والتجار (إضافة المنتجات)</span>
              </button>
            </li>
            <li>
              <button
                onClick={onOpenAdmin}
                className="hover:text-amber-300 transition-colors text-right flex items-center gap-1.5 text-stone-400"
              >
                <span>لوحة تحكم الإدارة (العمولة والطلبات)</span>
              </button>
            </li>
            <li className="text-stone-400 pt-2">
              <span>نسبة العمولة الثابتة: 10%</span>
            </li>
            <li className="text-stone-400">
              <span>شحن مجاني عند الشراء بـ 120 د.ت</span>
            </li>
          </ul>

          {/* Payment disclaimer note */}
          <div className="p-3 bg-[#032118] border border-amber-900/40 rounded-xl text-[11px] text-stone-300 leading-relaxed">
            <strong className="text-amber-300 block mb-0.5">ضمان الدفع عند الاستلام:</strong>
            لا توجد مدفوعات إلكترونية وهمية. الدفع يتم نقداً للموصّل فقط بعد استلام الطرد.
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-emerald-950 bg-[#021811] py-4 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} سوقنا – Soukna TN. جميع الحقوق محفوظة للجمهورية التونسية.</p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>صُنع بحب لأجل خيرات وتراث تونس</span>
            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
