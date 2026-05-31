import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, MessageCircle, Search, ShoppingBag, UserRound } from 'lucide-react';
import api from '../../api/axios.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { formatProductPrice } from '../../lib/productLocalization.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

function whatsappLink(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '#';
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

export default function AdminCustomers() {
  const { t, isArabic } = useLanguage();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => (await api.get('/analytics/overview')).data,
  });

  const customers = data?.customersList || [];

  const visibleCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return customers;

    return customers.filter((customer) => (
      customer.fullName?.toLowerCase().includes(q) ||
      customer.email?.toLowerCase().includes(q) ||
      customer.phone?.toLowerCase().includes(q)
    ));
  }, [customers, search]);

  const totalSpent = customers.reduce((sum, customer) => sum + Number(customer.totalSpent || 0), 0);
  const totalOrders = customers.reduce((sum, customer) => sum + Number(customer.orderCount || 0), 0);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">{t('customerCommunity')}</p>
          <h1 className="mt-2 font-serif text-5xl text-charcoal">{t('customers')}</h1>
          <p className="note mt-4 max-w-3xl">
            {t('customersNoteFull')}
          </p>
        </div>

        <label className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" />
          <input
            className="field rounded-full pl-11"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('searchCustomers')}
          />
        </label>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <SummaryCard label={t('registeredCustomers')} value={customers.length} icon={UserRound} />
            <SummaryCard label={t('customerOrders')} value={totalOrders} icon={ShoppingBag} />
            <SummaryCard label={t('customerRevenue')} value={formatProductPrice(totalSpent, isArabic)} icon={ShoppingBag} />
          </div>

          <div className="mt-7 grid gap-4">
            {visibleCustomers.map((customer) => (
              <article
                key={customer._id}
                className="grid gap-4 rounded-[28px] border border-sand bg-white p-5 shadow-[0_18px_55px_rgba(79,91,58,0.08)] xl:grid-cols-[1fr_360px] xl:items-center"
              >
                <div className="flex gap-4">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-olive text-white">
                    <UserRound className="h-6 w-6" />
                  </span>

                  <div className="min-w-0">
                    <h2 className="font-serif text-3xl leading-tight text-charcoal">
                      {customer.fullName || t('customer')}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-charcoal/58">
                      <span>{customer.email || '-'}</span>
                      <span>{customer.phone || '-'}</span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                      <Metric label={t('orders')} value={customer.orderCount || 0} />
                      <Metric label={t('totalSpent')} value={formatProductPrice(customer.totalSpent || 0, isArabic)} />
                      <Metric label={t('lastOrder')} value={formatDate(customer.lastOrderAt)} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <a
                    href={customer.email ? `mailto:${customer.email}` : '#'}
                    className="btn-secondary"
                    aria-disabled={!customer.email}
                  >
                    <Mail className="h-4 w-4" />
                    {t('emailAction')}
                  </a>

                  <a
                    href={whatsappLink(customer.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    aria-disabled={!customer.phone}
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </article>
            ))}

            {!visibleCustomers.length && (
              <div className="rounded-[28px] border border-sand bg-white p-8 text-center">
                <UserRound className="mx-auto h-9 w-9 text-sage" />
                <h3 className="mt-3 font-serif text-3xl text-charcoal">{t('noCustomersFound')}</h3>
                <p className="mt-2 text-charcoal/60">
                  {t('noCustomersFoundCopy')}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <article className="rounded-[28px] border border-sand bg-white p-5 shadow-[0_18px_55px_rgba(79,91,58,0.08)]">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-sage/15 text-olive">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-sage">{label}</p>
      <p className="mt-2 font-serif text-4xl text-charcoal">{value}</p>
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-sand bg-ivory/55 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-sage">{label}</p>
      <p className="mt-1 font-bold text-charcoal">{value}</p>
    </div>
  );
}
