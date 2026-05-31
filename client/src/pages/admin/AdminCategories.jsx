import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, ImagePlus, Save, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const emptyCategory = { name: '', image: '', showOnHome: true, isActive: true };

export default function AdminCategories() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const { data } = useQuery({ queryKey: ['admin-categories'], queryFn: async () => (await api.get('/categories?admin=true')).data });
  const categories = data?.categories || [];

  const resetForm = () => {
    setForm(emptyCategory);
    setEditingId(null);
  };

  const save = useMutation({
    mutationFn: () => editingId ? api.put(`/categories/${editingId}`, form) : api.post('/categories', form),
    onSuccess: () => {
      toast.success(editingId ? 'Category updated' : 'Category added');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['home-categories'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not save category'),
  });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['home-categories'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not delete category'),
  });

  const uploadCategoryImage = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'byjojo/categories');

    try {
      setUploadingImage(true);
      const { data } = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((current) => ({ ...current, image: data.image.url }));
      toast.success('Category image uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
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
          <p className="eyebrow">{t('storeStructure')}</p>
          <h1 className="mt-2 font-serif text-5xl text-charcoal">{t('adminCategoriesTitle')}</h1>
          <p className="note mt-4 max-w-3xl">{t('adminCategoriesNote')}</p>
        </div>
        {editingId && (
          <button type="button" onClick={resetForm} className="btn-secondary">
            <X className="h-4 w-4" />
            {t('cancelEdit')}
          </button>
        )}
      </div>

      <form onSubmit={(event) => { event.preventDefault(); save.mutate(); }} className="mt-7 max-w-full overflow-hidden rounded-[32px] border border-sand bg-white shadow-[0_22px_70px_rgba(79,91,58,0.1)]">
        <div className="border-b border-sand/70 bg-ivory/70 px-4 py-5 sm:px-6">
          <h2 className="font-serif text-3xl text-olive">{editingId ? t('editCategory') : t('addNewCategory')}</h2>
          <p className="mt-1 text-sm text-charcoal/60">{t('adminProductImageNote')}</p>
        </div>

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4">
            <label>
              <span className="label">{t('categoryName')}</span>
              <input className="field rounded-2xl" placeholder={t('categoryName')} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
            <div>
              <span className="label">{t('categoryImage')}</span>
              <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-sand bg-ivory px-4 py-4 text-sm font-bold text-olive transition hover:border-olive hover:bg-white">
                <ImagePlus className="h-4 w-4" />
                {uploadingImage ? t('uploading') : form.image ? t('replaceImage') : t('chooseImage')}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={(event) => uploadCategoryImage(event.target.files?.[0])}
                />
              </label>
              {form.image && <p className="mt-2 break-all text-xs leading-5 text-charcoal/45">{form.image}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              <Toggle label={t('showOnHome')} checked={form.showOnHome} onChange={(checked) => setForm({ ...form, showOnHome: checked })} />
              <Toggle label={t('activeInShop')} checked={form.isActive} onChange={(checked) => setForm({ ...form, isActive: checked })} />
            </div>
          </div>

          <aside className="rounded-[28px] border border-sand bg-ivory/70 p-4">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-sage">{t('preview')}</p>
            <div className="overflow-hidden rounded-3xl border border-sand bg-white">
              <div className="h-44 bg-beige">
                {form.image ? <img src={form.image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-sage"><ImagePlus className="h-10 w-10" /></div>}
              </div>
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">{t('category')}</p>
                <h3 className="mt-2 font-serif text-3xl text-olive">{form.name || t('categoryName')}</h3>
              </div>
            </div>
          </aside>
        </div>

        <div className="flex justify-end border-t border-sand/70 bg-ivory/70 px-4 py-5 sm:px-6">
          <button className="btn-primary" disabled={save.isPending || uploadingImage}>
            <Save className="h-4 w-4" />
            {save.isPending ? t('saving') : editingId ? t('updateCategory') : t('addCategory')}
          </button>
        </div>
      </form>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <article key={category._id} className="grid gap-4 rounded-[28px] border border-sand bg-white p-4 shadow-sm sm:grid-cols-[112px_1fr]">
            <div className="h-28 w-28 overflow-hidden rounded-3xl bg-beige">
              {category.image ? <img src={category.image} alt={category.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-sage"><ImagePlus /></div>}
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusPill active={category.isActive}>{category.isActive ? t('active') : t('hidden')}</StatusPill>
                <StatusPill active={category.showOnHome}>{category.showOnHome ? t('home') : t('hidden')}</StatusPill>
              </div>
              <h3 className="mt-3 font-serif text-3xl text-charcoal">{category.name}</h3>
              <p className="mt-1 text-sm text-charcoal/55">/{category.slug}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-secondary px-4 py-2" type="button" onClick={() => { setEditingId(category._id); setForm({ name: category.name || '', image: category.image || '', showOnHome: Boolean(category.showOnHome), isActive: Boolean(category.isActive) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Edit3 className="h-4 w-4" /> {t('edit')}</button>
                <button
                  className="btn-secondary px-4 py-2 text-red-700"
                  type="button"
                  onClick={() => setConfirmDialog({
                    title: t('confirmDeleteCategory', { name: category.name }),
                    message: t('confirmDeleteMessage'),
                    confirmLabel: t('delete'),
                    variant: 'danger',
                    onConfirm: () => remove.mutate(category._id),
                  })}
                >
                  <Trash2 className="h-4 w-4" /> {t('delete')}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
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
