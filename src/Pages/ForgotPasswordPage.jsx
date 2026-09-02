import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../Components/Breadcrumbs';
import { Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setSubmitted(true);
    toast.success('Password reset instructions sent to your email!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16 space-y-6 sm:space-y-8">
      <Breadcrumbs items={[{ label: 'Forgot Password' }]} />

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white uppercase tracking-wider">Reset Password</h1>
        <p className="text-xs text-white/50 font-light">Enter your email and we'll send you a password recovery link.</p>
      </div>

      {submitted ? (
        <div className="p-5 sm:p-8 rounded-3xl bg-[#121216] border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#c87d4a]/20 text-[#c87d4a] flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Check Your Inbox</h3>
          <p className="text-xs text-white/60">We sent instructions to <strong>{email}</strong>.</p>
          <Link to="/login" className="inline-block pt-2 text-xs font-bold text-[#c87d4a] hover:underline">
            Return to Sign In →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 rounded-3xl bg-[#121216] border border-white/10 space-y-4">
          <div>
            <label className="text-xs font-semibold text-white/60 uppercase block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c87d4a]"
              placeholder="name@example.com"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#c87d4a] hover:bg-[#d28a57] text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#c87d4a]/25 transition-all"
          >
            <span>Send Reset Instructions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
