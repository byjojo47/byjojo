import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Banknote, Camera, CreditCard, MessageCircle, ShieldCheck, Tag, TicketPercent, X } from 'lucide-react';
import api from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatProductPrice } from '../lib/productLocalization.js';

const BRAND_WHATSAPP = '+20 10 97796773';
const BRAND_INSTAGRAM = 'https://www.instagram.com/byjojoeg?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';

function checkoutSchema(t) {
  return z.object({
  fullName: z.string().min(2, t('fullNameRequired')),
  email: z.string().email(t('validEmailRequired')),
  phone: z.string().min(8, t('phoneRequired')),
  address: z.string().min(5, t('addressRequired')),
  city: z.string().min(2, t('cityRequired')),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cash', 'instapay']),
  instapayTiming: z.string().optional(),
  paymentReference: z.string().optional(),
  proofSentVia: z.string().optional(),
  paymentNote: z.string().optional(),
}).superRefine((values, ctx) => {
  if (values.paymentMethod === 'instapay' && !values.instapayTiming) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['instapayTiming'],
      message: t('choosePaymentTiming'),
    });
  }
});
}

function cartItemName(item, isArabic) {
  return isArabic ? item.nameAr || item.name : item.name;
}

function itemLineTotal(item) {
  return Number(item.price || 0) * Number(item.quantity || 0);
}

function publicCartItems(items) {
  return items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
  }));
}

function discountLabel(discountCode, isArabic) {
  if (!discountCode) return '';

  if (discountCode.discountType === 'percentage') {
    return isArabic
      ? `خصم ${discountCode.discountValue}%`
      : `${discountCode.discountValue}% off`;
  }

  return isArabic
    ? `خصم ${Number(discountCode.discountValue || 0).toLocaleString('ar-EG')} جنيه`
    : `${Number(discountCode.discountValue || 0).toLocaleString()} EGP off`;
}

function enabledFromSettings(settings, key) {
  return settings?.payment?.[key] !== false;
}

function whatsappLink(number, message = '') {
  const digits = String(number || BRAND_WHATSAPP).replace(/\D/g, '');
  const query = message ? `?text=${encodeURIComponent(message)}` : '';

  return digits ? `https://wa.me/${digits}${query}` : '#';
}

function instagramDmLink(url) {
  try {
    const parsed = new URL(url || BRAND_INSTAGRAM);
    const username = parsed.pathname.split('/').filter(Boolean)[0];

    return username ? `https://ig.me/m/${username}` : url || BRAND_INSTAGRAM;
  } catch {
    return url || BRAND_INSTAGRAM;
  }
}

export default function Checkout() {
  const { t, isArabic } = useLanguage();
  const navigate = useNavigate();
  const { items, subtotal, savings, clearCart } = useCart();
  const schema = useMemo(() => checkoutSchema(t), [t]);

  const [codeInput, setCodeInput] = useState('');
  const [discount, setDiscount] = useState(null);
  const [checkingCode, setCheckingCode] = useState(false);

  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get('/settings')).data,
  });

  const settings = data?.settings;
  const cashEnabled = enabledFromSettings(settings, 'cashEnabled');
  const instapayEnabled = enabledFromSettings(settings, 'instapayEnabled');
  const hasPaymentMethod = cashEnabled || instapayEnabled;

  const deliveryFee = Number(settings?.deliveryFee ?? 50);
  const discountAmount = Number(discount?.discountAmount || 0);
  const total = Math.max(0, subtotal - discountAmount) + deliveryFee;
  const instapayQr = settings?.payment?.instapayQr?.url;
  const instapayNumber = settings?.payment?.instapayNumber;
  const whatsappNumber = settings?.whatsappNumber || BRAND_WHATSAPP;
  const instagramUrl = settings?.instagramUrl || BRAND_INSTAGRAM;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentMethod: 'cash',
      instapayTiming: 'pay-now',
      proofSentVia: 'WhatsApp',
    },
  });

  const paymentMethod = watch('paymentMethod');
  const selectedProofChannel = watch('proofSentVia');
  const customerName = watch('fullName');
  const customerPhone = watch('phone');
  const customerEmail = watch('email');

  const proofMessage = useMemo(() => {
    const itemsText = items
      .map((item) => `${cartItemName(item, isArabic)} x${item.quantity}`)
      .join(', ');
    const totalText = formatProductPrice(total, isArabic);

    if (isArabic) {
      return [
        'مرحبًا ByJojo، أريد إرسال إثبات تحويل إنستاباي.',
        '',
        `الاسم: ${customerName || '-'}`,
        `الهاتف: ${customerPhone || '-'}`,
        `البريد: ${customerEmail || '-'}`,
        `المنتجات: ${itemsText || '-'}`,
        `الإجمالي: ${totalText}`,
      ].join('\n');
    }

    return [
      'Hello ByJojo, I want to send the Instapay payment proof.',
      '',
      `Name: ${customerName || '-'}`,
      `Phone: ${customerPhone || '-'}`,
      `Email: ${customerEmail || '-'}`,
      `Items: ${itemsText || '-'}`,
      `Total: ${totalText}`,
    ].join('\n');
  }, [customerEmail, customerName, customerPhone, isArabic, items, total]);

  const whatsappProofUrl = useMemo(
    () => whatsappLink(whatsappNumber, proofMessage),
    [proofMessage, whatsappNumber],
  );
  const instagramProofUrl = useMemo(() => instagramDmLink(instagramUrl), [instagramUrl]);

  const chooseProofChannel = (channel) => {
    setValue('proofSentVia', channel, { shouldDirty: true, shouldValidate: true });
  };

  useEffect(() => {
    if (!settings) return;

    if (cashEnabled && !instapayEnabled) {
      setValue('paymentMethod', 'cash');
      return;
    }

    if (!cashEnabled && instapayEnabled) {
      setValue('paymentMethod', 'instapay');
      return;
    }

    if (!cashEnabled && !instapayEnabled) {
      setValue('paymentMethod', 'cash');
    }
  }, [settings, cashEnabled, instapayEnabled, setValue]);

  const applyDiscountCode = async () => {
    const cleanCode = codeInput.trim().toUpperCase();

    if (!cleanCode) {
      toast.error(t('discountEnterCode'));
      return;
    }

    try {
      setCheckingCode(true);

      const { data: discountData } = await api.post('/discount-codes/validate', {
        code: cleanCode,
        subtotal,
      });

      setDiscount(discountData);
      setCodeInput(discountData.discountCode.code);
      toast.success(t('discountApplied'));
    } catch (error) {
      setDiscount(null);
      toast.error(error.response?.data?.message || t('invalidDiscountCode'));
    } finally {
      setCheckingCode(false);
    }
  };

  const removeDiscount = () => {
    setDiscount(null);
    setCodeInput('');
    toast.success(t('discountRemoved'));
  };

  const onSubmit = async (values) => {
    try {
      const {
        instapayTiming,
        paymentReference,
        proofSentVia,
        paymentNote,
        paymentMethod: selectedPayment,
        ...customer
      } = values;

      if (selectedPayment === 'cash' && !cashEnabled) {
        toast.error(t('cashUnavailable'));
        return;
      }

      if (selectedPayment === 'instapay' && !instapayEnabled) {
        toast.error(t('instapayUnavailable'));
        return;
      }

      if (!hasPaymentMethod) {
        toast.error(t('noPaymentMethodAvailable'));
        return;
      }

      const { data: orderData } = await api.post('/orders', {
        customer,
        items: publicCartItems(items),
        discountCode: discount?.discountCode?.code || '',
        paymentMethod: selectedPayment,
        paymentDetails: selectedPayment === 'instapay'
          ? {
              timing: instapayTiming,
              reference: paymentReference,
              proofSentVia,
              note: paymentNote,
            }
          : {},
      });

      clearCart();
      toast.success(t('orderPlaced'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigate(`/order-success/${orderData.order._id}`, {
        state: { order: orderData.order },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || t('couldNotPlaceOrder'));
    }
  };

  if (!items.length) {
    return (
      <section className="container-soft section-pad">
        <EmptyState title={t('emptyCart')} message={t('addProductsBeforeCheckout')} />
      </section>
    );
  }

  return (
    <section className="section-pad">
      <div className="container-soft grid gap-8 lg:grid-cols-[1fr_380px]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-hidden rounded-[30px] border border-sand bg-white shadow-[0_22px_70px_rgba(79,91,58,0.1)]"
        >
          <div className="border-b border-sand/70 bg-ivory/70 p-6">
            <p className="eyebrow">{t('secureCheckout')}</p>
            <h1 className="mt-2 font-serif text-4xl text-charcoal">{t('checkoutTitle')}</h1>
            <p className="mt-3 max-w-2xl text-charcoal/62">{t('checkoutCopy')}</p>
          </div>

          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['fullName', t('fullName')],
                ['email', t('email')],
                ['phone', t('phone')],
                ['city', t('city')],
              ].map(([name, label]) => (
                <label key={name}>
                  <span className="label">{label}</span>
                  <input className="field rounded-2xl" {...register(name)} />
                  <small className="text-red-700">{errors[name]?.message}</small>
                </label>
              ))}

              <label className="md:col-span-2">
                <span className="label">{t('address')}</span>
                <input className="field rounded-2xl" {...register('address')} />
                <small className="text-red-700">{errors.address?.message}</small>
              </label>

              <label className="md:col-span-2">
                <span className="label">{t('notes')}</span>
                <textarea className="field min-h-28 rounded-2xl" {...register('notes')} />
              </label>
            </div>

            <div className="mt-7 rounded-[24px] border border-sand bg-ivory/55 p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-olive">
                  <TicketPercent className="h-5 w-5" />
                </span>

                <div>
                  <h2 className="font-serif text-2xl text-charcoal">{t('discountCodesTitle')}</h2>
                  <p className="text-sm text-charcoal/58">
                    {t('discountCodeHelp')}
                  </p>
                </div>
              </div>

              {discount ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-gold/35 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{t('appliedCode')}</p>
                    <p className="mt-1 font-serif text-3xl text-olive">{discount.discountCode.code}</p>
                    <p className="mt-1 text-sm font-bold text-charcoal/60">
                      {discountLabel(discount.discountCode, isArabic)} · -{formatProductPrice(discountAmount, isArabic)}
                    </p>
                  </div>

                  <button type="button" onClick={removeDiscount} className="btn-secondary">
                    <X className="h-4 w-4" />
                    {t('remove')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    className="field rounded-2xl uppercase"
                    value={codeInput}
                    onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
                    placeholder="BYJOJO10"
                  />

                  <button
                    type="button"
                    onClick={applyDiscountCode}
                    disabled={checkingCode}
                    className="btn-secondary shrink-0"
                  >
                    {checkingCode ? t('loading') : t('save')}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-7">
              <span className="label">{t('paymentMethod')}</span>

              {hasPaymentMethod ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {cashEnabled && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-sand bg-ivory/50 p-4 transition hover:border-sage">
                      <input className="mt-1 accent-olive" type="radio" value="cash" {...register('paymentMethod')} />
                      <span>
                        <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-olive">
                          <Banknote className="h-4 w-4" />
                        </span>
                        <strong className="block text-charcoal">{t('cashOnDelivery')}</strong>
                        <small className="text-charcoal/55">{t('cashPaymentCopy')}</small>
                      </span>
                    </label>
                  )}

                  {instapayEnabled && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-sand bg-ivory/50 p-4 transition hover:border-sage">
                      <input className="mt-1 accent-olive" type="radio" value="instapay" {...register('paymentMethod')} />
                      <span>
                        <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-olive">
                          <CreditCard className="h-4 w-4" />
                        </span>
                        <strong className="block text-charcoal">{t('instapay')}</strong>
                        <small className="text-charcoal/55">{t('instapayPaymentCopy')}</small>
                      </span>
                    </label>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-gold/35 bg-gold/10 p-4 text-sm font-bold text-gold">
                  {t('noPaymentMethodsCustomer')}
                </div>
              )}
            </div>

            {paymentMethod === 'instapay' && instapayEnabled && (
              <div className="mt-5 rounded-[24px] border border-sand bg-ivory/70 p-5">
                <div className="flex flex-col gap-5 lg:flex-row">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-olive text-white">
                        <CreditCard className="h-5 w-5" />
                      </span>

                      <div>
                        <h2 className="font-serif text-2xl text-charcoal">{t('instapayDetails')}</h2>
                        <p className="text-sm text-charcoal/58">{t('instapayInstructions')}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      <div className="rounded-2xl border border-sand bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-sage">{t('instapayNumber')}</p>
                        <p className="mt-1 font-bold text-olive">
                          {instapayNumber || t('addFromAdmin')}
                        </p>
                      </div>

                      <label className="rounded-2xl border border-sand bg-white p-4">
                        <span className="mb-3 block text-sm font-bold text-olive">{t('paymentMethod')}</span>
                        <select className="field rounded-2xl" {...register('instapayTiming')}>
                          <option value="pay-now">{t('paidNow')}</option>
                          <option value="pay-later">{t('payAfterConfirmation')}</option>
                        </select>
                        <small className="text-red-700">{errors.instapayTiming?.message}</small>
                      </label>

                      <label>
                        <span className="label">{t('paymentReference')}</span>
                        <input
                          className="field rounded-2xl"
                          placeholder={t('paymentReferencePlaceholder')}
                          {...register('paymentReference')}
                        />
                      </label>

                      <label>
                        <span className="label">{t('proofSentVia')}</span>
                        <select className="field rounded-2xl" {...register('proofSentVia')}>
                          <option value="WhatsApp">{t('whatsapp')}</option>
                          <option value="Instagram">{t('instagram')}</option>
                          <option value="Other">{t('other')}</option>
                        </select>
                      </label>

                      <div className="rounded-2xl border border-sand bg-white p-4">
                        <p className="text-sm font-bold text-olive">{t('sendProofDirectly')}</p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <a
                            href={instagramProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => chooseProofChannel('Instagram')}
                            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                              selectedProofChannel === 'Instagram'
                                ? 'border-olive bg-olive !text-white'
                                : 'border-sand bg-ivory text-olive hover:border-olive'
                            }`}
                          >
                            <Camera className="h-4 w-4" />
                            {t('openInstagramDm')}
                          </a>

                          <a
                            href={whatsappProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => chooseProofChannel('WhatsApp')}
                            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                              selectedProofChannel === 'WhatsApp'
                                ? 'border-olive bg-olive !text-white'
                                : 'border-sand bg-ivory text-olive hover:border-olive'
                            }`}
                          >
                            <MessageCircle className="h-4 w-4" />
                            {t('openWhatsAppChat')}
                          </a>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-charcoal/55">{t('proofButtonsCopy')}</p>
                      </div>

                      <label>
                        <span className="label">{t('paymentNote')}</span>
                        <textarea
                          className="field min-h-24 rounded-2xl"
                          placeholder={t('paymentNotePlaceholder')}
                          {...register('paymentNote')}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="w-full lg:w-48">
                    <div className="rounded-3xl border border-sand bg-white p-3">
                      {instapayQr ? (
                        <img
                          src={instapayQr}
                          alt={t('instapayQrAlt')}
                          className="aspect-square w-full rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="grid aspect-square place-items-center rounded-2xl bg-ivory text-center text-sm font-bold text-charcoal/50">
                          {t('chooseQr')}
                        </div>
                      )}
                    </div>

                    <p className="mt-3 text-center text-xs leading-5 text-charcoal/55">
                      {t('instapayProofCopy')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 rounded-[24px] border border-sand bg-ivory/60 p-5">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-olive">
                  <ShieldCheck className="h-5 w-5" />
                </span>

                <p className="text-sm leading-6 text-charcoal/62">
                  {t('checkoutTrustCopy')}
                </p>
              </div>
            </div>

            <button className="btn-primary mt-7 w-full" disabled={isSubmitting || !hasPaymentMethod}>
              {isSubmitting ? t('placingOrder') : t('placeOrder')}
            </button>
          </div>
        </form>

        <aside className="h-fit rounded-[30px] border border-sand bg-white p-6 shadow-[0_22px_70px_rgba(79,91,58,0.1)]">
          <h2 className="font-serif text-3xl text-charcoal">{t('orderSummary')}</h2>

          <div className="mt-5 space-y-3">
            {items.map((item) => {
              const name = cartItemName(item, isArabic);

              return (
                <div key={item.product} className="flex gap-3 rounded-2xl border border-sand bg-ivory/45 p-3">
                  <img
                    src={item.image || '/images/products/placeholder.webp'}
                    alt={name}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-charcoal">{name}</p>

                    <p className="mt-1 text-sm text-charcoal/55">
                      {item.quantity} × {formatProductPrice(item.price, isArabic)}
                    </p>

                    {item.hasActiveOffer && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-gold">
                        <Tag className="h-3 w-3" />
                        {item.activeOffer?.title || t('offersTitle')}
                      </p>
                    )}
                  </div>

                  <p className="text-sm font-bold text-olive">
                    {formatProductPrice(itemLineTotal(item), isArabic)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-3 text-charcoal/75">
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

            {discountAmount > 0 && (
              <p className="flex justify-between gap-3 text-olive">
                <span>{discount?.discountCode?.code || t('discountCodesTitle')}</span>
                <strong>-{formatProductPrice(discountAmount, isArabic)}</strong>
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

          {paymentMethod === 'instapay' && instapayEnabled && (
            <div className="mt-5 rounded-2xl border border-gold/35 bg-gold/10 p-4 text-sm leading-6 text-charcoal/65">
              <div className="mb-2 flex items-center gap-2 font-bold text-gold">
                <MessageCircle className="h-4 w-4" />
                {t('instapayNextStep')}
              </div>
              {t('instapaySuccessCopy')}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
