import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Edit3,
  Mail,
  PackageCheck,
  Save,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const emptyOffer = {
  title: '',
  description: '',
  products: [],
  discountType: 'percentage',
  discountValue: 10,
  startsAt: '',
  endsAt: '',
  isActive: true,
};

function productImage(product) {
  return (
    product.images?.find((image) => image.isMain)?.url ||
    product.images?.[0]?.url ||
    '/images/products/placeholder.webp'
  );
}

function productPrice(product) {
  return `${Number(product.price || 0).toLocaleString()} EGP`;
}

function toInputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function getProductIds(products = []) {
  return products.map((product) => String(product._id || product));
}

function discountPreview(form) {
  const value = Number(form.discountValue || 0);

  if (form.discountType === 'percentage') return `${value}% off`;
  if (form.discountType === 'fixed') return `${value.toLocaleString()} EGP off`;
  return `Sale price: ${value.toLocaleString()} EGP`;
}

function calculatePreviewPrice(product, form) {
  const price = Number(product.price || 0);
  const value = Number(form.discountValue || 0);

  if (!price || !value) return price;

  if (form.discountType === 'percentage') {
    return Math.max(0, Math.round(price - (price * value) / 100));
  }

  if (form.discountType === 'fixed') {
    return Math.max(0, Math.round(price - value));
  }

  return Math.max(0, Math.round(value));
}

export default function AdminOffers() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [form, setForm] = useState(emptyOffer);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);

  const { data: offerData, isLoading: offersLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => (await api.get('/offers')).data,
  });

  const { data: productData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => (await api.get('/products?admin=true')).data,
  });

  const offers = offerData?.offers || [];
  const products = productData?.products || [];

  const selectedProductIds = useMemo(
    () => new Set(getProductIds(form.products)),
    [form.products],
  );

  const selectedProducts = useMemo(
    () => products.filter((product) => selectedProductIds.has(String(product._id))),
    [products, selectedProductIds],
  );

  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return products;

    return products.filter((product) => (
      product.name?.toLowerCase().includes(q) ||
      product.nameAr?.toLowerCase().includes(q) ||
      product.category?.name?.toLowerCase().includes(q)
    ));
  }, [products, search]);

  const resetForm = () => {
    setForm(emptyOffer);
    setEditingId(null);
    setSearch('');
  };

  const invalidateOfferRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['offers'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['home-products'] });
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        products: getProductIds(form.products),
        discountValue: Number(form.discountValue || 0),
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
      };

      return editingId
        ? (await api.put(`/offers/${editingId}`, payload)).data
        : (await api.post('/offers', payload)).data;
    },
    onSuccess: () => {
      toast.success(editingId ? 'Offer updated' : 'Offer created');
      resetForm();
      invalidateOfferRelatedQueries();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Could not save offer');
    },
  });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/offers/${id}`),
    onSuccess: () => {
      toast.success('Offer deleted');
      invalidateOfferRelatedQueries();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Could not delete offer');
    },
  });

  const email = useMutation({
    mutationFn: (id) => api.post(`/offers/${id}/email-customers`),
    onSuccess: () => toast.success('Offer email sent to customers'),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Could not email offer');
    },
  });

  const toggleProduct = (productId) => {
    setForm((current) => {
      const currentIds = new Set(getProductIds(current.products));

      if (currentIds.has(productId)) {
        currentIds.delete(productId);
      } else {
        currentIds.add(productId);
      }

      return {
        ...current,
        products: [...currentIds],
      };
    });
  };

  const startEdit = (offer) => {
    setEditingId(offer._id);
    setForm({
      title: offer.title || '',
      description: offer.description || '',
      products: getProductIds(offer.products || []),
      discountType: offer.discountType || 'percentage',
      discountValue: Number(offer.discountValue || 0),
      startsAt: toInputDate(offer.startsAt),
      endsAt: toInputDate(offer.endsAt),
      isActive: Boolean(offer.isActive),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = (offer) => {
    setConfirmDialog({
      title: t('confirmDeleteOffer', { title: offer.title }),
      message: t('confirmDeleteMessage'),
      confirmLabel: t('delete'),
      variant: 'danger',
      onConfirm: () => remove.mutate(offer._id),
    });
  };

  const confirmEmail = (offer) => {
    setConfirmDialog({
      title: t('confirmEmailOffer', { title: offer.title }),
      message: t('confirmEmailMessage'),
      confirmLabel: t('emailAction'),
      onConfirm: () => email.mutate(offer._id),
    });
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
          <h1 className="mt-2 font-serif text-5xl text-charcoal">{t('offersTitle')}</h1>
          <p className="note mt-4 max-w-3xl">
            Create real offers for selected products. When an offer is active, customers will automatically see the discounted price in the shop, product page, cart, and checkout.
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
                {editingId ? t('updateOffer') : t('createOffer')}
              </h2>
              <p className="mt-1 text-sm text-charcoal/60">
                Choose the products, discount value, and active dates. The store will calculate the final sale price automatically.
              </p>
            </div>
            <div className="w-fit rounded-full border border-sand bg-white px-4 py-2 text-sm font-bold text-olive">
              {selectedProducts.length} selected
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="label">{t('offerTitle')}</span>
                <input
                  className="field rounded-2xl"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Summer table offer"
                  required
                />
              </label>

              <label>
                <span className="label">Discount type</span>
                <select
                  className="field rounded-2xl"
                  value={form.discountType}
                  onChange={(event) => setForm({ ...form, discountType: event.target.value })}
                >
                  <option value="percentage">{t('percentage')}</option>
                  <option value="fixed">{t('fixed')}</option>
                  <option value="salePrice">{t('salePrice')}</option>
                </select>
              </label>

              <label>
                <span className="label">Discount value</span>
                <input
                  className="field rounded-2xl"
                  type="number"
                  min="0"
                  value={form.discountValue}
                  onChange={(event) => setForm({ ...form, discountValue: Number(event.target.value) })}
                  required
                />
              </label>

              <label className="flex items-end">
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

              <label>
                <span className="label">Starts at</span>
                <input
                  className="field rounded-2xl"
                  type="date"
                  value={form.startsAt}
                  onChange={(event) => setForm({ ...form, startsAt: event.target.value })}
                />
              </label>

              <label>
                <span className="label">Ends at</span>
                <input
                  className="field rounded-2xl"
                  type="date"
                  value={form.endsAt}
                  onChange={(event) => setForm({ ...form, endsAt: event.target.value })}
                />
              </label>

              <label className="md:col-span-2">
                <span className="label">{t('description')}</span>
                <textarea
                  className="field min-h-28 rounded-2xl"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="A short message customers may see in emails."
                />
              </label>
            </div>

            <div className="rounded-[28px] border border-sand bg-ivory/50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-serif text-3xl text-charcoal">Choose products</h3>
                  <p className="mt-1 text-sm text-charcoal/60">
                    This offer only applies to the products selected here.
                  </p>
                </div>
                <label className="relative w-full md:max-w-xs">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" />
                  <input
                    className="field rounded-full pl-11"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products..."
                  />
                </label>
              </div>

              {productsLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="mt-5 grid max-h-[520px] gap-3 overflow-y-auto pr-1">
                  {visibleProducts.map((product) => {
                    const checked = selectedProductIds.has(String(product._id));
                    const previewPrice = calculatePreviewPrice(product, form);

                    return (
                      <button
                        type="button"
                        key={product._id}
                        onClick={() => toggleProduct(String(product._id))}
                        className={`grid gap-3 rounded-[22px] border p-3 text-left transition sm:grid-cols-[74px_1fr_auto] sm:items-center ${
                          checked
                            ? 'border-olive bg-white shadow-[0_14px_35px_rgba(79,91,58,0.12)]'
                            : 'border-sand bg-white/72 hover:border-sage'
                        }`}
                      >
                        <img
                          src={productImage(product)}
                          alt={product.name}
                          className="h-20 w-20 rounded-2xl object-cover sm:h-[74px] sm:w-[74px]"
                        />

                        <span>
                          <span className="block font-bold text-charcoal">{product.name}</span>
                          <span className="mt-1 block text-sm text-charcoal/55">
                            {product.category?.name || 'No category'} · {productPrice(product)}
                          </span>
                          {checked && (
                            <span className="mt-2 block text-sm font-bold text-olive">
                              Preview: {previewPrice.toLocaleString()} EGP
                            </span>
                          )}
                        </span>

                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                          checked
                            ? 'border-olive bg-olive text-white'
                            : 'border-sand bg-ivory text-transparent'
                        }`}
                        >
                          <PackageCheck className="h-4 w-4" />
                        </span>
                      </button>
                    );
                  })}

                  {!visibleProducts.length && (
                    <div className="rounded-2xl border border-sand bg-white p-5 text-center text-charcoal/60">
                      No products found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <aside className="h-fit rounded-[28px] border border-sand bg-ivory/70 p-5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-olive text-white">
              <Tag className="h-5 w-5" />
            </div>

            <p className="eyebrow mt-5">Offer preview</p>
            <h3 className="mt-2 font-serif text-3xl leading-tight text-charcoal">
              {form.title || 'Untitled offer'}
            </h3>

            <div className="mt-4 rounded-3xl border border-sand bg-white p-4">
              <p className="text-sm font-bold text-sage">Discount</p>
              <p className="mt-1 font-serif text-3xl text-olive">{discountPreview(form)}</p>
            </div>

            <div className="mt-4 space-y-3 text-sm text-charcoal/70">
              <p className="flex items-center justify-between gap-3">
                <span>Products</span>
                <strong className="text-charcoal">{selectedProducts.length}</strong>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span>Status</span>
                <strong className={form.isActive ? 'text-olive' : 'text-charcoal/50'}>
                  {form.isActive ? 'Active' : 'Inactive'}
                </strong>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span>Starts</span>
                <strong className="text-charcoal">{form.startsAt || 'Now'}</strong>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span>Ends</span>
                <strong className="text-charcoal">{form.endsAt || 'No end date'}</strong>
              </p>
            </div>

            {!!selectedProducts.length && (
              <div className="mt-5 rounded-3xl border border-sand bg-white p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-sage">
                  Selected pieces
                </p>
                <div className="space-y-2">
                  {selectedProducts.slice(0, 4).map((product) => (
                    <p key={product._id} className="truncate text-sm font-bold text-charcoal">
                      {product.name}
                    </p>
                  ))}
                  {selectedProducts.length > 4 && (
                    <p className="text-sm text-charcoal/55">
                      +{selectedProducts.length - 4} more products
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={save.isPending}
              className="btn-primary mt-5 w-full"
            >
              <Save className="h-4 w-4" />
              {save.isPending ? t('saving') : editingId ? t('updateOffer') : t('createOffer')}
            </button>
          </aside>
        </div>
      </form>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-serif text-4xl text-charcoal">Existing offers</h2>
          <div className="rounded-full border border-sand bg-white px-4 py-2 text-sm font-bold text-olive">
            {offers.length} offers
          </div>
        </div>

        {offersLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid gap-4">
            {offers.map((offer) => {
              const productCount = offer.products?.length || 0;

              return (
                <article
                  key={offer._id}
                  className="overflow-hidden rounded-[28px] border border-sand bg-white shadow-[0_18px_55px_rgba(79,91,58,0.08)]"
                >
                  <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                          offer.isActive
                            ? 'bg-sage/15 text-olive'
                            : 'bg-charcoal/10 text-charcoal/55'
                        }`}
                        >
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </span>

                        <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-gold">
                          {offer.discountType}: {Number(offer.discountValue || 0).toLocaleString()}
                        </span>
                      </div>

                      <h3 className="mt-3 font-serif text-3xl text-charcoal">{offer.title}</h3>

                      {offer.description && (
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-charcoal/62">
                          {offer.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-3 text-sm text-charcoal/58">
                        <span className="inline-flex items-center gap-2">
                          <PackageCheck className="h-4 w-4 text-sage" />
                          {productCount} products
                        </span>

                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-sage" />
                          {offer.startsAt ? toInputDate(offer.startsAt) : 'Now'} → {offer.endsAt ? toInputDate(offer.endsAt) : 'No end'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => startEdit(offer)}
                      >
                        <Edit3 className="h-4 w-4" />
                        {t('edit')}
                      </button>

                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => confirmEmail(offer)}
                        disabled={email.isPending}
                      >
                        <Mail className="h-4 w-4" />
                        {t('emailAction')}
                      </button>

                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => confirmDelete(offer)}
                        disabled={remove.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {!offers.length && (
              <div className="rounded-[28px] border border-sand bg-white p-8 text-center">
                <Tag className="mx-auto h-9 w-9 text-sage" />
                <h3 className="mt-3 font-serif text-3xl text-charcoal">No offers yet</h3>
                <p className="mt-2 text-charcoal/60">
                  Create your first offer and choose which products it should apply to.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
