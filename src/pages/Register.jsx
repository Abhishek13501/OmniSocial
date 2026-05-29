import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

const Register = () => {
  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setLocalError('Please complete all form fields.');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    try {
      await register(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-darkbg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow flares */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.03)_0%,transparent_60%)] pointer-events-none" />
      
      {/* Back button */}
      <div className="absolute top-6 left-6">
        <Link 
          to="/" 
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand logo */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-sans">
            Omni<span className="text-accent-gradient">Social</span>
          </span>
        </Link>
        
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Get started for free
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Create an account to build automated social media copies.
        </p>
      </div>

      {/* Main card container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  disabled={isSubmitting}
                  className="w-full bg-darkbg border border-darkborder focus:border-brand-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors disabled:opacity-50"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  disabled={isSubmitting}
                  className="w-full bg-darkbg border border-darkborder focus:border-brand-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors disabled:opacity-50"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  disabled={isSubmitting}
                  className="w-full bg-darkbg border border-darkborder focus:border-brand-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors disabled:opacity-50"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
              </div>
            </div>

            {/* Error notifications */}
            {displayError && (
              <div className="text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl flex items-start gap-2 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{displayError}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-sm justify-center glow-border mt-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Registering Account...</span>
                </div>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          {/* Login redirection link */}
          <div className="mt-6 border-t border-darkborder/60 pt-5 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
