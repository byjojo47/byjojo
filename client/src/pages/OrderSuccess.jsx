import { useLocation, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, CreditCard, MessageCircle, PackageCheck, Tag } from 'lucide-react';
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

function paymentTimingLabel(value, t) {
  if (value === 'pay-now') return t('paidNow');
  if (value === 'pay-later') return t('payAfterConfirmation');
  return '-';
}

export default function OrderSuccess() {
  const { t, isArabic, statusLabel } = useLanguage();
  const { id } = useParams();
  const { state } = useLocation();
  const stateOrder = state?.order;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order-success', id],
    queryFn: async () => (await api.get(`/orders/confirmation/${id}`)).data,
    enabled: Boolean(id) && !stateOrder,
    retry: 1,
  });

  const order = stateOrder || data?.order;

  if (isLoading) {
    return (
      <section className="container-soft section-pad">
        <LoadingSpinner label={t('loading')} />
      </section>
    );
  }

  if (isError || !order) {
    return (
      <section className="container-soft section-pad">
        <EmptyState title={t('orderSuccessMissing')} message={t('orderSuccessMissingCopy')} />
      </section>
    );
  }

  const isInstapay = order.paymentMethod === 'instapay';

  return (
    <section className="section-pad">
      <div className="container-soft">
        <div className="overflow-hidden rounded-[34px] border border-sand bg-white shadow-[0_24px_80px_rgba(79,91,58,0.12)]">
          <div className="grid gap-0 lg:grid-cols-[1fr_380px]">
            <div className="bg-ivory/70 p-6 md:p-10">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-olive text-white shadow-[0_18px_45px_rgba(79,91,58,0.2)]">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <p className="eyebrow mt-8">{t('orderSuccessEyebrow')}</p>

              <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-charcoal md:text-5xl">
                {t('orderSuccessTitle')}
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-charcoal/64">
                {t('orderSuccessCopy')}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/shop" className="btn-primary">{t('continueShopping')}</Link>
                <Link to="/my-orders" className="btn-secondary">{t('viewMyOrders')}</Link>
              </div>
            </div>

            <aside className="border-t border-sand bg-white p-6 lg:border-l lg:border-t-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">{t('order')}</p>
              <h2 className="mt-2 font-serif text-3xl text-charcoal">
                #{order._id.slice(-6).toUpperCase()}
              </h2>

              <div className="mt-5 rounded-3xl border border-sand bg-ivory/70 p-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-olive">
                    <CreditCard className="h-5 w-5" />
                  </span>

                  <div>
                    <p className="font-bold text-charcoal">
                      {isInstapay ? t('instapay') : t('cashOnDelivery')}
                    </p>
                    <p className="text-sm text-charcoal/58">
                      {isInstapay ? paymentTimingLabel(order.paymentDetails?.timing, t) : statusLabel(order.paymentStatus, 'payment')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm text-charcoal/70">
                <SummaryLine label={t('subtotal')} value={formatProductPrice(order.subtotal, isArabic)} />
                {Number(order.discountAmount || 0) > 0 && (
                  <SummaryLine label={t('discountCodesTitle')} value={`-${formatProductPrice(order.discountAmount, isArabic)}`} />
                )}
                <SummaryLine label={t('delivery')} value={formatProductPrice(order.deliveryFee, isArabic)} />
                <SummaryLine label={t('total')} value={formatProductPrice(order.total, isArabic)} strong />
              </div>
            </aside>
          </div>

          <div className="border-t border-sand bg-white p-6 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ivory text-olive">
                <PackageCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-serif text-3xl text-charcoal">{t('orderItems')}</h2>
                <p className="text-sm text-charcoal/55">{t('piecesInOrder', { count: order.items?.length || 0 })}</p>
              </div>
            </div>

            <div className="grid gap-3">
              {order.items?.map((item) => (
                <div
                  key={`${order._id}-${item.product}`}
                  className="grid gap-3 rounded-[24px] border border-sand bg-ivory/45 p-3 sm:grid-cols-[76px_1fr_auto] sm:items-center"
                >
                  <img
                    src={item.image || '/images/products/placeholder.webp'}
                    alt={item.name}
                    className="h-20 w-20 rounded-2xl object-cover sm:h-[76px] sm:w-[76px]"
                  />

                  <div className="min-w-0">
                    <p className="font-bold text-charcoal">{item.name}</p>

                    <p className="mt-1 text-sm text-charcoal/58">
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
          </div>

          {isInstapay && (
            <div className="border-t border-sand bg-white p-6 md:p-8">
              <div className="grid gap-5 md:grid-cols-[1fr_280px]">
                <div>
                  <h2 className="font-serif text-3xl text-charcoal">{t('instapayNextStep')}</h2>
                  <p className="mt-3 max-w-2xl text-charcoal/64">
                    {t('instapaySuccessCopy')}
                  </p>
                  <div className="mt-5 grid gap-3 text-sm text-charcoal/68 sm:grid-cols-2">
                    <SummaryLine label={t('paymentReference')} value={order.paymentDetails?.reference || '-'} />
                    <SummaryLine label={t('proofSentVia')} value={order.paymentDetails?.proofSentVia || '-'} />
                    <SummaryLine label={t('paymentNote')} value={order.paymentDetails?.note || '-'} />
                    <SummaryLine label={t('paymentStatus')} value={statusLabel(order.paymentStatus, 'payment')} />
                  </div>
                </div>

                <div className="rounded-3xl border border-sand bg-ivory/70 p-5">
                  <MessageCircle className="h-7 w-7 text-olive" />
                  <p className="mt-3 text-sm leading-6 text-charcoal/62">
                    {t('byjojoContactSoon')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SummaryLine({ label, value, strong = false }) {
  return (
    <p className={`flex justify-between gap-3 ${strong ? 'border-t border-sand pt-4 text-lg text-charcoal' : ''}`}>
      <span>{label}</span>
      <strong className={strong ? 'text-olive' : 'text-charcoal'}>{value}</strong>
    </p>
  );
}
