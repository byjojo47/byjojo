import { createContext, useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from './LanguageContext.jsx';

const CartContext = createContext(null);

const CART_KEY = 'byjojoCart';

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

function productMainImage(product) {
  return (
    product.images?.find((img) => img.isMain)?.url ||
    product.images?.[0]?.url ||
    ''
  );
}

function numberValue(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function getCustomerPrice(product) {
  return numberValue(product.finalPrice || product.offerPrice || product.price);
}

function getOriginalPrice(product) {
  return numberValue(product.originalPrice || product.price);
}

function normalizeCartItem(product, quantity = 1) {
  const price = getCustomerPrice(product);
  const originalPrice = getOriginalPrice(product);
  const stock = numberValue(product.stock);
  const hasActiveOffer = Boolean(product.hasActiveOffer && product.offerPrice && price < originalPrice);

  return {
    product: product._id,
    slug: product.slug,
    name: product.name,
    nameAr: product.nameAr || '',
    image: productMainImage(product),
    price,
    originalPrice,
    offerPrice: hasActiveOffer ? price : null,
    hasActiveOffer,
    activeOffer: hasActiveOffer ? product.activeOffer || null : null,
    quantity,
    stock,
  };
}

function clampQuantity(quantity, stock) {
  const safeQuantity = Math.max(1, Math.floor(Number(quantity || 1)));

  if (!stock || stock < 1) return safeQuantity;

  return Math.min(safeQuantity, stock);
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const { t } = useLanguage();

  const persist = (next) => {
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  };

  const addToCart = (product, quantity = 1) => {
    const stock = numberValue(product.stock);

    if (stock < 1) {
      toast.error(t('productOutOfStock'));
      return;
    }

    const existing = items.find((item) => item.product === product._id);
    const existingQuantity = numberValue(existing?.quantity);
    const requestedQuantity = Math.max(1, Math.floor(Number(quantity || 1)));
    const nextQuantity = existingQuantity + requestedQuantity;

    if (nextQuantity > stock) {
      toast.error(t('onlyAvailable', { count: stock }));
      return;
    }

    const incoming = normalizeCartItem(product, requestedQuantity);
    const next = [...items];

    if (existing) {
      existing.quantity = nextQuantity;
      existing.slug = incoming.slug;
      existing.name = incoming.name;
      existing.nameAr = incoming.nameAr;
      existing.image = incoming.image;
      existing.price = incoming.price;
      existing.originalPrice = incoming.originalPrice;
      existing.offerPrice = incoming.offerPrice;
      existing.hasActiveOffer = incoming.hasActiveOffer;
      existing.activeOffer = incoming.activeOffer;
      existing.stock = incoming.stock;
    } else {
      next.push(incoming);
    }

    persist(next);
    toast.success(t('addedToCart'));
  };

  const updateQuantity = (product, quantity) => {
    const safeQuantity = Number(quantity);

    if (!Number.isFinite(safeQuantity) || safeQuantity < 1) return;

    persist(items.map((item) => {
      if (item.product !== product) return item;

      const stock = numberValue(item.stock);
      const nextQuantity = clampQuantity(safeQuantity, stock);

      if (stock > 0 && safeQuantity > stock) {
        toast.error(t('onlyAvailable', { count: stock }));
      }

      return {
        ...item,
        quantity: nextQuantity,
      };
    }));
  };

  const refreshCartItem = (product) => {
    if (!product?._id) return;

    persist(items.map((item) => {
      if (item.product !== product._id) return item;

      const stock = numberValue(product.stock);
      const normalized = normalizeCartItem(product, clampQuantity(item.quantity, stock));

      return {
        ...normalized,
        quantity: clampQuantity(item.quantity, stock),
      };
    }));
  };

  const removeItem = (product) => {
    persist(items.filter((item) => item.product !== product));
    toast.success(t('removedFromCart'));
  };

  const clearCart = () => persist([]);

  const subtotal = items.reduce(
    (sum, item) => sum + numberValue(item.price) * numberValue(item.quantity),
    0,
  );

  const savings = items.reduce((sum, item) => {
    if (!item.hasActiveOffer) return sum;

    const original = numberValue(item.originalPrice);
    const current = numberValue(item.price);

    return sum + Math.max(0, original - current) * numberValue(item.quantity);
  }, 0);

  const count = items.reduce((sum, item) => sum + numberValue(item.quantity), 0);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      savings,
      addToCart,
      updateQuantity,
      refreshCartItem,
      removeItem,
      clearCart,
    }),
    [items, count, subtotal, savings],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}