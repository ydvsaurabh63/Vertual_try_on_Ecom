import React, { useState } from 'react';
import Breadcrumbs from '../Components/Breadcrumbs';
import { useUserStore } from '../store/useUserStore';
import { MapPin, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const AddressesPage = () => {
  const { addresses, addAddress } = useUserStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    title: 'Secondary Address',
    fullName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.street) {
      toast.error('Please complete full name and street address');
      return;
    }
    addAddress({ ...newAddr, id: 'addr-' + Date.now() });
    setShowAddForm(false);
    toast.success('Address added successfully');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Account', path: '/account' }, { label: 'Addresses' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-3">
            <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-[#c87d4a]" />
            <span>Saved Shipping Addresses</span>
          </h1>
          <p className="text-xs text-white/50 mt-1 font-light">Manage delivery locations for express checkout.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#c87d4a] text-white text-xs font-bold uppercase tracking-wider self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Address</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="p-5 sm:p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase">New Delivery Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={newAddr.fullName}
              onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Street Address"
              value={newAddr.street}
              onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
            />
            <input
              type="text"
              placeholder="City"
              value={newAddr.city}
              onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
            />
            <input
              type="text"
              placeholder="State / Zip"
              value={newAddr.zip}
              onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
            />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-emerald-500 text-white font-bold text-xs rounded-xl">
            Save Address
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <div key={addr.id} className="p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-2 relative">
            {addr.isDefault && (
              <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Default Address
              </span>
            )}
            <h4 className="font-bold text-white text-base">{addr.title}</h4>
            <p className="text-xs text-white/80 font-medium">{addr.fullName}</p>
            <p className="text-xs text-white/50">{addr.street}, {addr.city}, {addr.state} {addr.zip}</p>
            <p className="text-xs text-white/50">{addr.country}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressesPage;
