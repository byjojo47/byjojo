import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Copy,
  Edit3,
  Mail,
  Save,
  Search,
  TicketPercent,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { formatProductPrice } from '../../lib/productLocalization.js';

const emptyCode = {
  code: '',
  discountType: 'percentage',
  discountValue: 10,
  minOrderAmount: 0,
  usageLimit: 0,
  expiresAt: '',
  isActive: true,
};

function toInputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function formatDate(value, t) {
  if (!value) return t('noExpiry');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t('noExpiry');
  return date.toLocaleDateString();
}

function isExpired(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date < new Date();
}

function discountPreview(form, isArabic) {
  const value = Number(form.discountValue || 0);

  if (form.discountType === 'percentage') {
    return isArabic ? `خصم ${value}%` : `${value}% off`;
  }

  return isArabic
    ? `خصم ${value.toLocaleString('ar-EG')} جنيه`
    : `${value.toLocaleString()} EGP off`;
}

function usageText(code, isArabic) {
  const used = Number(code.usedCount || 0);
  const limit = Number(code.usageLimit || 0);

  if (!limit) {
    return isArabic ? `${used} استخدام · بدون حد` : `${used} used · unlimited`;
  }

  return isArabic ? `${used} من ${limit} استخدام` : `${used} of ${limit} used`;
}

function usagePercent(code) {
  const used = Number(code.usedCount || 0);
  const limit = Number(code.usageLimit || 0);

  if (!limit) return 0;

  return Math.min(100, Math.round((used / limit) * 100));
}

function statusInfo(code, isArabic) {
  if (!code.isActive) {
    return {
      label: isArabic ? 'غير نشط' : 'Inactive',
      className: 'bg-charcoal/10 text-charcoal/55',
    };
  }

  if (isExpired(code.expiresAt)) {
    return {
      label: isArabic ? 'منتهي' : 'Expired',
      className: 'bg-red-50 text-red-700',
    };
  }

  if (code.usageLimit && Number(code.usedCount || 0) >= Number(code.usageLimit || 0)) {
    return {
      label: isArabic ? 'وصل للحد' : 'Limit reached',
      className: 'bg-gold/15 text-gold',
    };
  }

  return {
    label: isArabic ? 'نشط' : 'Active',
    className: 'bg-sage/15 text-olive',
  };
}

export default function AdminDiscountCodes() {
  const { t, isArabic } = useLanguage();
  const queryClient = useQueryClient();

  const [form, setForm] = useState(emptyCode);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['discount-codes'],
    queryFn: async () => (await api.get('/discount-codes')).data,
  });

  const codes = data?.codes || [];

  const visibleCodes = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return codes;

    return codes.filter((item) => (
      item.code?.toLowerCase().includes(q) ||
      item.discountType?.toLowerCase().includes(q)
    ));
  }, [codes, search]);

  const resetForm = () => {
    setForm(emptyCode);
    setEditingId(null);
    setSearch('');
  };

  const invalidateCodes = () => {
    queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue || 0),
        minOrderAmount: Number(form.minOrderAmount || 0),
        usageLimit: Number(form.usageLimit || 0),
        expiresAt: form.expiresAt || null,
      };

      return editingId
        ? (await api.put(`/discount-codes/${editingId}`, payload)).data
        : (await api.post('/discount-codes', payload)).data;
    },
    onSuccess: () => {
      toast.success(editingId ? t('discountCodeUpdated') : t('discountCodeCreated'));
      resetForm();
      invalidateCodes();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('couldNotSaveDiscountCode'));
    },
  });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/discount-codes/${id}`),
    onSuccess: () => {
      toast.success(t('discountDeleted'));
      invalidateCodes();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('couldNotDeleteDiscountCode'));
    },
  });

  const email = useMutation({
    mutationFn: (id) => api.post(`/discount-codes/${id}/email-customers`),
    onSuccess: () => toast.success(t('discountEmailSent')),
    onError: (error) => {
      toast.error(error.response?.data?.message || t('couldNotEmailDiscountCode'));
    },
  });

  const startEdit = (code) => {
    setEditingId(code._id);
    setForm({
      code: code.code || '',
      discountType: code.discountType || 'percentage',
      discountValue: Number(code.discountValue || 0),
      minOrderAmount: Number(code.minOrderAmount || 0),
      usageLimit: Number(code.usageLimit || 0),
      expiresAt: toInputDate(code.expiresAt),
      isActive: Boolean(code.isActive),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = (code) => {
    setConfirmDialog({
      title: t('confirmDeleteDiscountCode', { code: code.code }),
      message: t('confirmDeleteMessage'),
      confirmLabel: t('delete'),
      variant: 'danger',
      onConfirm: () => remove.mutate(code._id),
    });
  };

  const confirmEmail = (code) => {
    setConfirmDialog({
      title: t('confirmEmailDiscountCode', { code: code.code }),
      message: t('confirmEmailMessage'),
      confirmLabel: t('emailAction'),
      onConfirm: () => email.mutate(code._id),
    });
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(t('codeCopied'));
    } catch {
      toast.error(t('couldNotCopyCode'));
    }
  };

  return (
    <div>
      <ConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        confirmLabel={confirmDialog?.confirmLabel || t('confirmAction')}
        cancelLabel={t('cancel')}
        variant={confirmDialog?.variant}
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => {
          confirmDialog?.onConfirm?.();
          setConfirmDialog(null);
        }}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">{t('adminOwnerTools')}</p>
          <h1 className="mt-2 font-serif text-5xl text-charcoal">
            {t('discountCodesTitle')}
          </h1>
          <p className="note mt-4 max-w-3xl">
            {t('discountCodesNoteFull')}
          </p>
        </div>

        {editingId && (
          <button type="button" onClick={resetForm} className="btn-secondary">
            <X className="h-4 w-4" />
            {t('cancelEdit')}
          </button>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        className="mt-7 overflow-hidden rounded-[32px] border border-sand bg-white shadow-[0_22px_70px_rgba(79,91,58,0.1)]"
      >
        <div className="border-b border-sand/70 bg-ivory/70 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-serif text-3xl text-olive">
                {editingId ? t('updateCode') : t('createCode')}
              </h2>
              <p className="mt-1 text-sm text-charcoal/60">
                {t('discountCodeFormHelp')}
              </p>
            </div>

            <div className="w-fit rounded-full border border-sand bg-white px-4 py-2 text-sm font-bold text-olive">
              {discountPreview(form, isArabic)}
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="label">{t('code')}</span>
              <input
                className="field rounded-2xl uppercase"
                value={form.code}
                onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase().replace(/\s/g, '') })}
                placeholder="BYJOJO10"
                required
              />
            </label>

            <label>
              <span className="label">{t('discountType')}</span>
              <select
                className="field rounded-2xl"
                value={form.discountType}
                onChange={(event) => setForm({ ...form, discountType: event.target.value })}
              >
                <option value="percentage">{t('percentage')}</option>
                <option value="fixed">{t('fixed')}</option>
              </select>
            </label>

            <label>
              <span className="label">{t('discountValue')}</span>
              <input
                className="field rounded-2xl"
                type="number"
                min="0"
                value={form.discountValue}
                onChange={(event) => setForm({ ...form, discountValue: Number(event.target.value) })}
                required
              />
            </label>

            <label>
              <span className="label">{t('minimumOrder')}</span>
              <input
                className="field rounded-2xl"
                type="number"
                min="0"
                value={form.minOrderAmount}
                onChange={(event) => setForm({ ...form, minOrderAmount: Number(event.target.value) })}
              />
            </label>

            <label>
              <span className="label">{t('usageLimit')}</span>
              <input
                className="field rounded-2xl"
                type="number"
                min="0"
                value={form.usageLimit}
                onChange={(event) => setForm({ ...form, usageLimit: Number(event.target.value) })}
                placeholder={`0 = ${t('unlimited').toLowerCase()}`}
              />
            </label>

            <label>
              <span className="label">{t('expiryDate')}</span>
              <input
                className="field rounded-2xl"
                type="date"
                value={form.expiresAt}
                onChange={(event) => setForm({ ...form, expiresAt: event.target.value })}
              />
            </label>

            <label className="md:col-span-2">
              <span className="inline-flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-sand bg-ivory px-4 py-3 text-sm font-bold text-olive">
                <span>{t('active')}</span>
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-olive"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                />
              </span>
            </label>

            <div className="md:col-span-2 rounded-[26px] border border-sand bg-ivory/60 p-5">
              <p className="eyebrow">{t('ownerNote')}</p>
              <p className="mt-2 text-sm leading-6 text-charcoal/62">
                {t('discountOwnerNoteCopy')}
              </p>
            </div>
          </div>

          <aside className="h-fit rounded-[28px] border border-sand bg-ivory/70 p-5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-olive text-white">
              <TicketPercent className="h-5 w-5" />
            </div>

            <p className="eyebrow mt-5">{t('codePreview')}</p>

            <div className="mt-3 rounded-[24px] border border-dashed border-gold bg-white p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                {t('useAtCheckout')}
              </p>
              <p className="mt-2 break-all font-serif text-4xl text-olive">
                {form.code || 'BYJOJO10'}
              </p>
            </div>

            <div className="mt-4 rounded-3xl border border-sand bg-white p-4">
              <p className="text-sm font-bold text-sage">{t('discountCodesTitle')}</p>
              <p className="mt-1 font-serif text-3xl text-olive">
                {discountPreview(form, isArabic)}
              </p>
            </div>

            <div className="mt-4 space-y-3 text-sm text-charcoal/70">
              <p className="flex justify-between gap-3">
                <span>{t('minimumOrder')}</span>
                <strong className="text-charcoal">
                  {formatProductPrice(form.minOrderAmount || 0, isArabic)}
                </strong>
              </p>

              <p className="flex justify-between gap-3">
                <span>{t('usageLimit')}</span>
                <strong className="text-charcoal">
                  {Number(form.usageLimit || 0) ? form.usageLimit : t('unlimited')}
                </strong>
              </p>

              <p className="flex justify-between gap-3">
                <span>{t('expires')}</span>
                <strong className="text-charcoal">
                  {form.expiresAt || t('noExpiry')}
                </strong>
              </p>

              <p className="flex justify-between gap-3">
                <span>{t('status')}</span>
                <strong className={form.isActive ? 'text-olive' : 'text-charcoal/50'}>
                  {form.isActive ? t('active') : t('hidden')}
                </strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={save.isPending}
              className="btn-primary mt-5 w-full"
            >
              <Save className="h-4 w-4" />
              {save.isPending ? t('saving') : editingId ? t('updateCode') : t('createCode')}
            </button>
          </aside>
        </div>
      </form>

      <div className="mt-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-serif text-4xl text-charcoal">{t('existingCodes')}</h2>
            <p className="mt-1 text-sm text-charcoal/55">
              {t('existingCodesCopy')}
            </p>
          </div>

          <label className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" />
            <input
              className="field rounded-full pl-11"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('searchDiscountCodes')}
            />
          </label>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid gap-4">
            {visibleCodes.map((code) => {
              const status = statusInfo(code, isArabic);
              const percent = usagePercent(code);

              return (
                <article
                  key={code._id}
                  className="overflow-hidden rounded-[28px] border border-sand bg-white shadow-[0_18px_55px_rgba(79,91,58,0.08)]"
                >
                  <div className="grid gap-5 p-5 xl:grid-cols-[1fr_360px] xl:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${status.className}`}>
                          {status.label}
                        </span>

                        <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-gold">
                          {discountPreview(code, isArabic)}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => copyCode(code.code)}
                          className="group inline-flex items-center gap-3 rounded-[22px] border border-dashed border-gold bg-ivory/70 px-5 py-3 transition hover:bg-white"
                        >
                          <span className="font-serif text-3xl text-olive">{code.code}</span>
                          <Copy className="h-4 w-4 text-gold transition group-hover:scale-110" />
                        </button>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-charcoal/58 sm:grid-cols-3">
                        <InfoPill
                          label={t('minimum')}
                          value={formatProductPrice(code.minOrderAmount || 0, isArabic)}
                        />

                        <InfoPill
                          label={t('expires')}
                          value={formatDate(code.expiresAt, t)}
                          icon={CalendarDays}
                        />

                        <InfoPill
                          label={t('usageLimit')}
                          value={usageText(code, isArabic)}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="rounded-2xl border border-sand bg-ivory/55 p-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-bold text-charcoal">{t('usageProgress')}</span>
                          <span className="text-charcoal/55">{percent}%</span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-olive transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <p className="mt-3 text-xs leading-5 text-charcoal/50">
                          {code.usageLimit
                            ? t('usesRemaining', { count: Number(code.usageLimit || 0) - Number(code.usedCount || 0) })
                            : t('noUsageLimit')}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 xl:justify-end">
                        <button
                          type="button"
                          className="btn-secondary px-4 py-2"
                          onClick={() => startEdit(code)}
                        >
                          <Edit3 className="h-4 w-4" />
                          {t('edit')}
                        </button>

                        <button
                          type="button"
                          className="btn-secondary px-4 py-2"
                          onClick={() => confirmEmail(code)}
                          disabled={email.isPending}
                        >
                          <Mail className="h-4 w-4" />
                          {t('emailAction')}
                        </button>

                        <button
                          type="button"
                          className="btn-secondary px-4 py-2 text-red-700"
                          onClick={() => confirmDelete(code)}
                          disabled={remove.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {!visibleCodes.length && (
              <div className="rounded-[28px] border border-sand bg-white p-8 text-center">
                <TicketPercent className="mx-auto h-10 w-10 text-sage" />
                <h3 className="mt-3 font-serif text-3xl text-charcoal">
                  {t('discountCodesFoundEmpty')}
                </h3>
                <p className="mt-2 text-charcoal/60">
                  {t('discountCodesFoundEmptyCopy')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoPill({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-sand bg-ivory/60 px-4 py-3">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-sage">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className="mt-1 font-bold text-charcoal">{value}</p>
    </div>
  );
}
