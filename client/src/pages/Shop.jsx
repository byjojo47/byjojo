import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal } from 'lucide-react';
import api from '../api/axios.js';
import ProductCard from '../components/ProductCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SEO from '../components/SEO.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

function customerPrice(product) {
  return Number(product.finalPrice || product.offerPrice || product.price || 0);
}

export default function Shop() {
  const { t, isArabic } = useLanguage();
  const [params] = useSearchParams();
  const [category, setCategory] = useState(params.get('category') || 'all');
  const [sort, setSort] = useState('newest');

  const { data: productData, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/products')).data,
    refetchOnMount: 'always',
  });

  const { data: categoryData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data,
    refetchOnMount: 'always',
  });

  const products = productData?.products || [];
  const categories = categoryData?.categories || [];

  const visibleProducts = useMemo(() => {
    return [...products]
      .filter((product) => category === 'all' || product.category?.name === category)
      .sort((a, b) => {
        if (sort === 'price-low') return customerPrice(a) - customerPrice(b);
        if (sort === 'price-high') return customerPrice(b) - customerPrice(a);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [products, category, sort]);

  return (
    <>
      <SEO
        title={isArabic ? 'تسوقي مفروشات ByJojo' : 'Shop Premium Table Linen'}
        description={
          isArabic
            ? 'تسوقي مجموعة ByJojo من مفروشات الطاولة المطبوعة والتطريز بتصميمات دافئة وفاخرة.'
            : 'Shop ByJojo premium printed linen and embroidery pieces for elegant table styling, hosting, and gifting.'
        }
        image="/images/products/safari-bloom/1.webp"
      />

      <section className="section-pad">
        <div className="container-soft">
          <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <p className="eyebrow">{t('shopEyebrow')}</p>
              <h1 className="page-title mt-3">{t('shopTitle')}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/70">{t('shopCopy')}</p>
            </div>

            <div className="rounded-[28px] border border-sand bg-white/76 p-4 shadow-[0_18px_55px_rgba(79,91,58,0.08)]">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-sage">
                <SlidersHorizontal className="h-4 w-4" />
                {t('refine')}
              </div>

              <div className="grid gap-3">
                <select className="field rounded-full" value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="all">{t('allCategories')}</option>
                  {categories.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
                </select>

                <select className="field rounded-full" value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="newest">{t('newest')}</option>
                  <option value="price-low">{t('priceLow')}</option>
                  <option value="price-high">{t('priceHigh')}</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading && <LoadingSpinner />}
          {isError && <EmptyState title={t('productsLoadError')} message={t('backendHint')} />}
          {!isLoading && !isError && visibleProducts.length === 0 && <EmptyState title={t('noProductsFound')} message={t('tryAnotherFilter')} />}

          <div className="product-grid-animate grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </div>
      </section>
    </>
  );
}