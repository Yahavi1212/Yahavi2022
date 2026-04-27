import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Bell,
  Bot,
  ChevronRight,
  Clock3,
  CreditCard,
  Download,
  Heart,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Mail,
  Package,
  Phone,
  ShieldCheck,
  Sparkles,
  Ticket,
  User,
} from 'lucide-react';
import { getCurrentUser, logout } from '@/components/AuthGuard';
import { useStore } from '@/context/StoreContext';

type AccountTab =
  | 'dashboard'
  | 'orders'
  | 'downloads'
  | 'wishlist'
  | 'support'
  | 'profile'
  | 'assistant';

const sidebarItems: Array<{ id: AccountTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'downloads', label: 'Downloads', icon: Download },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'support', label: 'Support', icon: LifeBuoy },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'assistant', label: 'AI Assistant', icon: Bot },
];

const mockOrders = [
  { id: 'HK-1042', status: 'Completed', total: '₹499', date: 'Apr 25, 2026', invoice: 'Ready' },
  { id: 'HK-1038', status: 'Processing', total: '₹299', date: 'Apr 24, 2026', invoice: 'Pending' },
];

const mockDownloads = [
  { name: 'Premium PowerPoint Templates Pack', updated: 'Version 2.1', license: 'Single-use', action: 'Download' },
  { name: 'HR Dashboard Excel Template', updated: 'Version 1.4', license: 'Commercial', action: 'Download' },
  { name: 'Agency Pro WordPress Theme', updated: 'Version 3.0', license: 'Lifetime', action: 'Download' },
];

const supportCards = [
  { title: 'Raise Ticket', copy: 'Report product issues or billing questions.', icon: Ticket },
  { title: 'FAQ & Help', copy: 'Open the support center for installation and policy help.', icon: LifeBuoy },
  { title: 'Refund Request', copy: 'Start a refund conversation with your order ID ready.', icon: CreditCard },
];

const aiPrompts = [
  'Find me a better dashboard for finance tracking',
  'Show my latest downloads',
  'Recommend products similar to my last order',
];

function brutalCard(extra = '') {
  return `border-4 border-hack-black bg-white p-5 shadow-[6px_6px_0_#1a1a1a] ${extra}`.trim();
}

export default function UserProfilePage() {
  const currentUser = getCurrentUser();
  const { state } = useStore();
  const [activeTab, setActiveTab] = useState<AccountTab>('dashboard');

  const user = currentUser ?? {
    name: 'Hackknow Member',
    email: 'member@hackknow.com',
    phone: '+91 00000 00000',
    joinedDate: 'April 2026',
    isVerified: true,
  };

  const wishlistProducts = useMemo(
    () => state.products.filter((product) => state.wishlist.includes(product.id)).slice(0, 6),
    [state.products, state.wishlist]
  );

  const recommendedProducts = useMemo(() => state.products.slice(0, 4), [state.products]);
  const recentProducts = useMemo(() => state.products.slice(4, 8), [state.products]);

  const renderDashboard = () => (
    <div className="space-y-6">
      <section className={brutalCard('bg-hack-yellow')}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-hack-black/70">
          Dashboard Home
        </p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-4xl font-bold uppercase text-hack-black">
              Welcome back, {String(user.name).split(' ')[0]}.
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium text-hack-black/75">
              This is the main user zone after signup. Orders, downloads, support, wishlist, and
              Yahavi AI are all reachable from here.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border-4 border-hack-black bg-white px-4 py-3 shadow-[4px_4px_0_#ff56f0]">
              <p className="text-xs font-bold uppercase">Orders</p>
              <p className="mt-2 text-2xl font-bold">{mockOrders.length}</p>
            </div>
            <div className="border-4 border-hack-black bg-white px-4 py-3 shadow-[4px_4px_0_#ff56f0]">
              <p className="text-xs font-bold uppercase">Downloads</p>
              <p className="mt-2 text-2xl font-bold">{mockDownloads.length}</p>
            </div>
            <div className="border-4 border-hack-black bg-white px-4 py-3 shadow-[4px_4px_0_#ff56f0]">
              <p className="text-xs font-bold uppercase">Wishlist</p>
              <p className="mt-2 text-2xl font-bold">{state.wishlist.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className={brutalCard()}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-hack-magenta">
                Recent Activity
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold uppercase">What changed lately</h3>
            </div>
            <Clock3 className="h-6 w-6" />
          </div>
          <div className="mt-5 space-y-3">
            {[
              'Account created and dashboard unlocked',
              'WordPress-backed downloads are ready to be connected next',
              'Your support and profile options are live in this panel',
            ].map((item, index) => (
              <div key={item} className="flex items-start gap-3 border-4 border-hack-black bg-hack-white px-4 py-3">
                <span className="inline-flex h-7 w-7 items-center justify-center bg-hack-black font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-sm font-semibold text-hack-black">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={brutalCard('bg-hack-black text-white shadow-[6px_6px_0_#fff055]')}>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-hack-yellow">
            Latest Offers
          </p>
          <h3 className="mt-2 font-display text-2xl font-bold uppercase">Fast wins for this week</h3>
          <div className="mt-5 space-y-3">
            {[
              'New arrival bundles added to shop',
              'Download center now pinned in sidebar',
              'Tech Blogs & News live on hackknow.space',
            ].map((item) => (
              <div key={item} className="border-4 border-hack-white bg-hack-magenta px-4 py-3 text-sm font-bold text-hack-black">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={brutalCard()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-hack-magenta">
              Recommended Products
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold uppercase">Suggested for you</h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('assistant')}
            className="inline-flex items-center gap-2 border-4 border-hack-black bg-hack-yellow px-4 py-2 text-sm font-bold uppercase shadow-[4px_4px_0_#ff56f0]"
          >
            Ask Yahavi AI
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {recommendedProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className="border-4 border-hack-black bg-hack-white p-4 shadow-[4px_4px_0_#fff055] transition-transform hover:-translate-y-1"
            >
              <p className="text-xs font-bold uppercase text-hack-magenta">{product.category}</p>
              <h4 className="mt-2 font-display text-lg font-bold uppercase text-hack-black">{product.name}</h4>
              <p className="mt-3 text-sm font-semibold text-hack-black/70">{product.price || 'Price on request'}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={brutalCard()}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-hack-magenta">
          Latest Products
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {recentProducts.map((product) => (
            <div key={product.id} className="border-4 border-hack-black bg-hack-yellow/35 p-4">
              <h4 className="font-display text-lg font-bold uppercase">{product.name}</h4>
              <p className="mt-2 text-sm font-semibold text-hack-black/70">{product.shortDescription || product.category}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-5">
      <section className={brutalCard('bg-hack-yellow')}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em]">My Orders</p>
        <h2 className="mt-2 font-display text-3xl font-bold uppercase">Order history and status</h2>
      </section>
      {mockOrders.map((order) => (
        <div key={order.id} className={brutalCard()}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase text-hack-magenta">{order.id}</p>
              <h3 className="mt-2 font-display text-2xl font-bold uppercase">{order.status}</h3>
              <p className="mt-2 text-sm font-medium text-hack-black/70">Placed on {order.date}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border-4 border-hack-black bg-hack-white px-4 py-3 text-sm font-bold">Total: {order.total}</div>
              <div className="border-4 border-hack-black bg-hack-white px-4 py-3 text-sm font-bold">Invoice: {order.invoice}</div>
              <button className="border-4 border-hack-black bg-hack-black px-4 py-3 text-sm font-bold uppercase text-white">
                View Order
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDownloads = () => (
    <div className="space-y-5">
      <section className={brutalCard('bg-hack-yellow')}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em]">Downloads</p>
        <h2 className="mt-2 font-display text-3xl font-bold uppercase">Re-download anytime</h2>
      </section>
      {mockDownloads.map((download) => (
        <div key={download.name} className={brutalCard()}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold uppercase">{download.name}</h3>
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
                <span className="border-4 border-hack-black bg-hack-yellow px-3 py-1">{download.updated}</span>
                <span className="border-4 border-hack-black bg-hack-white px-3 py-1">{download.license}</span>
              </div>
            </div>
            <button className="border-4 border-hack-black bg-hack-black px-5 py-3 text-sm font-bold uppercase text-white">
              {download.action}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderWishlist = () => (
    <div className="space-y-5">
      <section className={brutalCard('bg-hack-yellow')}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em]">Wishlist</p>
        <h2 className="mt-2 font-display text-3xl font-bold uppercase">Saved for later</h2>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(wishlistProducts.length ? wishlistProducts : recommendedProducts.slice(0, 3)).map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.slug}`}
            className="border-4 border-hack-black bg-white p-4 shadow-[4px_4px_0_#ff56f0] transition-transform hover:-translate-y-1"
          >
            <p className="text-xs font-bold uppercase text-hack-magenta">{product.category}</p>
            <h3 className="mt-2 font-display text-xl font-bold uppercase">{product.name}</h3>
            <p className="mt-2 text-sm font-semibold text-hack-black/70">{product.price || 'Free'}</p>
          </Link>
        ))}
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-5">
      <section className={brutalCard('bg-hack-yellow')}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em]">Support Center</p>
        <h2 className="mt-2 font-display text-3xl font-bold uppercase">Help, tickets, refunds</h2>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {supportCards.map(({ title, copy, icon: Icon }) => (
          <div key={title} className={brutalCard()}>
            <Icon className="h-7 w-7" />
            <h3 className="mt-4 font-display text-xl font-bold uppercase">{title}</h3>
            <p className="mt-3 text-sm font-medium text-hack-black/70">{copy}</p>
          </div>
        ))}
      </div>
      <div className={brutalCard('bg-hack-black text-white shadow-[6px_6px_0_#fff055]')}>
        <h3 className="font-display text-2xl font-bold uppercase">Quick support options</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/support" className="border-4 border-hack-white bg-white px-4 py-2 text-sm font-bold uppercase text-hack-black">
            FAQ
          </Link>
          <a href="mailto:support@hackknow.com" className="border-4 border-hack-white bg-hack-magenta px-4 py-2 text-sm font-bold uppercase text-hack-black">
            Email Support
          </a>
          <button className="border-4 border-hack-white bg-hack-yellow px-4 py-2 text-sm font-bold uppercase text-hack-black">
            Refund Request
          </button>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-5">
      <section className={brutalCard('bg-hack-yellow')}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em]">My Account</p>
        <h2 className="mt-2 font-display text-3xl font-bold uppercase">Profile and billing basics</h2>
      </section>
      <div className={brutalCard()}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border-4 border-hack-black bg-hack-white p-4">
            <p className="text-xs font-bold uppercase text-hack-magenta">Name</p>
            <p className="mt-2 text-lg font-bold">{user.name}</p>
          </div>
          <div className="border-4 border-hack-black bg-hack-white p-4">
            <p className="text-xs font-bold uppercase text-hack-magenta">Email</p>
            <p className="mt-2 text-lg font-bold">{user.email}</p>
          </div>
          <div className="border-4 border-hack-black bg-hack-white p-4">
            <p className="text-xs font-bold uppercase text-hack-magenta">Phone</p>
            <p className="mt-2 text-lg font-bold">{user.phone}</p>
          </div>
          <div className="border-4 border-hack-black bg-hack-white p-4">
            <p className="text-xs font-bold uppercase text-hack-magenta">Member Since</p>
            <p className="mt-2 text-lg font-bold">{user.joinedDate}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className={brutalCard()}>
          <Mail className="h-6 w-6" />
          <h3 className="mt-4 font-display text-xl font-bold uppercase">Email & contact</h3>
          <p className="mt-2 text-sm font-medium text-hack-black/70">Keep order updates and support replies on the right inbox.</p>
        </div>
        <div className={brutalCard()}>
          <ShieldCheck className="h-6 w-6" />
          <h3 className="mt-4 font-display text-xl font-bold uppercase">Security</h3>
          <p className="mt-2 text-sm font-medium text-hack-black/70">Password, sessions, and future 2FA can live here.</p>
        </div>
        <div className={brutalCard()}>
          <Phone className="h-6 w-6" />
          <h3 className="mt-4 font-display text-xl font-bold uppercase">Billing basics</h3>
          <p className="mt-2 text-sm font-medium text-hack-black/70">Billing details and checkout defaults can be added here later.</p>
        </div>
      </div>
    </div>
  );

  const renderAssistant = () => (
    <div className="space-y-5">
      <section className={brutalCard('bg-hack-yellow')}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em]">Yahavi AI</p>
        <h2 className="mt-2 font-display text-3xl font-bold uppercase">Ask for product help fast</h2>
      </section>
      <div className={brutalCard('bg-hack-black text-white shadow-[6px_6px_0_#fff055]')}>
        <p className="text-sm font-medium text-white/80">
          This panel is the starter shell for product discovery, download help, support prompts,
          and recommendations.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {aiPrompts.map((prompt) => (
            <button
              key={prompt}
              className="border-4 border-hack-white bg-white px-4 py-4 text-left text-sm font-bold text-hack-black shadow-[4px_4px_0_#ff56f0]"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Sparkles, title: 'Find products', copy: 'Match tools, templates, and kits to the user need.' },
          { icon: Download, title: 'Download help', copy: 'Guide users to files, versions, and updates.' },
          { icon: Bell, title: 'Issue solving', copy: 'Surface next action for refunds, support, and bugs.' },
        ].map(({ icon: Icon, title, copy }) => (
          <div key={title} className={brutalCard()}>
            <Icon className="h-6 w-6" />
            <h3 className="mt-4 font-display text-xl font-bold uppercase">{title}</h3>
            <p className="mt-2 text-sm font-medium text-hack-black/70">{copy}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return renderOrders();
      case 'downloads':
        return renderDownloads();
      case 'wishlist':
        return renderWishlist();
      case 'support':
        return renderSupport();
      case 'profile':
        return renderProfile();
      case 'assistant':
        return renderAssistant();
      case 'dashboard':
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-hack-white pb-12">
      <div className="border-b-4 border-hack-black bg-hack-black text-white">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-white/65">
            <Link to="/" className="hover:text-hack-yellow">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">My Account</span>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-6 xl:self-start">
            <div className="border-4 border-hack-black bg-hack-yellow p-5 shadow-[8px_8px_0_#1a1a1a]">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-hack-black/70">
                Account Zone
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold uppercase text-hack-black">
                {String(user.name).split(' ')[0]}'s panel
              </h1>
              <div className="mt-5 grid gap-3">
                <div className="border-4 border-hack-black bg-white px-4 py-3">
                  <p className="text-xs font-bold uppercase text-hack-magenta">Email</p>
                  <p className="mt-2 text-sm font-bold">{user.email}</p>
                </div>
                <div className="border-4 border-hack-black bg-white px-4 py-3">
                  <p className="text-xs font-bold uppercase text-hack-magenta">Phone</p>
                  <p className="mt-2 text-sm font-bold">{user.phone}</p>
                </div>
              </div>
            </div>

            <nav className="mt-6 border-4 border-hack-black bg-white p-4 shadow-[8px_8px_0_#ff56f0]">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-hack-magenta">
                Main User Options
              </p>
              <div className="mt-4 space-y-3">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex w-full items-center justify-between border-4 px-4 py-3 text-left text-sm font-bold uppercase transition-transform hover:-translate-y-1 ${
                        active
                          ? 'border-hack-black bg-hack-yellow text-hack-black shadow-[4px_4px_0_#1a1a1a]'
                          : 'border-hack-black bg-white text-hack-black'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 border-t-4 border-hack-black pt-4">
                <button
                  onClick={logout}
                  className="flex w-full items-center justify-between border-4 border-hack-black bg-hack-black px-4 py-3 text-left text-sm font-bold uppercase text-white"
                >
                  <span className="flex items-center gap-3">
                    <LogOut className="h-5 w-5" />
                    Logout
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </nav>

            <div className="mt-6 border-4 border-hack-black bg-hack-magenta p-4 shadow-[6px_6px_0_#1a1a1a]">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-hack-black/70">
                Top Must-Have
              </p>
              <ul className="mt-3 space-y-2 text-sm font-bold uppercase text-hack-black">
                <li>Dashboard</li>
                <li>Orders</li>
                <li>Downloads</li>
                <li>Support</li>
                <li>Profile</li>
                <li>Wishlist</li>
                <li>AI Assistant</li>
              </ul>
            </div>
          </aside>

          <main>{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}
