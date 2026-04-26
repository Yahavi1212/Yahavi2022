import type { FC } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, Mail, Lock, User, Chrome, ArrowLeft } from 'lucide-react';

const SignupPage: FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleGoogleSignIn = () => {
    // Redirect to WordPress Google Auth or implement Firebase Auth
    // For now, redirecting to WordPress login which can have Google Auth plugin
    window.location.href = 'https://shop.hackknow.com/wp-login.php?action=google_auth';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
    console.log('Form submitted:', formData);
    // Redirect to WordPress registration
    window.location.href = `https://shop.hackknow.com/my-account?action=register&email=${encodeURIComponent(formData.email)}&phone=${encodeURIComponent(formData.phone)}`;
  };

  return (
    <div className="min-h-screen bg-hack-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <Link to="/" className="inline-flex items-center gap-2 text-hack-yellow hover:text-hack-orange mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="bg-white border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-hack-yellow to-hack-orange rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-hack-black" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Join 50,000+ creators on HackKnow
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google Sign In */}
            <Button 
              type="button"
              variant="outline" 
              className="w-full h-12 border-gray-300 hover:bg-gray-50"
              onClick={handleGoogleSignIn}
            >
              <Chrome className="w-5 h-5 mr-2 text-blue-500" />
              Continue with Google
            </Button>

            <div className="relative">
              <Separator className="my-4" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                OR
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    className="pl-10"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    type="email"
                    className="pl-10"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  Phone Number *
                  <span className="text-xs text-gray-500 font-normal">(Required for order updates)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    type="tel"
                    className="pl-10"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    pattern="[\+]?[0-9\s\-\(\)]{10,}"
                    title="Please enter a valid phone number"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  We use this to send order updates and download links
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    type="password"
                    className="pl-10"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    type="password"
                    className="pl-10"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                  required
                />
                <label htmlFor="terms" className="text-xs text-gray-500">
                  I agree to the <Link to="/support" className="text-hack-magenta hover:underline">Terms of Service</Link> and{' '}
                  <Link to="/support" className="text-hack-magenta hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <Button 
                type="submit"
                className="w-full h-12 bg-hack-black hover:bg-hack-black/90 text-white font-bold"
                disabled={!agreeTerms || formData.password !== formData.confirmPassword}
              >
                Create Account
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-hack-magenta font-medium hover:underline">
                Sign In
              </Link>
            </p>
            <p className="text-xs text-gray-400">
              By signing up, you agree to receive order updates via email and SMS
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
