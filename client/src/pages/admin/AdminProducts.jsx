import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, ImagePlus, Plus, Save, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const emptyImage = { url: '', publicId: '', isMain: true };

const emptyProduct = {
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  price: 4500,
  category: '',
  stock: 10,
  featured: false,
  isActive: true,
  images: [emptyImage],
};

function productImage(product) {
  return product.images?.find((image) => image.isMain)?.url || product.images?.[0]?.url || '';
}

function canDeleteFromCloudinary(publicId) {
  return Boolean(publicId && String(publicId).startsWith('byjojo/'));
}

export default function AdminProducts() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState(null);

  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [uploadingImageIndex, setUploadingImageIndex] = useState(null);
  const [deletingImageIndex, setDeletingImageIndex] = useState(null);

  const { data: productData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => (await api.get('/products?admin=true')).data,
  });

  const { data: categoryData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await api.get('/categories?admin=true')).data,
  });

  const products = productData?.products || [];
  const categories = categoryData?.categories || [];

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
    setForm(emptyProduct);
    setEditingId(null);
  };

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['home-products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const deleteCloudinaryImage = async (publicId) => {
    if (!canDeleteFromCloudinary(publicId)) return;

    await api.delete('/uploads/image', {
      data: { publicId },
    });
  };

  const save = useMutation({
    mutationFn: async () => {
      const images = form.images
        .filter((image) => image.url.trim())
        .map((image, index) => ({
          ...image,
          url: image.url.trim(),
          isMain: image.isMain || index === 0,
        }));

      const payload = {
        ...form,
        price: Number(form.price || 0),
        stock: Number(form.stock || 0),
        images,
      };

      return editingId
        ? (await api.put(`/products/${editingId}`, payload)).data
        : (await api.post('/products', payload)).data;
    },
    onSuccess: () => {
      toast.success(t('productSaved'));
      resetForm();
      invalidateProducts();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not save product'),
  });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success(t('productDeleted'));
      invalidateProducts();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not delete product'),
  });

  const uploadImage = async (index, file) => {
    if (!file) return;

    const previousPublicId = form.images[index]?.publicId;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'byjojo/products');

    try {
      setUploadingImageIndex(index);

      const { data } = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setForm((current) => ({
        ...current,
        images: current.images.map((image, imageIndex) => (
          imageIndex === index
            ? {
                ...image,
                url: data.image.url,
                publicId: data.image.publicId,
                isMain: image.isMain || index === 0,
              }
            : image
        )),
      }));

      if (canDeleteFromCloudinary(previousPublicId) && previousPublicId !== data.image.publicId) {
        deleteCloudinaryImage(previousPublicId).catch(console.error);
      }

      toast.success(t('imageUploaded'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('imageUploadFailed'));
    } finally {
      setUploadingImageIndex(null);
    }
  };

  const addImageField = () => {
    setForm((current) => ({
      ...current,
      images: [...current.images, { url: '', publicId: '', isMain: false }],
    }));
  };

  const removeImageField = async (index) => {
    const image = form.images[index];

    try {
      setDeletingImageIndex(index);

      if (canDeleteFromCloudinary(image?.publicId)) {
        await deleteCloudinaryImage(image.publicId);
      }

      setForm((current) => {
        const nextImages = current.images.filter((_, imageIndex) => imageIndex !== index);
        const safeImages = nextImages.length
          ? nextImages.map((nextImage, imageIndex) => ({
              ...nextImage,
              isMain: imageIndex === 0 ? true : nextImage.isMain,
            }))
          : [{ url: '', publicId: '', isMain: true }];

        if (!safeImages.some((nextImage) => nextImage.isMain)) {
          safeImages[0].isMain = true;
        }

        return {
          ...current,
          images: safeImages,
        };
      });

      if (image?.url) {
        toast.success('Image removed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not remove image');
    } finally {
      setDeletingImageIndex(null);
    }
  };

  const setMainImage = (index) => {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => ({
        ...image,
        isMain: imageIndex === index,
      })),
    }));
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      nameAr: product.nameAr || '',
      description: product.description || '',
      descriptionAr: product.descriptionAr || '',
      price: product.price || 0,
      category: product.category?._id || product.category || '',
      stock: product.stock || 0,
      featured: Boolean(product.featured),
      isActive: Boolean(product.isActive),
      images: product.images?.length ? product.images : [{ url: '', publicId: '', isMain: true }],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <h1 className="mt-2 font-serif text-5xl text-charcoal">{t('adminProductsTitle')}</h1>
          <p className="note mt-4 max-w-3xl">{t('adminProductsNote')}</p>
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
        className="mt-7 max-w-full overflow-hidden rounded-[32px] border border-sand bg-white shadow-[0_22px_70px_rgba(79,91,58,0.1)]"
      >
        <div className="border-b border-sand/70 bg-ivory/70 px-4 py-5 sm:px-6">
          <h2 className="font-serif text-3xl text-olive">
            {editingId ? t('adminEditProduct') : t('adminAddProduct')}
          </h2>
          <p className="mt-1 text-sm text-charcoal/60">{t('adminProductImageNote')}</p>
        </div>

        <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label={t('productName')}>
              <input
                className="field rounded-2xl"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </AdminField>

            <AdminField label={t('productNameAr')}>
              <input
                className="field rounded-2xl"
                dir="rtl"
                value={form.nameAr}
                onChange={(event) => setForm({ ...form, nameAr: event.target.value })}
              />
            </AdminField>

            <AdminField label={t('priceEgp')}>
              <input
                className="field rounded-2xl"
                type="number"
                min="0"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
                required
              />
            </AdminField>

            <AdminField label={t('category')}>
              <select
                className="field rounded-2xl"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                required
              >
                <option value="">{t('selectCategory')}</option>
                {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </AdminField>

            <AdminField label={t('stock')}>
              <input
                className="field rounded-2xl"
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })}
              />
            </AdminField>

            <AdminField label={t('description')} className="md:col-span-2">
              <textarea
                className="field min-h-36 rounded-2xl"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </AdminField>

            <AdminField label={t('descriptionAr')} className="md:col-span-2">
              <textarea
                className="field min-h-36 rounded-2xl"
                dir="rtl"
                value={form.descriptionAr}
                onChange={(event) => setForm({ ...form, descriptionAr: event.target.value })}
              />
            </AdminField>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <Toggle label={t('featuredOnHome')} checked={form.featured} onChange={(checked) => setForm({ ...form, featured: checked })} />
              <Toggle label={t('visibleInShop')} checked={form.isActive} onChange={(checked) => setForm({ ...form, isActive: checked })} />
            </div>
          </div>

          <aside className="min-w-0 rounded-[28px] border border-sand bg-ivory/70 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-2xl text-charcoal">{t('productImages')}</h3>
                <p className="mt-1 text-sm text-charcoal/60">{t('mainImageNote')}</p>
              </div>
              <button type="button" onClick={addImageField} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-olive text-white">
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {form.images.map((image, index) => (
                <div key={`${image.publicId || image.url || 'empty'}-${index}`} className="rounded-3xl border border-sand bg-white p-3">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-beige sm:h-24 sm:w-24">
                      {image.url ? (
                        <img src={image.url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sage"><ImagePlus /></div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-sand bg-ivory px-4 py-3 text-sm font-bold text-olive transition hover:border-olive hover:bg-white">
                        <ImagePlus className="h-4 w-4" />
                        {uploadingImageIndex === index ? t('uploading') : image.url ? t('replaceImage') : t('chooseImage')}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingImageIndex !== null || deletingImageIndex !== null}
                          onChange={(event) => uploadImage(index, event.target.files?.[0])}
                        />
                      </label>

                      {image.url && (
                        <p className="mt-2 break-all text-xs leading-5 text-charcoal/45">
                          {image.publicId || image.url}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setMainImage(index)}
                          className={`rounded-full px-3 py-1 text-xs font-bold ${image.isMain ? 'bg-olive text-white' : 'bg-beige text-olive'}`}
                        >
                          {image.isMain ? t('mainImage') : t('setMain')}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          disabled={deletingImageIndex === index}
                          className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 disabled:opacity-50"
                        >
                          {deletingImageIndex === index ? t('loading') : t('remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="flex flex-col gap-3 border-t border-sand/70 bg-ivory/70 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-charcoal/60">
            {form.images.filter((image) => image.url.trim()).length} {t('imagesReady')}
          </p>

          <button className="btn-primary" disabled={save.isPending || uploadingImageIndex !== null || deletingImageIndex !== null}>
            <Save className="h-4 w-4" />
            {save.isPending ? t('saving') : editingId ? t('updateProduct') : t('addProduct')}
          </button>
        </div>
      </form>

      <div className="mt-8 rounded-[28px] border border-sand bg-white/80 p-4">
        <input
          className="field rounded-full"
          placeholder={t('searchProducts')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="mt-6 grid gap-4">
          {visibleProducts.map((product) => (
            <article key={product._id} className="grid gap-4 rounded-[28px] border border-sand bg-white p-4 shadow-sm md:grid-cols-[112px_1fr_auto] md:items-center">
              <div className="h-28 w-28 overflow-hidden rounded-3xl bg-beige">
                {productImage(product) ? (
                  <img src={productImage(product)} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sage"><ImagePlus /></div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill active={product.isActive}>{product.isActive ? t('active') : t('hidden')}</StatusPill>
                  <StatusPill active={product.featured}>{product.featured ? t('featured') : t('normal')}</StatusPill>
                </div>

                <h3 className="mt-3 font-serif text-3xl text-charcoal">{product.name}</h3>

                {product.nameAr && <p className="mt-1 text-sm font-bold text-olive" dir="rtl">{product.nameAr}</p>}

                <p className="mt-1 text-sm text-charcoal/60">
                  {product.price?.toLocaleString()} EGP · {product.category?.name || 'No category'} · {product.stock} {t('stock')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary px-4 py-2" type="button" onClick={() => startEdit(product)}>
                  <Edit3 className="h-4 w-4" />
                  {t('edit')}
                </button>

                <button
                  className="btn-secondary px-4 py-2 text-red-700"
                  type="button"
                  onClick={() => setConfirmDialog({
                    title: t('confirmDeleteProduct', { name: product.name }),
                    message: t('confirmDeleteMessage'),
                    confirmLabel: t('delete'),
                    variant: 'danger',
                    onConfirm: () => remove.mutate(product._id),
                  })}
                >
                  <Trash2 className="h-4 w-4" />
                  {t('delete')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
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

function Toggle({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-3 rounded-full border border-sand bg-ivory px-4 py-3 text-sm font-bold text-olive">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function StatusPill({ active, children }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? 'bg-sage/15 text-olive' : 'bg-sand/35 text-charcoal/60'}`}>
      {children}
    </span>
  );
}
