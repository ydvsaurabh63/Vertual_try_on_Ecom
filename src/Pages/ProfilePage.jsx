import React, { useState } from 'react';
import Breadcrumbs from '../Components/Breadcrumbs';
import { useUserStore } from '../store/useUserStore';
import { User, Mail, Phone, Save, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateProfile } = useUserStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    toast.success('Profile information updated');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Account', path: '/account' }, { label: 'Edit Profile' }]} />

      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Personal Profile</h1>
        <p className="text-xs text-white/50 mt-1">Manage your account details and contact preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-[#121216] border border-white/10 space-y-6">
        <div>
          <label className="text-xs font-semibold text-white/60 uppercase block mb-1">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c87d4a]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-white/60 uppercase block mb-1">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c87d4a]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-white/60 uppercase block mb-1">Phone Number</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c87d4a]"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#c87d4a] hover:bg-[#d28a57] text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile Changes</span>
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
