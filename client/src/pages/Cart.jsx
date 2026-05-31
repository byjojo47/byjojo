import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Tag, Trash2 } from 'lucide-react';
import api from '../api/axios.js';
import EmptyState from '../components/EmptyState.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatProductPrice } from '../lib/productLocalization.js';

function cartItemName(item, isArabic) {
  return isArabic ? item.nameAr || item.name : item.name;
}

function itemLineTotal(item) {
  return Number(item.price || 0) * Number(item.quantity || 0);
}

function lowStockText(item, isArabic) {
  const stock = Number(item.stock || 0);

  if (stock < 1) return isArabic ? 'غير متاح' : 'Out of stock';
  if (stock <= 3) return isArabic ? `متبقي ${stock} فقط` : `Only ${stock} left`;
  return '';
}

export default function Cart() {
  const { t, isArabic } = useLanguage();
  const { items, subtotal, savings, updateQuantity, removeItem } = useCart();

  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get('/settings')).data,
  });

  const deliveryFee = Number(data?.settings?.deliveryFee ?? 50);
  const total = subtotal + deliveryFee;

  const hasUnavailableItems = items.some((item) => Number(item.stock || 0) < Number(item.quantity || 0) || Number(item.stock || 0) < 1);

  if (!items.length) {
    return (
      <section className="container-soft section-pad">
        <EmptyState title={t('emptyCart')} message={t('emptyCartCopy')} />
      </section>
    );
  }

  return (
    <section className="section-pad">
      <div className="container-soft grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">{t('cart')}</p>
              <h1 className="page-title mt-2">{t('yourCart')}</h1>
            </div>

            <Link to="/shop" className="btn-secondary w-fit">
              {t('continueShopping')}
            </Link>
          </div>

          {hasUnavailableItems && (
            <div className="mb-5 rounded-[24px] border border-gold/35 bg-gold/10 p-4 text-sm font-bold leading-6 text-gold">
              Some cart quantities are higher than the available stock. Please adjust them before checkout.
            </div>
          )}

          <div className="space-y-4">
            {items.map((item) => {
              const name = cartItemName(item, isArabic);
              const stock = Number(item.stock || 0);
              const isUnavailable = stock < 1;
              const isAboveStock = stock > 0 && Number(item.quantity || 0) > stock;

              return (
                <div
                  key={item.product}
                  className={`grid gap-4 rounded-[28px] border bg-white p-4 shadow-[0_18px_55px_rgba(79,91,58,0.08)] sm:grid-cols-[112px_1fr_auto] ${
                    isUnavailable || isAboveStock ? 'border-gold/50' : 'border-sand'
                  }`}
                >
                  <Link to={`/products/${item.slug}`} className="block">
                    <img
                      src={item.image || '/images/products/placeholder.webp'}
                      alt={name}
                      className={`h-28 w-28 rounded-[22px] object-cover ${isUnavailable ? 'grayscale-[35%]' : ''}`}
                    />
                  </Link>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link to={`/products/${item.slug}`}>
                          <h3 className="font-serif text-3xl leading-tight text-charcoal transition hover:text-olive">
                            {name}
                          </h3>
                        </Link>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.hasActiveOffer && (
                            <div className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-gold">
                              <Tag className="h-3.5 w-3.5" />
                              {item.activeOffer?.title || t('offersTitle')}
                            </div>
                          )}

                          {lowStockText(item, isArabic) && (
                            <div className="inline-flex rounded-full border border-sand bg-ivory px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-olive">
                              {lowStockText(item, isArabic)}
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-right">
                        <span className="block text-lg font-bold text-olive">
                          {formatProductPrice(itemLineTotal(item), isArabic)}
                        </span>
                        <span className="text-xs text-charcoal/45">
                          {formatProductPrice(item.price, isArabic)} × {item.quantity}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center overflow-hidden rounded-full border border-sand bg-ivory">
                        <button
                          className="inline-flex h-10 w-10 items-center justify-center text-olive transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                          type="button"
                          onClick={() => updateQuantity(item.product, item.quantity - 1)}
                          aria-label={t('decreaseQuantity')}
                          disabled={Number(item.quantity || 0) <= 1}
                        >
                          -
                        </button>

                        <span className="w-10 text-center font-bold text-charcoal">
                          {item.quantity}
                        </span>

                        <button
                          className="inline-flex h-10 w-10 items-center justify-center text-olive transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                          type="button"
                          onClick={() => updateQuantity(item.product, item.quantity + 1)}
                          aria-label={t('increaseQuantity')}
                          disabled={stock > 0 && Number(item.quantity || 0) >= stock}
                        >
                          +
                        </button>
                      </div>

                      {stock > 0 && (
                        <span className="text-sm text-charcoal/45">
                          {item.quantity} / {stock}
                        </span>
                      )}

                      {item.hasActiveOffer && (
                        <div className="flex flex-wrap items-baseline gap-2 text-sm">
                          <span className="font-bold text-olive">
                            {formatProductPrice(item.price, isArabic)}
                          </span>
                          <span className="text-charcoal/35 line-through">
                            {formatProductPrice(item.originalPrice, isArabic)}
                          </span>
                        </div>
                      )}
                    </div>

                    {isAboveStock && (
                      <p className="mt-3 rounded-2xl border border-gold/35 bg-gold/10 px-4 py-2 text-sm font-bold text-gold">
                        Quantity reduced to available stock before checkout.
                      </p>
                    )}

                    {isUnavailable && (
                      <p className="mt-3 rounded-2xl border border-charcoal/10 bg-charcoal/5 px-4 py-2 text-sm font-bold text-charcoal/60">
                        This product is currently unavailable. Remove it to continue checkout.
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sand text-olive transition hover:border-olive hover:bg-ivory"
                    onClick={() => removeItem(item.product)}
                    aria-label={t('removeItem')}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="h-fit rounded-[32px] border border-sand bg-white p-6 shadow-[0_22px_70px_rgba(79,91,58,0.1)]">
          <h2 className="font-serif text-3xl text-charcoal">{t('summary')}</h2>

          <div className="mt-5 space-y-3 text-charcoal/75">
            <p className="flex justify-between gap-3">
              <span>{t('subtotal')}</span>
              <strong>{formatProductPrice(subtotal, isArabic)}</strong>
            </p>

            {savings > 0 && (
              <p className="flex justify-between gap-3 text-olive">
                <span>{t('offersTitle')}</span>
                <strong>-{formatProductPrice(savings, isArabic)}</strong>
              </p>
            )}

            <p className="flex justify-between gap-3">
              <span>{t('delivery')}</span>
              <strong>{formatProductPrice(deliveryFee, isArabic)}</strong>
            </p>

            <p className="flex justify-between gap-3 border-t border-sand pt-4 text-lg text-charcoal">
              <span>{t('total')}</span>
              <strong>{formatProductPrice(total, isArabic)}</strong>
            </p>
          </div>

          {hasUnavailableItems ? (
            <button
              type="button"
              disabled
              className="btn-primary mt-6 w-full cursor-not-allowed bg-charcoal/30 shadow-none"
            >
              Update cart to continue
            </button>
          ) : (
            <Link to="/checkout" className="btn-primary mt-6 w-full">
              {t('checkout')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

          <p className="mt-4 text-center text-sm leading-6 text-charcoal/55">
            {t('checkoutTrustCopy')}
          </p>
        </aside>
      </div>
    </section>
  );
}