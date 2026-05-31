import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Mail, MapPin, Phone, ReceiptText, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { formatProductPrice } from '../../lib/productLocalization.js';

const statuses = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];
const paymentStatuses = ['pending', 'awaiting-confirmation', 'paid'];

function itemHasOffer(item) {
  return Boolean(item.offerPrice && item.originalPrice && Number(item.offerPrice) < Number(item.originalPrice));
}

function itemLineTotal(item) {
  return Number(item.price || 0) * Number(item.quantity || 0);
}

function paymentMethodLabel(order, t) {
  return order.paymentMethod === 'instapay' ? t('instapay') : t('cashOnDelivery');
}

function paymentTimingLabel(value, t) {
  if (value === 'pay-now') return t('paidNow');
  if (value === 'pay-later') return t('payAfterConfirmation');
  return '-';
}

export default function AdminOrders() {
  const { t, isArabic, statusLabel } = useLanguage();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => (await api.get('/orders')).data,
  });

  const updateOrderStatus = useMutation({
    mutationFn: ({ id, status }) => api.put(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      toast.success(t('orderUpdated'));
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || t('couldNotUpdateOrder')),
  });

  const updatePaymentStatus = useMutation({
    mutationFn: ({ id, paymentStatus }) => api.put(`/orders/${id}/payment-status`, { paymentStatus }),
    onSuccess: () => {
      toast.success(t('paymentStatusUpdated'));
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || t('couldNotUpdatePaymentStatus')),
  });

  const orders = data?.orders || [];

  return (
    <div>
      <div>
        <p className="eyebrow">{t('adminOwnerTools')}</p>
        <h1 className="mt-2 font-serif text-5xl text-charcoal">{t('adminOrdersTitle')}</h1>
        <p className="note mt-4 max-w-3xl">
          {t('reviewOrdersCopy')}
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-7 space-y-5">
          {orders.map((order) => (
            <article
              key={order._id}
              className="overflow-hidden rounded-[30px] border border-sand bg-white shadow-[0_18px_55px_rgba(79,91,58,0.08)]"
            >
              <div className="grid gap-5 border-b border-sand/70 bg-ivory/70 p-5 lg:grid-cols-[1fr_420px] lg:items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                    {t('order')} #{order._id.slice(-6).toUpperCase()}
                  </p>

                  <h2 className="mt-2 font-serif text-3xl text-charcoal">
                    {order.customer?.fullName || t('customer')}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-charcoal/62">
                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 text-sage" />
                      {order.customer?.phone || '-'}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-sage" />
                      {order.customer?.city || '-'}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 text-sage" />
                      {order.customer?.email || '-'}
                    </span>
                  </div>

                  <p className="mt-4 font-serif text-3xl text-olive">
                    {formatProductPrice(order.total, isArabic)}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="label">{t('orderStatus')}</span>
                    <select
                      className="field rounded-2xl"
                      value={order.status}
                      onChange={(event) => updateOrderStatus.mutate({ id: order._id, status: event.target.value })}
                      disabled={updateOrderStatus.isPending}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{statusLabel(status, 'order')}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="label">{t('paymentStatus')}</span>
                    <select
                      className="field rounded-2xl"
                      value={order.paymentStatus || 'pending'}
                      onChange={(event) => updatePaymentStatus.mutate({ id: order._id, paymentStatus: event.target.value })}
                      disabled={updatePaymentStatus.isPending}
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>{statusLabel(status, 'payment')}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="grid gap-5 p-5 xl:grid-cols-[1fr_360px]">
                <div className="space-y-3">
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

                <aside className="rounded-[24px] border border-sand bg-white p-4">
                  <h3 className="font-serif text-2xl text-charcoal">{t('orderDetails')}</h3>

                  <div className="mt-4 space-y-3 text-sm">
                    <InfoLine label={t('email')} value={order.customer?.email} />
                    <InfoLine label={t('phone')} value={order.customer?.phone} />
                    <InfoLine label={t('city')} value={order.customer?.city} />
                    <InfoLine label={t('address')} value={order.customer?.address} />
                    <InfoLine label={t('notes')} value={order.customer?.notes || '-'} />
                  </div>

                  <div className="mt-5 rounded-2xl border border-sand bg-ivory/60 p-4">
                    <div className="mb-3 flex items-center gap-2 font-bold text-olive">
                      <CreditCard className="h-4 w-4" />
                      {paymentMethodLabel(order, t)}
                    </div>

                    <div className="space-y-2 text-sm text-charcoal/66">
                      <InfoLine label={t('paymentStatus')} value={statusLabel(order.paymentStatus, 'payment')} />
                      {order.paymentMethod === 'instapay' && (
                        <>
                          <InfoLine label={t('timing')} value={paymentTimingLabel(order.paymentDetails?.timing, t)} />
                          <InfoLine label={t('paymentReference')} value={order.paymentDetails?.reference || '-'} />
                          <InfoLine label={t('proofSentVia')} value={order.paymentDetails?.proofSentVia || '-'} />
                          <InfoLine label={t('paymentNote')} value={order.paymentDetails?.note || '-'} />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-charcoal/70">
                    <SummaryLine label={t('subtotal')} value={formatProductPrice(order.subtotal, isArabic)} />
                    {Number(order.discountAmount || 0) > 0 && (
                      <SummaryLine label={t('discountCodesTitle')} value={`-${formatProductPrice(order.discountAmount, isArabic)}`} />
                    )}
                    <SummaryLine label={t('delivery')} value={formatProductPrice(order.deliveryFee, isArabic)} />
                    <SummaryLine label={t('total')} value={formatProductPrice(order.total, isArabic)} strong />
                  </div>
                </aside>
              </div>
            </article>
          ))}

          {!orders.length && (
            <div className="rounded-[28px] border border-sand bg-white p-8 text-center">
              <ReceiptText className="mx-auto h-9 w-9 text-sage" />
              <h3 className="mt-3 font-serif text-3xl text-charcoal">{t('noOrdersYet')}</h3>
              <p className="mt-2 text-charcoal/60">{t('noOrdersAdminCopy')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <p className="flex justify-between gap-3 border-b border-sand/50 pb-2 last:border-b-0 last:pb-0">
      <span className="text-charcoal/52">{label}</span>
      <strong className="break-words text-right text-charcoal">{value || '-'}</strong>
    </p>
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
