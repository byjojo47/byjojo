import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Clock,
  CreditCard,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import api from '../../api/axios.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { formatProductPrice } from '../../lib/productLocalization.js';

function orderNumber(order) {
  return `#${String(order?._id || '').slice(-6).toUpperCase()}`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

export default function AdminDashboard() {
  const { t, isArabic, statusLabel } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => (await api.get('/analytics/overview')).data,
  });

  const stats = data?.overview || {};
  const recentOrders = data?.recentOrders || [];
  const lowStockProducts = data?.lowStockProducts || [];
  const bestSellingProducts = data?.bestSellingProducts || [];

  const cards = [
    {
      label: t('revenue'),
      value: formatProductPrice(stats.revenue || 0, isArabic),
      note: `${formatProductPrice(stats.averageOrderValue || 0, isArabic)} ${t('averageOrder')}`,
      icon: TrendingUp,
      tone: 'olive',
    },
    {
      label: t('orders'),
      value: stats.orders || 0,
      note: `${stats.todayOrders || 0} ${t('today')} · ${stats.pendingOrders || 0} ${t('pending')}`,
      icon: ShoppingBag,
      tone: 'sage',
    },
    {
      label: t('awaitingPayment'),
      value: stats.awaitingPaymentOrders || 0,
      note: t('awaitingPaymentNote'),
      icon: CreditCard,
      tone: 'gold',
    },
    {
      label: t('customers'),
      value: stats.customers || 0,
      note: t('registeredCustomerAccounts'),
      icon: Users,
      tone: 'sage',
    },
    {
      label: t('products'),
      value: stats.products || 0,
      note: t('activeHidden', { active: stats.activeProducts || 0, hidden: stats.hiddenProducts || 0 }),
      icon: Boxes,
      tone: 'olive',
    },
    {
      label: t('lowStock'),
      value: stats.lowStockProducts || 0,
      note: t('lowStockNote'),
      icon: AlertTriangle,
      tone: 'gold',
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">{t('adminOwnerTools')}</p>
          <h1 className="mt-2 font-serif text-5xl text-charcoal">{t('overviewTitle')}</h1>
          <p className="note mt-4 max-w-3xl">
            {t('dashboardNoteFull')}
          </p>
        </div>

        <Link to="/admin/orders" className="btn-primary w-fit">
          {t('openOrders')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="overflow-hidden rounded-[30px] border border-sand bg-white shadow-[0_18px_55px_rgba(79,91,58,0.08)]">
              <div className="flex flex-col gap-3 border-b border-sand/70 bg-ivory/70 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eyebrow">{t('orderActivity')}</p>
                  <h2 className="mt-2 font-serif text-3xl text-charcoal">{t('recentOrders')}</h2>
                </div>
                <Link to="/admin/orders" className="font-bold text-olive">
                  {t('viewAll')}
                </Link>
              </div>

              <div className="divide-y divide-sand/70">
                {recentOrders.map((order) => (
                  <Link
                    to="/admin/orders"
                    key={order._id}
                    className="grid gap-3 p-5 transition hover:bg-ivory/60 md:grid-cols-[1fr_auto] md:items-center"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-olive text-white">
                        <ReceiptText className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-bold text-charcoal">
                          {orderNumber(order)} · {order.customer?.fullName || t('customer')}
                        </p>
                        <p className="mt-1 text-sm text-charcoal/55">
                          {formatDate(order.createdAt)} · {statusLabel(order.status, 'order')} · {statusLabel(order.paymentStatus, 'payment')}
                        </p>
                      </div>
                    </div>

                    <p className="font-bold text-olive">
                      {formatProductPrice(order.total || 0, isArabic)}
                    </p>
                  </Link>
                ))}

                {!recentOrders.length && (
                  <div className="p-8 text-center text-charcoal/55">
                    {t('noOrdersYet')}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[30px] border border-sand bg-white p-5 shadow-[0_18px_55px_rgba(79,91,58,0.08)]">
              <div>
                <p className="eyebrow">{t('inventory')}</p>
                <h2 className="mt-2 font-serif text-3xl text-charcoal">{t('lowStock')}</h2>
                <p className="mt-2 text-sm leading-6 text-charcoal/58">
                  {t('lowStockCopy')}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {lowStockProducts.map((product) => (
                  <Link
                    key={product._id}
                    to="/admin/products"
                    className="flex items-center gap-3 rounded-2xl border border-sand bg-ivory/45 p-3 transition hover:border-olive hover:bg-white"
                  >
                    <img
                      src={product.images?.find((image) => image.isMain)?.url || product.images?.[0]?.url || '/images/products/placeholder.webp'}
                      alt={product.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-charcoal">{product.name}</p>
                      <p className="text-sm text-charcoal/55">{product.category?.name || t('noCategory')}</p>
                    </div>
                    <span className="rounded-full bg-gold/10 px-3 py-1 text-sm font-bold text-gold">
                      {product.stock || 0} {t('left')}
                    </span>
                  </Link>
                ))}

                {!lowStockProducts.length && (
                  <div className="rounded-2xl border border-sand bg-ivory/45 p-5 text-center text-charcoal/55">
                    {t('noLowStockProducts')}
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="mt-8 rounded-[30px] border border-sand bg-white p-5 shadow-[0_18px_55px_rgba(79,91,58,0.08)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow">{t('performance')}</p>
                <h2 className="mt-2 font-serif text-3xl text-charcoal">{t('bestSellingPieces')}</h2>
              </div>
              <Link to="/admin/products" className="font-bold text-olive">
                {t('manageProducts')}
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {bestSellingProducts.map((product) => (
                <div key={product.product || product.name} className="rounded-2xl border border-sand bg-ivory/45 p-4">
                  <div className="flex gap-3">
                    <img
                      src={product.image || '/images/products/placeholder.webp'}
                      alt={product.name}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-charcoal">{product.name}</p>
                      <p className="mt-1 text-sm text-charcoal/55">
                        {product.quantitySold || 0} {t('sold')}
                      </p>
                      <p className="mt-1 font-bold text-olive">
                        {formatProductPrice(product.revenue || 0, isArabic)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {!bestSellingProducts.length && (
                <div className="rounded-2xl border border-sand bg-ivory/45 p-5 text-center text-charcoal/55 md:col-span-2 xl:col-span-3">
                  {t('bestSellingEmpty')}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, note, icon: Icon, tone }) {
  const toneClasses = {
    olive: 'bg-olive text-white',
    sage: 'bg-sage/15 text-olive',
    gold: 'bg-gold/15 text-gold',
  };

  return (
    <article className="rounded-[28px] border border-sand bg-white p-5 shadow-[0_18px_55px_rgba(79,91,58,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-sage">{label}</p>
          <p className="mt-3 font-serif text-4xl text-charcoal">{value}</p>
        </div>
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${toneClasses[tone] || toneClasses.olive}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-charcoal/58">{note}</p>
    </article>
  );
}
