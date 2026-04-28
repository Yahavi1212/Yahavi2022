import { Home, ShoppingBag, Heart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { isAuthenticated } from '@/lib/auth';

const items = [
  { to: '/',                icon: Home,        label: 'Home' },
  { to: '/shop',            icon: ShoppingBag, label: 'Shop' },
  { to: '/account/wishlist', icon: Heart,       label: 'Wishlist', requiresAuth: true },
  { to: '/account',          icon: User,        label: 'Account' },
];

export default function MobileBottomBar() {
  const { state } = useStore();
  const location = useLocation();
  const authed = isAuthenticated();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur border-t border-hack-black/10"
      aria-label="Mobile navigation"
    >
      <ul className="grid grid-cols-4">
        {items.map(({ to, icon: Icon, label, requiresAuth }) => {
          const target = requiresAuth && !authed ? '/login' : to;
          const isActive = location.pathname === to;
          const showWishlistBadge = label === 'Wishlist' && state.wishlist.length > 0;
          return (
            <li key={label}>
              <Link
                to={target}
                className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-hack-magenta' : 'text-hack-black/70 hover:text-hack-black'
                }`}
              >
                <span className="relative">
                  <Icon className="w-5 h-5" />
                  {showWishlistBadge && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-hack-magenta text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {state.wishlist.length}
                    </span>
                  )}
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
