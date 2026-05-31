import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Tag } from 'lucide-react';
import api from '../api/axios.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SEO from '../components/SEO.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getProductDisplay } from '../lib/productLocalization.js';

function offerLabel(product, isArabic) {
  const offer = product?.activeOffer;

  if (!offer) return isArabic ? 'عرض خاص' : 'Special offer';

  if (offer.discountType === 'percentage') {
    return isArabic ? `خصم ${offer.discountValue}%` : `${offer.discountValue}% off`;
  }

  if (offer.discountType === 'fixed') {
    return isArabic
      ? `خصم ${Number(offer.discountValue || 0).toLocaleString('ar-EG')} جنيه`
      : `${Number(offer.discountValue || 0).toLocaleString()} EGP off`;
  }

  return isArabic ? 'سعر خاص' : 'Sale price';
}

function stockText(stock, isArabic) {
  if (stock < 1) return isArabic ? 'غير متاح حالياً' : 'Currently out of stock';
  if (stock <= 3) return isArabic ? `متبقي ${stock} فقط` : `Only ${stock} left`;
  return isArabic ? 'متاح للطلب' : 'Available to order';
}

export default function ProductDetails() {
  const { t, isArabic } = useLanguage();
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => (await api.get(`/products/${slug}`)).data,
  });

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/products')).data,
  });

  const product = data?.product;
  const products = productsData?.products || [];

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const sameCategory = products
      .filter((item) => item._id !== product._id && item.category?._id === product.category?._id);

    const fallback = products
      .filter((item) => item._id !== product._id && !sameCategory.some((same) => same._id === item._id));

    return [...sameCategory, ...fallback].slice(0, 3);
  }, [products, product]);

  const images = product?.images || [];
  const showArrows = images.length > 1;
  const display = getProductDisplay(product, isArabic);
  const stock = Number(product?.stock || 0);
  const hasStock = stock > 0;
  const canIncrease = hasStock && quantity < stock;

  const goToPreviousImage = () => setActiveImage((current) => (current === 0 ? images.length - 1 : current - 1));
  const goToNextImage = () => setActiveImage((current) => (current === images.length - 1 ? 0 : current + 1));
  const decreaseQuantity = () => setQuantity((current) => Math.max(1, current - 1));
  const increaseQuantity = () => setQuantity((current) => Math.min(stock, current + 1));

  if (isLoading) return <LoadingSpinner />;

  if (isError || !product) {
    return (
      <>
        <SEO title={t('productNotFound')} noIndex />
        <section className="container-soft section-pad"><EmptyState title={t('productNotFound')} /></section>
      </>
    );
  }

  return (
    <>
      <SEO
        title={display.name}
        description={display.description || t('productSeoFallback')}
        image={images[0]?.url || '/images/logo.webp'}
        type="product"
      />

      <section className="section-pad">
        <div className="container-soft grid gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] bg-beige p-3 shadow-[0_24px_75px_rgba(79,91,58,0.13)] lg:aspect-[5/4]">
              {display.hasOffer && (
                <span className="absolute left-7 top-7 z-10 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-[0_14px_30px_rgba(185,154,91,0.25)]">
                  <Tag className="h-4 w-4" />
                  {offerLabel(product, isArabic)}
                </span>
              )}

              {!hasStock && (
                <span className="absolute right-7 top-7 z-10 rounded-full bg-charcoal px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-[0_14px_30px_rgba(47,48,40,0.22)]">
                  {t('outOfStock')}
                </span>
              )}

              <img
                src={images[activeImage]?.url || '/images/products/placeholder.webp'}
                alt={display.name}
                className={`h-full w-full rounded-[28px] object-cover ${!hasStock ? 'grayscale-[35%]' : ''}`}
              />

              {showArrows && (
                <>
                  <button type="button" onClick={goToPreviousImage} className="absolute left-6 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-olive shadow-sm transition hover:bg-white" aria-label={t('previousImage')}>
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button type="button" onClick={goToNextImage} className="absolute right-6 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-olive shadow-sm transition hover:bg-white" aria-label={t('nextImage')}>
                    <ChevronRight className="h-6 w-6" />
                  </button>

                  <div className="absolute bottom-6 right-6 rounded-full bg-charcoal/72 px-3 py-1 text-sm font-bold text-white">
                    {activeImage + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.map((image, index) => (
                <button key={image.url} type="button" onClick={() => setActiveImage(index)} className={`aspect-square overflow-hidden rounded-2xl border bg-white p-1 transition ${activeImage === index ? 'border-olive shadow-[0_12px_30px_rgba(79,91,58,0.12)]' : 'border-sand hover:border-sage'}`}>
                  <img src={image.url} alt="" className={`h-full w-full rounded-xl object-cover ${!hasStock ? 'grayscale-[35%]' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-[32px] border border-sand bg-white/78 p-6 shadow-[0_22px_70px_rgba(79,91,58,0.1)] md:p-8">
              <p className="eyebrow">{display.category}</p>

              <h1 className="mt-4 font-serif text-5xl leading-none text-charcoal md:text-6xl">
                {display.name}
              </h1>

              <div className="mt-5">
                {display.hasOffer ? (
                  <>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                      <p className="text-3xl font-bold text-olive">{display.offerPrice}</p>
                      <p className="text-lg font-semibold text-charcoal/38 line-through">{display.originalPrice}</p>
                    </div>

                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-sm font-bold text-gold">
                      <Tag className="h-4 w-4" />
                      {product.activeOffer?.title || offerLabel(product, isArabic)}
                    </div>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-olive">{display.price}</p>
                )}
              </div>

              <p className="mt-6 leading-8 text-charcoal/72">{display.description}</p>

              <div className="mt-8 grid gap-3 border-y border-sand/80 py-5 text-sm text-charcoal/66 sm:grid-cols-3">
                <p><strong className="block text-charcoal">{t('material')}</strong>{t('premiumLinen')}</p>
                <p><strong className="block text-charcoal">{t('use')}</strong>{t('tableSetup')}</p>
                <p>
                  <strong className="block text-charcoal">{t('stock')}</strong>
                  <span className={stock <= 3 ? 'font-bold text-gold' : 'text-charcoal/66'}>
                    {stockText(stock, isArabic)}
                  </span>
                </p>
              </div>

              {hasStock && stock <= 3 && (
                <div className="mt-5 rounded-2xl border border-gold/35 bg-gold/10 px-4 py-3 text-sm font-bold text-gold">
                  {stockText(stock, isArabic)} — {t('sellOutSoon')}
                </div>
              )}

              {!hasStock && (
                <div className="mt-5 rounded-2xl border border-charcoal/10 bg-charcoal/5 px-4 py-3 text-sm font-bold text-charcoal/60">
                  {t('contactForUnavailable')}
                </div>
              )}

              <div className="mt-7 flex items-center gap-3">
                <button className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-sand bg-white text-olive transition hover:border-sage disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={decreaseQuantity} aria-label={t('decreaseQuantity')} disabled={!hasStock || quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </button>

                <span className="w-12 text-center text-lg font-bold">{quantity}</span>

                <button className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-sand bg-white text-olive transition hover:border-sage disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={increaseQuantity} aria-label={t('increaseQuantity')} disabled={!canIncrease}>
                  <Plus className="h-4 w-4" />
                </button>

                {hasStock && <span className="text-sm text-charcoal/50">{quantity} / {stock}</span>}
              </div>

              <button type="button" className="btn-primary mt-7 w-full disabled:cursor-not-allowed disabled:bg-charcoal/30 disabled:shadow-none" onClick={() => addToCart(product, quantity)} disabled={!hasStock}>
                <ShoppingBag className="h-5 w-5" />
                {hasStock ? t('addToCart') : t('outOfStock')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {!!relatedProducts.length && (
        <section className="pb-20">
          <div className="container-soft">
            <div className="mb-8">
              <p className="eyebrow">{t('relatedProductsEyebrow')}</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
                {t('relatedProductsTitle')}
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
