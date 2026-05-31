import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Leaf, Sparkles } from 'lucide-react';
import api from '../api/axios.js';
import ProductCard from '../components/ProductCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import SEO from '../components/SEO.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const heroImages = [
  '/images/products/golden-garden/1.webp',
  '/images/products/safari-bloom/1.webp',
  '/images/products/blooming-eve/1.webp',
];

export default function Home() {
  const { t, isArabic } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ['home-products'],
    queryFn: async () => (await api.get('/products?featured=true')).data,
  });

  const { data: categoryData } = useQuery({
    queryKey: ['home-categories'],
    queryFn: async () => (await api.get('/categories')).data,
  });

  const products = data?.products || [];
  const categories = categoryData?.categories?.filter((category) => category.showOnHome !== false) || [];

  return (
    <>
      <SEO
        title={isArabic ? 'ByJojo | مفروشات طاولة فاخرة' : 'ByJojo | Premium Table Linen'}
        description={
          isArabic
            ? 'مفروشات طاولة فاخرة بنقوش دافئة وألوان طبيعية ولمسة بوتيك مناسبة للضيافة والهدايا.'
            : 'Premium printed table linen with warm prints, natural colors, and a boutique finish for hosting, gifting, and beautiful everyday rituals.'
        }
        image="/images/products/golden-garden/1.webp"
      />

      <section className="relative min-h-[calc(100vh-112px)] overflow-hidden bg-charcoal">
        <img
          src="/images/products/golden-garden/1.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(47,48,40,0.78)_0%,rgba(47,48,40,0.58)_38%,rgba(47,48,40,0.22)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(185,154,91,0.24),transparent_32%)]" />

        <div className="container-soft relative grid min-h-[calc(100vh-112px)] items-center gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="byjojo-fade-up text-white">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-beige backdrop-blur">
              <Sparkles className="h-4 w-4" />
              {t('homeEyebrow')}
            </p>

            <h1 className="max-w-4xl font-serif text-6xl leading-[0.92] text-white md:text-7xl lg:text-8xl">
              {t('homeTitle')}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/76">
              {t('homeCopy')}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-bold shadow-[0_16px_35px_rgba(0,0,0,0.18)] transition hover:bg-beige"
                style={{ color: '#4F5B3A' }}
              >
                {t('shopCollection')}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-full border border-white/26 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur transition hover:bg-white"
                onMouseEnter={(event) => {
                  event.currentTarget.style.color = '#4F5B3A';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color = '#FFFFFF';
                }}
              >
                {t('readStory')}
              </Link>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-white/20 pt-6">
              {[t('homePillPrinted'), t('homePillSmall'), t('homePillPricing')].map((item) => (
                <p key={item} className="text-[11px] font-bold uppercase tracking-[0.16em] text-beige/86">
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="ml-auto max-w-md rounded-[36px] border border-white/18 bg-white/12 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.22)] backdrop-blur-md">
              <div className="grid grid-cols-2 gap-3">
                <img
                  src={heroImages[1]}
                  alt=""
                  className="h-64 w-full rounded-[26px] object-cover"
                />
                <img
                  src={heroImages[2]}
                  alt=""
                  className="mt-10 h-64 w-full rounded-[26px] object-cover"
                />
              </div>

              <div className="mt-3 rounded-[26px] border border-white/16 bg-white/12 p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-beige">
                  {t('newSeasonPieces')}
                </p>
                <p className="mt-2 font-serif text-3xl leading-tight">
                  {t('curatedWarmerTable')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-soft">
          <div className="mb-8">
            <p className="eyebrow">{t('categories')}</p>
            <h2 className="mt-3 font-serif text-4xl text-charcoal md:text-5xl">
              {t('categoriesTitle')}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {(categories.length ? categories : [
              { name: 'Printed Linen', nameAr: t('printedLinen'), image: '/images/categories/printed-linen.webp' },
              { name: 'Embroidery', nameAr: t('embroidery'), image: '/images/categories/embroidery.webp' },
            ]).map((category) => {
              const categoryName = isArabic ? category.nameAr || category.name : category.name;

              return (
                <Link
                  key={category._id || category.name}
                  to={`/shop?category=${encodeURIComponent(category.name)}`}
                  className="group overflow-hidden rounded-[32px] border border-sand bg-white shadow-[0_18px_55px_rgba(79,91,58,0.08)]"
                >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={category.image || '/images/categories/printed-linen.webp'}
                    alt={categoryName}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-charcoal/10 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-beige">
                      {t('category')}
                    </p>
                    <h3 className="mt-2 font-serif text-4xl text-white">
                      {categoryName}
                    </h3>
                    <p className="mt-3 inline-flex items-center gap-2 font-bold text-white">
                      {t('browse')}
                      <ArrowRight className="h-4 w-4" />
                    </p>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white/72 py-20">
        <div className="container-soft">
          <div className="mb-9 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t('featuredPieces')}</p>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-charcoal md:text-5xl">
                {t('featuredTitle')}
              </h2>
            </div>

            <Link to="/shop" className="hidden items-center gap-2 font-bold text-olive md:inline-flex">
              {t('viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="product-grid-animate grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 3).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-pad">
        <div className="container-soft grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">{t('brandStory')}</p>
            <h2 className="mt-3 font-serif text-5xl leading-tight text-charcoal">
              {t('brandStoryTitle')}
            </h2>
            <p className="mt-5 text-lg leading-8 text-charcoal/70">
              {t('brandStoryCopy')}
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-sand bg-white p-5">
                <Leaf className="h-7 w-7 text-sage" />
                <h3 className="mt-4 font-serif text-3xl text-charcoal">
                  {t('naturalPalette')}
                </h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/60">
                  {t('naturalPaletteCopy')}
                </p>
              </div>

              <div className="rounded-[28px] border border-sand bg-white p-5">
                <Sparkles className="h-7 w-7 text-gold" />
                <h3 className="mt-4 font-serif text-3xl text-charcoal">
                  {t('tableReady')}
                </h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/60">
                  {t('tableReadyCopy')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img src="/images/products/rose-elan/1.webp" alt="" className="h-80 w-full rounded-[32px] object-cover" />
            <img src="/images/products/olive-serenity/1.webp" alt="" className="mt-12 h-80 w-full rounded-[32px] object-cover" />
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-soft overflow-hidden rounded-[36px] bg-olive p-8 text-white md:p-12">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-beige">
                {t('readySetup')}
              </p>
              <h2 className="mt-3 font-serif text-5xl">
                {t('chooseSignature')}
              </h2>
            </div>

            <Link
              to="/shop"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 font-bold transition hover:bg-beige"
              style={{ color: '#4F5B3A' }}
            >
              {t('shopNow')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
