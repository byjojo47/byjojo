import { Link, NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Boxes, Home, Layers3, LogOut, Settings, ShoppingBag, Tags, TicketPercent, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const links = [
  { to: '/admin', label: 'Overview', icon: BarChart3, end: true },
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/categories', label: 'Categories', icon: Layers3 },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/offers', label: 'Offers', icon: Tags },
  { to: '/admin/discount-codes', label: 'Discount Codes', icon: TicketPercent },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const { t, toggleLanguage } = useLanguage();
  const itemClass = ({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
    isActive
      ? 'bg-olive !text-white shadow-[0_14px_30px_rgba(79,91,58,0.22)] [&_svg]:text-white'
      : 'text-charcoal/68 hover:bg-beige/70 hover:text-olive'
  }`;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FAF7EF_0%,#F1E8D8_100%)] text-charcoal lg:grid lg:grid-cols-[292px_1fr]">
      <aside className="border-b border-sand/80 bg-white/82 p-4 shadow-[18px_0_60px_rgba(79,91,58,0.08)] backdrop-blur-xl lg:sticky lg:top-0 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="rounded-[28px] border border-sand bg-ivory p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-serif text-4xl leading-none text-olive">ByJojo</h1>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">{t('adminStudio')}</p>
            </div>
            <button type="button" onClick={logout} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand text-olive transition hover:bg-white lg:hidden" aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-5 text-sm leading-6 text-charcoal/62">{user?.fullName || 'Store owner'} can manage products, categories, orders, offers, and checkout settings here.</p>
        </div>

        <nav className="mt-5 grid gap-2">
          <Link to="/" className="mb-2 flex items-center gap-3 rounded-2xl border border-sand bg-white px-4 py-3 text-sm font-bold text-olive transition hover:border-olive hover:bg-ivory">
            <Home className="h-4 w-4" />
            {t('viewStorefront')}
          </Link>
          <button type="button" onClick={toggleLanguage} className="mb-2 flex items-center gap-3 rounded-2xl border border-sand bg-white px-4 py-3 text-left text-sm font-bold text-olive transition hover:border-olive hover:bg-ivory">
            {t('language')}
          </button>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={itemClass}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <button type="button" onClick={logout} className="mt-7 hidden w-full items-center justify-center gap-2 rounded-2xl border border-sand bg-white px-4 py-3 text-sm font-bold text-olive transition hover:border-olive lg:flex">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <main className="min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
