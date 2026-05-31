export const arabicProductDescriptions = {
  'blooming-eve': 'تصميم لينن مطبوع بلمسة زهرية ناعمة، مناسب للطاولات الدافئة والتجمعات الهادئة.',
  'safari-bloom': 'قطعة لينن مطبوعة بروح طبيعية ونقوش حيوية تضيف حضوراً أنيقاً للطاولة.',
  'golden-garden': 'تصميم مستوحى من الحدائق الذهبية، يمنح تنسيق الطاولة إحساساً فاخراً ومشرقاً.',
  'rose-elan': 'قطعة مطرزة بنعومة وتفاصيل وردية راقية تضيف إحساساً رومانسياً للطاولة.',
  'olive-serenity': 'تصميم مطرز بدرجات زيتونية هادئة، مثالي لتنسيقات طبيعية وراقية.',
  'linen-whisper': 'قطعة تطريز هادئة بخامة لينن فاخرة وتفاصيل ناعمة لا تطغى على جمال الطاولة.',
  'lemon-bloom': 'تصميم مطرز بإحساس منعش ومشرق، مناسب للطاولات الصيفية والتنسيقات المرحة.',
};

export const arabicCategories = {
  'Printed Linen': 'لينن مطبوع',
  Embroidery: 'تطريز',
};

function numberValue(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

export function formatProductPrice(value, isArabic = false) {
  const number = numberValue(value);

  if (isArabic) {
    return `${number.toLocaleString('ar-EG')} جنيه`;
  }

  return `${number.toLocaleString()} EGP`;
}

export function getProductPricing(product, isArabic = false) {
  const originalPrice = numberValue(product?.originalPrice || product?.price);
  const finalPrice = numberValue(product?.finalPrice || product?.offerPrice || product?.price);
  const hasOffer = Boolean(product?.hasActiveOffer && product?.offerPrice && finalPrice < originalPrice);

  return {
    originalPrice,
    finalPrice,
    offerPrice: hasOffer ? finalPrice : null,
    hasOffer,
    originalPriceText: formatProductPrice(originalPrice, isArabic),
    finalPriceText: formatProductPrice(finalPrice, isArabic),
    offerPriceText: hasOffer ? formatProductPrice(finalPrice, isArabic) : '',
  };
}

export function getProductDisplay(product, isArabic) {
  const pricing = getProductPricing(product, isArabic);

  return {
    name: isArabic ? product?.nameAr || product?.name || '' : product?.name || '',
    category: isArabic
      ? arabicCategories[product?.category?.name] || product?.category?.name
      : product?.category?.name,
    description: isArabic
      ? product?.descriptionAr || arabicProductDescriptions[product?.slug] || product?.description
      : product?.description,
    price: pricing.finalPriceText,
    originalPrice: pricing.originalPriceText,
    offerPrice: pricing.offerPriceText,
    hasOffer: pricing.hasOffer,
    activeOffer: product?.activeOffer || null,
  };
}