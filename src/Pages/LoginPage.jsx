import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../Components/Breadcrumbs';
import { useUserStore } from '../store/useUserStore';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);

  const [email, setEmail] = useState('alexander@example.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    login(email, password);
    toast.success('Welcome back to STORE Privé!');
    navigate('/account');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16 space-y-6 sm:space-y-8">
      <Breadcrumbs items={[{ label: 'Sign In' }]} />

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white uppercase tracking-wider">STORE Privé</h1>
        <p className="text-xs text-white/50 font-light">Sign in to access your personal wardrobe & orders.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-8 rounded-3xl bg-[#121216] border border-white/10 space-y-5">
        <div>
          <label className="text-xs font-semibold text-white/60 uppercase block mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c87d4a]"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-white/60 uppercase block">Password</label>
            <Link to="/forgot-password" className="text-[10px] text-[#c87d4a] hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c87d4a]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#c87d4a] hover:bg-[#d28a57] text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#c87d4a]/25 transition-all"
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-4 border-t border-white/10 text-center text-xs text-white/50">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#c87d4a] font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
