import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <>
      <SEO title="Page not found" noIndex />

      <section className="container-soft section-pad text-center">
        <h1 className="page-title">{t('notFoundTitle')}</h1>
        <p className="mx-auto mt-4 max-w-lg text-charcoal/70">{t('notFoundCopy')}</p>
        <Link to="/shop" className="btn-primary mt-8">{t('goToShop')}</Link>
      </section>
    </>
  );
}