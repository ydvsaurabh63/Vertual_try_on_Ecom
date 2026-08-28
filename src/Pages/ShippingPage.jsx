import React from 'react';
import Breadcrumbs from '../Components/Breadcrumbs';
import { Truck, ShieldCheck, Clock } from 'lucide-react';

const ShippingPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Shipping Policy' }]} />

      <div className="space-y-4">
        <h1 className="text-3xl font-serif font-bold text-white">Worldwide Shipping Policy</h1>
        <p className="text-xs text-white/60 leading-relaxed">
          STORE delivers luxury fashion worldwide via express courier partners (DHL Express and FedEx). All orders are carefully packaged in custom signature eco-friendly boxes.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-4 text-xs text-white/80">
        <h3 className="text-sm font-bold text-white uppercase">Delivery Rates & Speed</h3>
        <ul className="space-y-2 list-disc pl-4 text-white/70">
          <li><strong>Complimentary Worldwide Express:</strong> Orders over $300 (2-4 business days).</li>
          <li><strong>Standard Flat Courier:</strong> $25 for orders under $300 (3-5 business days).</li>
          <li><strong>Customs & Import Taxes:</strong> All duties and taxes are prepaid by STORE at checkout. No unexpected fees upon arrival.</li>
        </ul>
      </div>
    </div>
  );
};

export default ShippingPage;
