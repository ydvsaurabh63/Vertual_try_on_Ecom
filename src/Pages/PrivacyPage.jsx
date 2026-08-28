import React from 'react';
import Breadcrumbs from '../Components/Breadcrumbs';

const PrivacyPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
      <h1 className="text-3xl font-serif font-bold text-white">Privacy Policy</h1>
      <div className="p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-4 text-xs text-white/70 font-light leading-relaxed">
        <p>STORE respects your personal privacy. We collect personal information solely to process orders, improve fitting algorithms for Virtual Try-On, and deliver tailored customer concierge services.</p>
        <p>We use 256-bit SSL encryption to safeguard credit card transactions and data storage. We never sell your personal information to third party advertisers.</p>
      </div>
    </div>
  );
};

export default PrivacyPage;
