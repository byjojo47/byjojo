import { useQuery } from '@tanstack/react-query';
import { CreditCard, PackageCheck, ReceiptText, Tag } from 'lucide-react';
import api from '../api/axios.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatProductPrice } from '../lib/productLocalization.js';

function itemHasOffer(item) {
  return Boolean(item.offerPrice && item.originalPrice && Number(item.offerPrice) < Number(item.originalPrice));
}

function itemLineTotal(item) {
  return Number(item.price || 0) * Number(item.quantity || 0);
}

function paymentMethodLabel(order, t) {
  return order.paymentMethod === 'instapay' ? t('instapay') : t('cashOnDelivery');
}

export default function MyOrders() {
  const { t, isArabic, statusLabel } = useLanguage();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => (await api.get('/orders/my-orders')).data,
  });

  const orders = data?.orders || [];

  return (
    <section className="section-pad">
      <div className="container-soft">
        <div className="mb-10 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <p className="eyebrow">{t('account')}</p>
            <h1 className="page-title mt-3">{t('myOrdersTitle')}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/70">{t('myOrdersCopy')}</p>
          </div>

          <div className="rounded-[28px] border border-sand bg-white/78 p-5 shadow-[0_18px_55px_rgba(79,91,58,0.08)]">
            <PackageCheck className="h-7 w-7 text-sage" />
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-sage">{t('totalOrders')}</p>
            <p className="mt-1 font-serif text-4xl text-olive">{orders.length}</p>
          </div>
        </div>

        {isLoading && <LoadingSpinner />}
        {isError && <EmptyState title={t('couldNotLoadOrders')} />}
        {!isLoading && !orders.length && <EmptyState title={t('noOrdersYet')} message={t('noOrdersCopy')} />}

        <div className="grid gap-5">
          {orders.map((order) => (
            <article
              key={order._id}
              className="overflow-hidden rounded-[30px] border border-sand bg-white shadow-[0_18px_55px_rgba(79,91,58,0.08)]"
            >
              <div className="flex flex-col gap-4 border-b border-sand/70 bg-ivory/70 p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-olive text-white">
                    <ReceiptText className="h-5 w-5" />
                  </span>

                  <div>
                    <h2 className="font-serif text-3xl text-charcoal">
                      {t('order')} #{order._id.slice(-6).toUpperCase()}
                    </h2>
                    <p className="text-sm text-charcoal/55">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="w-fit rounded-full bg-sage/15 px-4 py-2 text-sm font-bold text-olive">
                    {statusLabel(order.status, 'order')}
                  </span>

                  <span className="w-fit rounded-full bg-gold/15 px-4 py-2 text-sm font-bold text-gold">
                    {statusLabel(order.paymentStatus, 'payment')}
                  </span>
                </div>
              </div>

              <div className="grid gap-5 p-5 lg:grid-cols-[1fr_260px]">
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div
                      key={`${order._id}-${item.product}`}
                      className="grid gap-3 rounded-2xl border border-sand/70 bg-ivory/45 p-3 sm:grid-cols-[68px_1fr_auto] sm:items-center"
                    >
                      <img
                        src={item.image || '/images/products/placeholder.webp'}
                        alt={item.name}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />

                      <div className="min-w-0">
                        <p className="font-bold text-charcoal">{item.name}</p>

                        <p className="text-sm text-charcoal/58">
                          {t('qty')} {item.quantity} · {formatProductPrice(item.price, isArabic)}
                        </p>

                        {itemHasOffer(item) && (
                          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
                            <Tag className="h-3 w-3" />
                            {item.activeOffer?.title || t('offersTitle')}
                          </p>
                        )}
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="font-bold text-olive">
                          {formatProductPrice(itemLineTotal(item), isArabic)}
                        </p>

                        {itemHasOffer(item) && (
                          <p className="text-sm text-charcoal/38 line-through">
                            {formatProductPrice(Number(item.originalPrice || 0) * Number(item.quantity || 0), isArabic)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <aside className="rounded-2xl border border-sand bg-white p-4">
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold text-olive">
                    <CreditCard className="h-4 w-4" />
                    {paymentMethodLabel(order, t)}
                  </div>

                  <p className="flex justify-between text-sm text-charcoal/62">
                    <span>{t('subtotal')}</span>
                    <strong>{formatProductPrice(order.subtotal, isArabic)}</strong>
                  </p>

                  {Number(order.discountAmount || 0) > 0 && (
                    <p className="mt-2 flex justify-between text-sm text-olive">
                      <span>{t('discountCodesTitle')}</span>
                      <strong>-{formatProductPrice(order.discountAmount, isArabic)}</strong>
                    </p>
                  )}

                  <p className="mt-2 flex justify-between text-sm text-charcoal/62">
                    <span>{t('delivery')}</span>
                    <strong>{formatProductPrice(order.deliveryFee, isArabic)}</strong>
                  </p>

                  <p className="mt-4 flex justify-between border-t border-sand pt-4 text-lg text-charcoal">
                    <span>{t('total')}</span>
                    <strong>{formatProductPrice(order.total, isArabic)}</strong>
                  </p>

                  <p className="mt-3 rounded-full bg-beige px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-olive">
                    {statusLabel(order.status, 'order')}
                  </p>
                </aside>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
