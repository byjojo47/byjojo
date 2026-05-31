import SEO from '../components/SEO.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Returns() {
  const { isArabic } = useLanguage();

  return (
    <>
      <SEO
        title={isArabic ? 'الاستبدال والاسترجاع' : 'Returns & Exchanges'}
        description="ByJojo returns and exchanges note for table linen orders."
        noIndex
      />

      <section className="section-pad">
        <div className="container-soft max-w-4xl">
          <p className="eyebrow">ByJojo</p>
          <h1 className="page-title mt-3">{isArabic ? 'الاستبدال والاسترجاع' : 'Returns & Exchanges'}</h1>

          <div className="mt-8 space-y-5 rounded-[32px] border border-sand bg-white p-6 leading-8 text-charcoal/70 shadow-[0_18px_55px_rgba(79,91,58,0.08)]">
            {isArabic ? (
              <>
                <p>نريد أن تصلك قطع ByJojo بحالة ممتازة وتكوني راضية عن طلبك.</p>
                <h2 className="font-serif text-3xl text-charcoal">فحص الطلب</h2>
                <p>يرجى فحص المنتج عند الاستلام والتواصل معنا فورًا إذا كان هناك أي مشكلة واضحة في المنتج أو الطلب.</p>
                <h2 className="font-serif text-3xl text-charcoal">الاستبدال</h2>
                <p>قد يتم قبول الاستبدال حسب حالة المنتج وتوفر القطعة البديلة. يجب أن يكون المنتج غير مستخدم وبحالته الأصلية.</p>
                <h2 className="font-serif text-3xl text-charcoal">القطع المستخدمة</h2>
                <p>لا يمكن استبدال أو استرجاع المنتجات المستخدمة أو المغسولة أو المتضررة بسبب الاستخدام الخاطئ.</p>
                <h2 className="font-serif text-3xl text-charcoal">التواصل</h2>
                <p>لأي طلب استبدال أو استفسار، يرجى التواصل مع ByJojo عبر واتساب أو إنستجرام مع رقم الطلب وصور واضحة.</p>
              </>
            ) : (
              <>
                <p>We want your ByJojo pieces to arrive in excellent condition and for you to feel happy with your order.</p>
                <h2 className="font-serif text-3xl text-charcoal">Check your order</h2>
                <p>Please check the product when it arrives and contact us immediately if there is a clear issue with the item or order.</p>
                <h2 className="font-serif text-3xl text-charcoal">Exchanges</h2>
                <p>Exchanges may be accepted depending on product condition and replacement availability. The item must be unused and in its original condition.</p>
                <h2 className="font-serif text-3xl text-charcoal">Used items</h2>
                <p>Used, washed, or damaged products caused by incorrect care or handling cannot be returned or exchanged.</p>
                <h2 className="font-serif text-3xl text-charcoal">Contact</h2>
                <p>For exchange requests or questions, contact ByJojo through WhatsApp or Instagram with your order number and clear photos.</p>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}