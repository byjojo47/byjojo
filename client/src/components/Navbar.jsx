import { Link, NavLink } from 'react-router-dom';
import { Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import api from '../api/axios.js';

const navItems = [
  { to: '/', key: 'home' },
  { to: '/shop', key: 'shop' },
  { to: '/about', key: 'about' },
  { to: '/contact', key: 'contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { t, toggleLanguage } = useLanguage();
  const { data } = useQuery({ queryKey: ['settings'], queryFn: async () => (await api.get('/settings')).data });
  const announcement = data?.settings?.announcementText;
  const navClass = ({ isActive }) => `relative text-sm font-bold transition after:absolute after:-bottom-2 after:left-0 after:h-px after:bg-olive after:transition-all ${isActive ? 'text-olive after:w-full' : 'text-charcoal/62 after:w-0 hover:text-olive hover:after:w-full'}`;

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-sand/70 bg-ivory/90 shadow-[0_18px_55px_rgba(79,91,58,0.07)] backdrop-blur-xl">
      {announcement && (
        <div className="border-b border-sand/60 bg-olive px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-ivory sm:text-[11px] sm:tracking-[0.24em]">
          {announcement}
        </div>
      )}
      <div className="container-soft flex h-20 items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-3" onClick={closeMenu}>
          <img src="/images/logo.webp" alt="ByJojo" className="h-12 w-12 rounded-2xl object-cover shadow-sm" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
          <span className="leading-none">
            <span className="block font-serif text-3xl text-olive">ByJojo</span>
            <span className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.35em] text-gold sm:block">{t('tableLinen')}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => <NavLink key={item.to} to={item.to} className={navClass}>{t(item.key)}</NavLink>)}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/my-orders" className="inline-flex items-center gap-2 rounded-full border border-sand bg-white/70 px-4 py-2 text-sm font-bold text-charcoal transition hover:border-sage hover:bg-white"><UserRound className="h-4 w-4" /> {t('orders')}</Link>
              {user.role === 'admin' && <Link to="/admin" className="inline-flex rounded-full border border-sand bg-white/70 px-4 py-2 text-sm font-bold text-charcoal transition hover:border-sage hover:bg-white">{t('admin')}</Link>}
              <button type="button" onClick={logout} className="text-sm font-bold text-olive">{t('logout')}</button>
            </>
          ) : (
            <Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-sand bg-white/70 px-4 py-2 text-sm font-bold text-charcoal transition hover:border-sage hover:bg-white"><UserRound className="h-4 w-4" /> {t('login')}</Link>
          )}
          <button type="button" onClick={toggleLanguage} className="rounded-full border border-sand bg-white/70 px-4 py-2 text-sm font-bold text-olive transition hover:border-sage hover:bg-white">{t('language')}</button>
          <CartButton count={count} label={t('cart')} />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button type="button" onClick={toggleLanguage} className="inline-flex h-11 items-center justify-center rounded-full border border-sand bg-white px-3 text-sm font-bold text-olive transition hover:border-sage" aria-label={t('language')}>
            {t('language')}
          </button>
          <CartButton count={count} label={t('cart')} />
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sand bg-white text-olive" onClick={() => setOpen((value) => !value)} aria-label={t('toggleMenu')}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-92px)] overflow-y-auto border-t border-sand bg-ivory px-4 py-5 shadow-[0_20px_60px_rgba(79,91,58,0.12)] md:hidden">
          <div className="container-soft grid gap-3 px-0">
            {navItems.map((item) => <NavLink key={item.to} to={item.to} onClick={closeMenu} className="rounded-2xl border border-sand bg-white/70 px-4 py-3 font-bold text-charcoal/75">{t(item.key)}</NavLink>)}
            <Link to="/cart" onClick={closeMenu} className="rounded-2xl border border-sand bg-white/70 px-4 py-3 font-bold text-olive">{t('cart')} ({count})</Link>
            {user && <Link to="/my-orders" onClick={closeMenu} className="rounded-2xl border border-sand bg-white/70 px-4 py-3 font-bold text-olive">{t('orders')}</Link>}
            {user?.role === 'admin' && <Link to="/admin" onClick={closeMenu} className="rounded-2xl border border-sand bg-white/70 px-4 py-3 font-bold text-olive">{t('admin')}</Link>}
            {user ? <button type="button" onClick={() => { logout(); closeMenu(); }} className="rounded-2xl border border-sand bg-white/70 px-4 py-3 text-left font-bold text-olive">{t('logout')}</button> : <Link to="/login" onClick={closeMenu} className="rounded-2xl border border-sand bg-white/70 px-4 py-3 font-bold text-olive">{t('login')}</Link>}
          </div>
        </div>
      )}
    </header>
  );
}

function CartButton({ count, label }) {
  return (
    <Link to="/cart" className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-olive text-white shadow-[0_12px_25px_rgba(79,91,58,0.18)] transition hover:bg-charcoal" aria-label={label}>
      <ShoppingBag className="h-5 w-5 text-white" />
      {count > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-gold px-1.5 text-center text-xs font-bold text-white">{count}</span>}
    </Link>
  );
}
