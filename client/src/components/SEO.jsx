import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

const SITE_NAME = 'ByJojo';
const DEFAULT_TITLE = 'ByJojo | Premium Table Linen';
const DEFAULT_DESCRIPTION = 'Premium printed linen and elegant table setup pieces for warm homes, thoughtful hosting, and beautiful everyday rituals.';
const DEFAULT_IMAGE = '/images/logo.webp';

function getPublicUrl() {
  const rawUrl = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;
  return rawUrl.replace(/\/$/, '');
}

function absoluteUrl(path = '/') {
  if (!path) return getPublicUrl();
  if (path.startsWith('http')) return path;
  return `${getPublicUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
}) {
  const { pathname } = useLocation();
  const { isArabic } = useLanguage();

  const canonicalUrl = absoluteUrl(pathname);
  const imageUrl = absoluteUrl(image);
  const finalTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <html lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'} />

      <title>{finalTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      <meta name="theme-color" content="#FAF7EF" />
    </Helmet>
  );
}