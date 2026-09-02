import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../Components/Breadcrumbs';
import { useUserStore } from '../store/useUserStore';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const register = useUserStore((state) => state.register);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    register(formData);
    toast.success('Account created successfully!');
    navigate('/account');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16 space-y-6 sm:space-y-8">
      <Breadcrumbs items={[{ label: 'Register Account' }]} />

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white uppercase tracking-wider">Join STORE Privé</h1>
        <p className="text-xs text-white/50 font-light">Create your account for personalized recommendations & rewards.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-8 rounded-3xl bg-[#121216] border border-white/10 space-y-4">
        <div>
          <label className="text-xs font-semibold text-white/60 uppercase block mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c87d4a]"
            placeholder="Julian Vance"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-white/60 uppercase block mb-1">Email Address *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c87d4a]"
            placeholder="julian@example.com"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-white/60 uppercase block mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c87d4a]"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-white/60 uppercase block mb-1">Password *</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c87d4a]"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#c87d4a] hover:bg-[#d28a57] text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#c87d4a]/25 transition-all"
        >
          <span>Create Account</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-4 border-t border-white/10 text-center text-xs text-white/50">
          Already have an account?{' '}
          <Link to="/login" className="text-[#c87d4a] font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
