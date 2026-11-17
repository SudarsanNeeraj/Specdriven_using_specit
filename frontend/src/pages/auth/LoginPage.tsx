import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Stethoscope, Mail, Lock, Phone, KeyRound, Loader2 } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [email, setEmail] = useState('rahul@gmail.com');
  const [password, setPassword] = useState('password123');
  const [phone, setPhone] = useState('+919876543210');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/otp/send', { phone });
      setOtpSent(true);
      alert('Demo OTP code is: 123456');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/otp/verify', { phone, code: otpCode });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setIsLoading(true);
    try {
      await switchDemoRole(role);
      if (role === 'PATIENT') navigate('/');
      else if (role === 'DOCTOR') navigate('/doctor/dashboard');
      else navigate('/admin/dashboard');
    } catch (err: any) {
      setError('Failed to switch role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Stethoscope className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Sign in to MedBooking</h1>
        <p className="text-xs text-slate-500 mt-1">Access appointments, doctor schedules, and medical records</p>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* Tabs: Password vs OTP */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold mb-5">
        <button
          type="button"
          onClick={() => setAuthMode('PASSWORD')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            authMode === 'PASSWORD' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'
          }`}
        >
          Email & Password
        </button>
        <button
          type="button"
          onClick={() => setAuthMode('OTP')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            authMode === 'OTP' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'
          }`}
        >
          Mobile OTP
        </button>
      </div>

      {authMode === 'PASSWORD' ? (
        <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm transition flex items-center justify-center text-xs"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="absolute right-1 top-1 px-2.5 py-1 bg-brand-50 text-brand-700 font-bold rounded-lg hover:bg-brand-100 text-[11px]"
              >
                {otpSent ? 'Resend' : 'Send Code'}
              </button>
            </div>
          </div>

          {otpSent && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">6-Digit Code (Enter 123456)</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 tracking-widest font-mono text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !otpSent}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm transition flex items-center justify-center text-xs"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code & Sign In'}
          </button>
        </form>
      )}

      {/* Quick Demo Personas */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
          One-Click Demo Test Accounts
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleQuickDemo('PATIENT')}
            className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-semibold"
          >
            Rahul (Patient)
          </button>
          <button
            onClick={() => handleQuickDemo('DOCTOR')}
            className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-semibold"
          >
            Dr. Sharma (Doctor)
          </button>
          <button
            onClick={() => handleQuickDemo('RECEPTIONIST')}
            className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-semibold"
          >
            Pooja (Receptionist)
          </button>
          <button
            onClick={() => handleQuickDemo('ADMIN')}
            className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-semibold"
          >
            Admin (Chief Admin)
          </button>
        </div>
      </div>

      <div className="mt-5 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-600 font-semibold hover:underline">
          Register new account
        </Link>
      </div>
    </div>
  );
};

