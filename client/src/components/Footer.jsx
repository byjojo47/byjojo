import {
  Mail,
  MessageCircle,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const BRAND_WHATSAPP = '+20 10 97796773';
const BRAND_INSTAGRAM = 'https://www.instagram.com/byjojoeg?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';

const footerCopy = {
  en: {
    tagline: 'Premium table linen for warm homes, thoughtful hosting, and beautiful everyday tables.',
    explore: 'Explore',
    support: 'Support',
    contact: 'Contact',
    quickLinks: [
      { to: '/', label: 'Home' },
      { to: '/shop', label: 'Shop' },
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
    ],
    supportLinks: [
      { to: '/care-guide', label: 'Care Guide' },
      { to: '/returns', label: 'Returns & Exchanges' },
      { to: '/privacy-policy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms & Conditions' },
      { to: '/my-orders', label: 'My Orders' },
    ],
    whatsappText: 'For orders, payment proof, delivery, and product questions.',
    emailFallback: 'Email not added yet',
    rights: 'All rights reserved.',
    madeFor: 'Made for warm homes and beautiful tables.',
  },
  ar: {
    tagline: 'مفروشات طاولة فاخرة لبيوت دافئة، ضيافة راقية، وطاولات جميلة كل يوم.',
    explore: 'تصفح',
    support: 'الدعم',
    contact: 'التواصل',
    quickLinks: [
      { to: '/', label: 'الرئيسية' },
      { to: '/shop', label: 'المتجر' },
      { to: '/about', label: 'من نحن' },
      { to: '/contact', label: 'تواصل معنا' },
    ],
    supportLinks: [
      { to: '/care-guide', label: 'دليل العناية' },
      { to: '/returns', label: 'الاستبدال والاسترجاع' },
      { to: '/privacy-policy', label: 'سياسة الخصوصية' },
      { to: '/terms', label: 'الشروط والأحكام' },
      { to: '/my-orders', label: 'طلباتي' },
    ],
    whatsappText: 'للطلبات، إثبات الدفع، التوصيل، وأسئلة المنتجات.',
    emailFallback: 'لم تتم إضافة البريد بعد',
    rights: 'جميع الحقوق محفوظة.',
    madeFor: 'مصممة لبيوت دافئة وطاولات جميلة.',
  },
};

function InstagramIcon() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <defs>
          <linearGradient id="instagram-icon-footer" x1="2" y1="22" x2="22" y2="2">
            <stop offset="0" stopColor="#f6c85f" />
            <stop offset="0.45" stopColor="#df5b6b" />
            <stop offset="0.75" stopColor="#b43ab8" />
            <stop offset="1" stopColor="#5f6edb" />
          </linearGradient>
        </defs>
        <rect x="4.5" y="4.5" width="15" height="15" rx="4.5" fill="none" stroke="url(#instagram-icon-footer)" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.4" fill="none" stroke="url(#instagram-icon-footer)" strokeWidth="2" />
        <circle cx="16.8" cy="7.2" r="1.2" fill="url(#instagram-icon-footer)" />
      </svg>
    </span>
  );
}

function whatsappLink(number) {
  const digits = String(number || BRAND_WHATSAPP).replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '#';
}

export default function Footer() {
  const { isArabic } = useLanguage();
  const c = isArabic ? footerCopy.ar : footerCopy.en;

  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get('/settings')).data,
  });

  const settings = data?.settings || {};
  const whatsapp = settings.whatsappNumber || BRAND_WHATSAPP;
  const instagram = settings.instagramUrl || BRAND_INSTAGRAM;
  const contactEmail = settings.contactEmail || '';

  return (
    <footer className="border-t border-sand bg-white">
      <div className="container-soft py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.9fr_1.1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/images/logo.webp"
                alt="ByJojo"
                className="h-12 w-12 rounded-2xl object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />

              <span>
                <span className="block font-serif text-3xl leading-none text-olive">
                  ByJojo
                </span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.28em] text-gold">
                  {isArabic ? 'مفروشات طاولة' : 'Table Linen'}
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-charcoal/62">
              {c.tagline}
            </p>
          </div>

          <FooterColumn title={c.explore} links={c.quickLinks} />

          <FooterColumn title={c.support} links={c.supportLinks} />

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-sage">
              {c.contact}
            </h3>

            <p className="mt-4 text-sm leading-6 text-charcoal/62">
              {c.whatsappText}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {contactEmail ? (
                <a
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand bg-ivory text-olive transition hover:border-olive hover:bg-white"
                  href={`mailto:${contactEmail}`}
                  aria-label={isArabic ? 'إيميل ByJojo' : 'Email ByJojo'}
                >
                  <Mail className="h-4 w-4" />
                </a>
              ) : (
                <span
                  className="inline-flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-sand bg-ivory text-charcoal/25"
                  aria-label={c.emailFallback}
                >
                  <Mail className="h-4 w-4" />
                </span>
              )}

              <a
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand bg-ivory transition hover:border-olive hover:bg-white"
                href={instagram}
                target="_blank"
                rel="noreferrer"
                aria-label={isArabic ? 'إنستجرام ByJojo' : 'ByJojo Instagram'}
              >
                <InstagramIcon />
              </a>

              <a
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand bg-ivory text-olive transition hover:border-olive hover:bg-white"
                href={whatsappLink(whatsapp)}
                target="_blank"
                rel="noreferrer"
                aria-label={isArabic ? 'واتساب ByJojo' : 'ByJojo WhatsApp'}
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col justify-between gap-3 border-t border-sand pt-5 text-sm text-charcoal/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} ByJojo. {c.rights}</p>
          <p>{c.madeFor}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-sage">
        {title}
      </h3>

      <div className="mt-4 grid gap-2.5">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group inline-flex w-fit items-center gap-1.5 text-sm text-charcoal/62 transition hover:text-olive"
          >
            <span>{item.label}</span>
            <ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  );
}
