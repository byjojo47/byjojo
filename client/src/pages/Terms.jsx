import SEO from '../components/SEO.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Terms() {
  const { isArabic } = useLanguage();

  return (
    <>
      <SEO
        title={isArabic ? 'الشروط والأحكام' : 'Terms & Conditions'}
        description="ByJojo terms and conditions for orders, product availability, payment, delivery, and website use."
        noIndex
      />

      <section className="section-pad">
        <div className="container-soft max-w-4xl">
          <p className="eyebrow">ByJojo</p>
          <h1 className="page-title mt-3">{isArabic ? 'الشروط والأحكام' : 'Terms & Conditions'}</h1>

          <div className="mt-8 space-y-5 rounded-[32px] border border-sand bg-white p-6 leading-8 text-charcoal/70 shadow-[0_18px_55px_rgba(79,91,58,0.08)]">
            {isArabic ? (
              <>
                <p>باستخدام موقع ByJojo أو تسجيل طلب، أنت توافق على الشروط التالية.</p>
                <h2 className="font-serif text-3xl text-charcoal">الطلبات</h2>
                <p>يتم تأكيد الطلب بعد مراجعة الفريق لتفاصيل المنتج، الدفع، والتوصيل. قد يتم التواصل معك لتأكيد البيانات قبل الشحن.</p>
                <h2 className="font-serif text-3xl text-charcoal">الأسعار والتوافر</h2>
                <p>الأسعار والمخزون قابلة للتحديث من لوحة الإدارة. في حالة نفاد المنتج، سيتم التواصل معك بخصوص البدائل أو إلغاء الطلب.</p>
                <h2 className="font-serif text-3xl text-charcoal">الدفع</h2>
                <p>طرق الدفع المتاحة تظهر أثناء إتمام الطلب، وقد تشمل الدفع عند الاستلام أو إنستاباي حسب إعدادات المتجر.</p>
                <h2 className="font-serif text-3xl text-charcoal">المحتوى والصور</h2>
                <p>قد تختلف الألوان قليلًا بسبب الإضاءة أو إعدادات شاشة الجهاز.</p>
              </>
            ) : (
              <>
                <p>By using the ByJojo website or placing an order, you agree to the following terms.</p>
                <h2 className="font-serif text-3xl text-charcoal">Orders</h2>
                <p>Orders are confirmed after the team reviews product details, payment, and delivery information. You may be contacted to confirm details before delivery.</p>
                <h2 className="font-serif text-3xl text-charcoal">Prices and availability</h2>
                <p>Prices and stock may be updated from the admin dashboard. If an item becomes unavailable, the team may contact you about alternatives or cancellation.</p>
                <h2 className="font-serif text-3xl text-charcoal">Payment</h2>
                <p>Available payment methods appear during checkout and may include cash on delivery or Instapay depending on store settings.</p>
                <h2 className="font-serif text-3xl text-charcoal">Content and images</h2>
                <p>Colors may vary slightly due to lighting, photography, or screen settings.</p>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}