import SEO from '../components/SEO.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function PrivacyPolicy() {
  const { isArabic } = useLanguage();

  return (
    <>
      <SEO
        title={isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
        description="ByJojo privacy policy for customer orders, account data, payment notes, and contact information."
        noIndex
      />

      <section className="section-pad">
        <div className="container-soft max-w-4xl">
          <p className="eyebrow">{isArabic ? 'ByJojo' : 'ByJojo'}</p>
          <h1 className="page-title mt-3">{isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}</h1>

          <div className="mt-8 space-y-5 rounded-[32px] border border-sand bg-white p-6 leading-8 text-charcoal/70 shadow-[0_18px_55px_rgba(79,91,58,0.08)]">
            {isArabic ? (
              <>
                <p>نحن نحترم خصوصيتك. يتم استخدام بياناتك فقط لمعالجة الطلبات، التواصل بخصوص التوصيل والدفع، وتحسين تجربة التسوق.</p>
                <h2 className="font-serif text-3xl text-charcoal">البيانات التي نجمعها</h2>
                <p>قد نقوم بحفظ الاسم، البريد الإلكتروني، رقم الهاتف، العنوان، المدينة، ملاحظات الطلب، وطريقة الدفع المختارة.</p>
                <h2 className="font-serif text-3xl text-charcoal">كيف نستخدم البيانات</h2>
                <p>نستخدم البيانات لتأكيد الطلبات، إرسال إشعارات الطلب، التواصل بخصوص الدفع أو التوصيل، وإرسال العروض للعملاء المسجلين عند الحاجة.</p>
                <h2 className="font-serif text-3xl text-charcoal">الدفع</h2>
                <p>لا نقوم بتخزين بيانات بطاقات بنكية. في حالة إنستاباي، يتم حفظ الملاحظات أو مرجع الدفع الذي يكتبه العميل فقط لمساعدة الفريق في التأكيد.</p>
                <h2 className="font-serif text-3xl text-charcoal">التواصل</h2>
                <p>يمكنك التواصل مع ByJojo في أي وقت بخصوص بياناتك أو طلبك.</p>
              </>
            ) : (
              <>
                <p>We respect your privacy. Your information is used only to process orders, communicate about delivery and payment, and improve the shopping experience.</p>
                <h2 className="font-serif text-3xl text-charcoal">Information we collect</h2>
                <p>We may store your name, email, phone number, address, city/area, order notes, and selected payment method.</p>
                <h2 className="font-serif text-3xl text-charcoal">How we use it</h2>
                <p>We use this information to confirm orders, send order notifications, contact you about payment or delivery, and send offers to registered customers when needed.</p>
                <h2 className="font-serif text-3xl text-charcoal">Payments</h2>
                <p>We do not store bank card information. For Instapay, we only store the payment notes or reference entered by the customer to help the team verify the transfer.</p>
                <h2 className="font-serif text-3xl text-charcoal">Contact</h2>
                <p>You can contact ByJojo anytime regarding your information or your order.</p>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}