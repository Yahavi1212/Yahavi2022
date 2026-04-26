import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Simple auth check - in production, verify JWT token from localStorage or cookie
const isAuthenticated = (): boolean => {
  // Check if user token exists in localStorage
  const token = localStorage.getItem('hackknow-auth-token');
  const user = localStorage.getItem('hackknow-user');
  return !!(token && user);
};

export const logout = () => {
  localStorage.removeItem('hackknow-auth-token');
  localStorage.removeItem('hackknow-user');
  localStorage.removeItem('hackknow-cart');
  window.location.href = '/';
};

export const login = (token: string, user: object) => {
  localStorage.setItem('hackknow-auth-token', token);
  localStorage.setItem('hackknow-user', JSON.stringify(user));
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('hackknow-user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check auth status
    const auth = isAuthenticated();
    setIsAuth(auth);
  }, []);

  // Show loading while checking
  if (isAuth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hack-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-hack-yellow animate-spin mx-auto mb-4" />
          <p className="text-white/60">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuth) {
    // Redirect to WordPress login with return URL
    const returnUrl = encodeURIComponent(location.pathname);
    window.location.href = `https://shop.hackknow.com/my-account?redirect_to=${returnUrl}`;
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
