import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Banknote, CreditCard, ImagePlus, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

function normalizeSettings(settings) {
  return {
    storeName: settings?.storeName || 'ByJojo',
    whatsappNumber: settings?.whatsappNumber || '',
    instagramUrl: settings?.instagramUrl || '',
    contactEmail: settings?.contactEmail || '',
    deliveryFee: Number(settings?.deliveryFee || 0),
    announcementText: settings?.announcementText || '',
    payment: {
      cashEnabled: settings?.payment?.cashEnabled !== false,
      instapayEnabled: settings?.payment?.instapayEnabled !== false,
      instapayNumber: settings?.payment?.instapayNumber || '',
      instapayQr: {
        url: settings?.payment?.instapayQr?.url || '',
        publicId: settings?.payment?.instapayQr?.publicId || '',
      },
    },
  };
}

export default function AdminSettings() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [uploadingQr, setUploadingQr] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get('/settings')).data,
  });

  useEffect(() => {
    if (data?.settings) {
      setForm(normalizeSettings(data.settings));
    }
  }, [data]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updatePayment = (field, value) => {
    setForm((current) => ({
      ...current,
      payment: {
        ...current.payment,
        [field]: value,
      },
    }));
  };

  const save = useMutation({
    mutationFn: () => api.put('/settings', normalizeSettings(form)),
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not save settings'),
  });

  const uploadInstapayQr = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'byjojo/settings');

    try {
      setUploadingQr(true);

      const { data: uploadData } = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setForm((current) => ({
        ...current,
        payment: {
          ...current.payment,
          instapayQr: {
            url: uploadData.image.url,
            publicId: uploadData.image.publicId,
          },
        },
      }));

      toast.success('Instapay QR uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'QR upload failed');
    } finally {
      setUploadingQr(false);
    }
  };

  if (isLoading || !form) return <LoadingSpinner />;

  return (
    <div>
      <div>
        <p className="eyebrow">{t('settingsEyebrow')}</p>
        <h1 className="mt-2 font-serif text-5xl text-charcoal">{t('settingsTitle')}</h1>
        <p className="note mt-4 max-w-3xl">
          Control checkout, delivery fees, contact links, announcements, and payment methods. Changes update the customer website automatically.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        className="mt-7 max-w-full overflow-hidden rounded-[32px] border border-sand bg-white shadow-[0_22px_70px_rgba(79,91,58,0.1)]"
      >
        <div className="border-b border-sand/70 bg-ivory/70 px-4 py-5 sm:px-6">
          <h2 className="font-serif text-3xl text-olive">{t('storeSettings')}</h2>
          <p className="mt-1 text-sm text-charcoal/60">
            Keep the store information, payment options, and customer-facing announcement updated from here.
          </p>
        </div>

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label={t('storeName')}>
                <input
                  className="field rounded-2xl"
                  value={form.storeName}
                  onChange={(event) => updateField('storeName', event.target.value)}
                />
              </AdminField>

              <AdminField label={t('deliveryFee')}>
                <input
                  className="field rounded-2xl"
                  type="number"
                  min="0"
                  value={form.deliveryFee}
                  onChange={(event) => updateField('deliveryFee', Number(event.target.value))}
                />
              </AdminField>

              <AdminField label={t('whatsappNumber')}>
                <input
                  className="field rounded-2xl"
                  value={form.whatsappNumber}
                  onChange={(event) => updateField('whatsappNumber', event.target.value)}
                  placeholder="+20 10 00000000"
                />
              </AdminField>

              <AdminField label={t('instagramUrl')}>
                <input
                  className="field rounded-2xl"
                  value={form.instagramUrl}
                  onChange={(event) => updateField('instagramUrl', event.target.value)}
                  placeholder="https://instagram.com/byjojoeg"
                />
              </AdminField>

              <AdminField label={t('contactEmail')}>
                <input
                  className="field rounded-2xl"
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) => updateField('contactEmail', event.target.value)}
                  placeholder="hello@byjojo.com"
                />
              </AdminField>

              <AdminField label={t('instapayNumber')}>
                <input
                  className="field rounded-2xl"
                  value={form.payment.instapayNumber}
                  onChange={(event) => updatePayment('instapayNumber', event.target.value)}
                  placeholder="Instapay number or handle"
                />
              </AdminField>

              <AdminField label={t('announcementText')} className="md:col-span-2">
                <textarea
                  className="field min-h-28 rounded-2xl"
                  value={form.announcementText}
                  onChange={(event) => updateField('announcementText', event.target.value)}
                  placeholder="Limited pieces now available"
                />
              </AdminField>
            </div>

            <div className="rounded-[28px] border border-sand bg-ivory/60 p-4 sm:p-5">
              <div>
                <p className="eyebrow">{t('paymentMethods')}</p>
                <h3 className="mt-2 font-serif text-3xl text-charcoal">{t('checkoutAvailability')}</h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/60">
                  Turn payment methods on or off. Customers will only see the enabled options during checkout.
                </p>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <PaymentToggle
                  icon={Banknote}
                  title={t('cashOnDelivery')}
                  description="Customers can pay when the order arrives."
                  checked={form.payment.cashEnabled}
                  onChange={(checked) => updatePayment('cashEnabled', checked)}
                />

                <PaymentToggle
                  icon={CreditCard}
                  title={t('instapay')}
                  description="Customers can transfer by Instapay and send proof."
                  checked={form.payment.instapayEnabled}
                  onChange={(checked) => updatePayment('instapayEnabled', checked)}
                />
              </div>

              {!form.payment.cashEnabled && !form.payment.instapayEnabled && (
                <p className="mt-4 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm font-bold text-gold">
                  At least one payment method should be enabled before launch.
                </p>
              )}
            </div>
          </div>

          <aside className="min-w-0 rounded-[28px] border border-sand bg-ivory/70 p-4 sm:p-5">
            <h3 className="font-serif text-2xl text-charcoal">{t('instapayQr')}</h3>
            <p className="mt-1 text-sm text-charcoal/60">{t('instapayQrCopy')}</p>

            <div className="mt-5 overflow-hidden rounded-3xl border border-sand bg-white">
              <div className="flex h-64 items-center justify-center bg-beige">
                {form.payment.instapayQr.url ? (
                  <img
                    src={form.payment.instapayQr.url}
                    alt="Instapay QR"
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <ImagePlus className="h-12 w-12 text-sage" />
                )}
              </div>
            </div>

            <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-sand bg-white px-4 py-4 text-sm font-bold text-olive transition hover:border-olive hover:bg-ivory">
              <ImagePlus className="h-4 w-4" />
              {uploadingQr ? t('uploading') : form.payment.instapayQr.url ? t('replaceQr') : t('chooseQr')}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingQr}
                onChange={(event) => uploadInstapayQr(event.target.files?.[0])}
              />
            </label>

            {!form.payment.instapayEnabled && (
              <p className="mt-4 rounded-2xl border border-sand bg-white px-4 py-3 text-sm leading-6 text-charcoal/60">
                Instapay is currently disabled. The QR and number are saved, but customers will not see Instapay at checkout.
              </p>
            )}
          </aside>
        </div>

        <div className="flex justify-end border-t border-sand/70 bg-ivory/70 px-4 py-5 sm:px-6">
          <button className="btn-primary" disabled={save.isPending || uploadingQr}>
            <Save className="h-4 w-4" />
            {save.isPending ? t('saving') : t('saveSettings')}
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminField({ label, children, className = '' }) {
  return (
    <label className={className}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function PaymentToggle({ icon: Icon, title, description, checked, onChange }) {
  return (
    <label
      className={`flex cursor-pointer gap-4 rounded-[24px] border p-4 transition ${
        checked
          ? 'border-olive bg-white shadow-[0_14px_35px_rgba(79,91,58,0.1)]'
          : 'border-sand bg-white/60'
      }`}
    >
      <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
        checked ? 'bg-olive text-white' : 'bg-ivory text-sage'
      }`}
      >
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-bold text-charcoal">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-charcoal/58">{description}</span>
      </span>

      <input
        type="checkbox"
        className="mt-1 h-5 w-5 accent-olive"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
