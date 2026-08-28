import React from 'react';
import Breadcrumbs from '../Components/Breadcrumbs';
import { RefreshCw, Check } from 'lucide-react';

const ReturnsPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Returns & Exchanges' }]} />

      <div className="space-y-4">
        <h1 className="text-3xl font-serif font-bold text-white">Returns & Exchanges Policy</h1>
        <p className="text-xs text-white/60 leading-relaxed">
          We want you to be completely delighted with your purchase. If a garment size or color is not perfect, take advantage of our 30-day complimentary return guarantee.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-4 text-xs text-white/80">
        <h3 className="text-sm font-bold text-white uppercase">Return Guidelines</h3>
        <ul className="space-y-2 list-disc pl-4 text-white/70">
          <li>Items must be returned within 30 days of delivery.</li>
          <li>Garments must be unworn, unwashed, and in original pristine condition with security tags attached.</li>
          <li>Refunds are credited back to your original payment method within 3 business days of package inspection.</li>
        </ul>
      </div>
    </div>
  );
};

export default ReturnsPage;
