import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { isAuthenticated } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface BottomItemProps {
  to: string;
  label: string;
  Icon: typeof Home;
  badge?: number;
}

function BottomItem({ to, label, Icon, badge }: BottomItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 text-[11px] font-medium transition-colors',
          isActive ? 'text-hack-black' : 'text-hack-black/55'
        )
      }
      end={to === '/'}
    >
      <span className="relative inline-flex">
        <Icon className="h-5 w-5" />
        {badge && badge > 0 ? (
          <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-hack-magenta px-1 text-[10px] font-bold text-white">
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
      </span>
      {label}
    </NavLink>
  );
}

export default function MobileBottomBar() {
  const { cartCount } = useStore();
  const accountTarget = isAuthenticated() ? '/account' : '/login';

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-hack-black/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="grid grid-cols-4">
        <BottomItem to="/" label="Home" Icon={Home} />
        <BottomItem to="/shop" label="Shop" Icon={ShoppingBag} />
        <BottomItem to="/cart" label="Cart" Icon={ShoppingCart} badge={cartCount} />
        <BottomItem to={accountTarget} label="Account" Icon={User} />
      </div>
    </nav>
  );
}
