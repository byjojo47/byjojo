import { Link } from 'react-router-dom';
import { ArrowUpRight, ShoppingBag, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getProductDisplay } from '../lib/productLocalization.js';

function offerLabel(product, isArabic) {
  const offer = product?.activeOffer;

  if (!offer) return isArabic ? 'عرض خاص' : 'Special offer';

  if (offer.discountType === 'percentage') {
    return isArabic ? `خصم ${offer.discountValue}%` : `${offer.discountValue}% off`;
  }

  if (offer.discountType === 'fixed') {
    return isArabic
      ? `خصم ${Number(offer.discountValue || 0).toLocaleString('ar-EG')} جنيه`
      : `${Number(offer.discountValue || 0).toLocaleString()} EGP off`;
  }

  return isArabic ? 'سعر خاص' : 'Sale price';
}

function stockLabel(stock, isArabic) {
  if (stock < 1) return isArabic ? 'غير متاح' : 'Out of stock';
  if (stock <= 3) return isArabic ? `متبقي ${stock} فقط` : `Only ${stock} left`;
  return isArabic ? 'متاح' : 'Available';
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { t, isArabic } = useLanguage();

  const mainImage = product.images?.find((image) => image.isMain)?.url || product.images?.[0]?.url || '/images/products/placeholder.webp';
  const hoverImage = product.images?.find((image) => !image.isMain)?.url || product.images?.[1]?.url || mainImage;
  const hasHoverImage = hoverImage && hoverImage !== mainImage;
  const display = getProductDisplay(product, isArabic);
  const stock = Number(product.stock || 0);
  const inStock = stock > 0;

  return (
    <article className={`group overflow-hidden rounded-[28px] border border-sand/80 bg-white shadow-[0_18px_55px_rgba(79,91,58,0.08)] transition duration-500 hover:border-sage/55 hover:shadow-[0_24px_70px_rgba(79,91,58,0.14)] ${inStock ? 'hover:-translate-y-1' : 'opacity-80'}`}>
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden">
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          {display.hasOffer && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_25px_rgba(185,154,91,0.25)]">
              <Tag className="h-3 w-3" />
              {offerLabel(product, isArabic)}
            </span>
          )}

          {!inStock && (
            <span className="rounded-full bg-charcoal px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_25px_rgba(47,48,40,0.22)]">
              {stockLabel(stock, isArabic)}
            </span>
          )}
        </div>

        <div className="relative aspect-[4/5] overflow-hidden bg-beige">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(185,154,91,0.18),transparent_32%),linear-gradient(135deg,#fffaf2_0%,#e8ddcb_100%)]" />
          <img
            src={mainImage}
            alt={display.name}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition duration-700 ease-out ${hasHoverImage ? 'group-hover:scale-[1.03] group-hover:opacity-0' : 'group-hover:scale-[1.04]'} ${!inStock ? 'grayscale-[35%]' : ''}`}
          />
          {hasHoverImage && (
            <img
              src={hoverImage}
              alt=""
              loading="lazy"
              className={`absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-0 transition duration-700 ease-out group-hover:scale-100 group-hover:opacity-100 ${!inStock ? 'grayscale-[35%]' : ''}`}
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal/28 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        </div>
      </Link>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sage">
            {display.category || t('homePillPrinted')}
          </p>

          <Link
            to={`/products/${product.slug}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sand text-olive transition group-hover:border-olive group-hover:bg-ivory"
            aria-label={`${t('viewProduct')} ${display.name}`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <Link to={`/products/${product.slug}`}>
          <h3 className="font-serif text-2xl leading-tight text-charcoal transition hover:text-olive">
            {display.name}
          </h3>
        </Link>

        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-charcoal/62">
          {display.description || t('categoryCopy')}
        </p>

        <div className="mt-4">
          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
            inStock
              ? stock <= 3
                ? 'bg-gold/10 text-gold'
                : 'bg-sage/12 text-olive'
              : 'bg-charcoal/10 text-charcoal/55'
          }`}
          >
            {stockLabel(stock, isArabic)}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-sand/70 pt-4">
          <div>
            {display.hasOffer ? (
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="text-lg font-bold text-olive">{display.offerPrice}</p>
                <p className="text-sm font-semibold text-charcoal/38 line-through">{display.originalPrice}</p>
              </div>
            ) : (
              <p className="text-lg font-bold text-olive">{display.price}</p>
            )}

            {display.hasOffer && (
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                {product.activeOffer?.title || t('offersTitle')}
              </p>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-olive text-white shadow-[0_12px_25px_rgba(79,91,58,0.18)] transition hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-charcoal/25 disabled:shadow-none"
            onClick={() => addToCart(product)}
            aria-label={`${t('addToCart')} ${display.name}`}
            disabled={!inStock}
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
