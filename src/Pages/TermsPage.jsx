import React from 'react';
import Breadcrumbs from '../Components/Breadcrumbs';

const TermsPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Terms of Service' }]} />
      <h1 className="text-3xl font-serif font-bold text-white">Terms of Service</h1>
      <div className="p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-4 text-xs text-white/70 font-light leading-relaxed">
        <p>By accessing the STORE website, you agree to comply with our terms of service. All editorial images, product photography, and 3D Virtual Try-On models are trademarked property of STORE.</p>
        <p>Prices and product availability are subject to change without notice. All luxury orders are fulfilled in accordance with European and international trade standards.</p>
      </div>
    </div>
  );
};

export default TermsPage;
