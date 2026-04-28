import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Zap, ArrowRight, Mail, Lock } from 'lucide-react';
import { loginWithWordPress } from '@/lib/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      await loginWithWordPress(email, password);
      navigate('/account');
    } catch (err) {
      console.error('Login failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not sign in. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hack-black via-hack-black to-hack-magenta/20 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-hack-yellow/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-hack-magenta/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-hack-yellow to-hack-orange flex items-center justify-center shadow-lg shadow-hack-yellow/20 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-hack-black" />
            </div>
            <span className="font-display font-bold text-2xl text-white">HACKKNOW</span>
          </Link>
          <p className="text-white/60 mt-2 text-sm">Welcome back to the marketplace</p>
        </div>

        {/* Neumorphism Card */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
          <h1 className="font-display font-bold text-2xl text-white text-center mb-6">
            Sign In
          </h1>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm text-white/80 font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-hack-yellow" />
                Email
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourdomain.com"
                  className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12 pl-4 focus:border-hack-yellow focus:ring-1 focus:ring-hack-yellow"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm text-white/80 font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-hack-yellow" />
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12 pl-4 pr-12 focus:border-hack-yellow focus:ring-1 focus:ring-hack-yellow"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link to="/support" className="text-sm text-hack-yellow hover:text-hack-orange transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-hack-yellow to-hack-orange hover:from-hack-orange hover:to-hack-magenta text-hack-black font-bold rounded-xl transition-all duration-300 shadow-lg shadow-hack-yellow/20 hover:shadow-hack-magenta/20"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-white/60 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-hack-yellow hover:text-hack-orange font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 mt-8 text-sm text-white/40">
          <Link to="/support" className="hover:text-white transition-colors">Help</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
