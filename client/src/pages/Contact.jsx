import { useQuery } from '@tanstack/react-query';
import { HelpCircle, Mail, MessageCircle, PackageCheck, Send, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../api/axios.js';
import SEO from '../components/SEO.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const BRAND_WHATSAPP = '+20 10 97796773';
const BRAND_INSTAGRAM = 'https://www.instagram.com/byjojoeg?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';

const copy = {
  en: {
    seoTitle: 'Contact ByJojo',
    seoDescription: 'Contact ByJojo for orders, delivery, payment questions, styling requests, gifting, and collaborations.',
    eyebrow: 'Contact ByJojo',
    title: 'Need help with an order, a setup, or a special request?',
    intro: 'Send ByJojo a message and the team will help with product questions, checkout, Instapay proof, delivery details, gifts, and collaborations.',
    whatsappTitle: 'Orders & quick questions',
    whatsappCopy: 'Best for order follow-ups, delivery details, product questions, and sending Instapay proof.',
    instagramTitle: 'Styling & collaborations',
    instagramCopy: 'Best for table inspiration, brand collaborations, gifting, content creators, and collection updates.',
    emailTitle: 'Email ByJojo',
    emailCopy: 'Best for detailed requests, partnerships, and longer order notes.',
    faqEyebrow: 'Before you ask',
    faqTitle: 'Quick answers',
    faqs: [
      {
        q: 'Can I pay through Instapay?',
        a: 'Yes, if Instapay is enabled at checkout. You can send the transfer proof through WhatsApp, Instagram, or another channel.',
      },
      {
        q: 'Can I pay cash on delivery?',
        a: 'Yes, if cash on delivery is enabled at checkout. The team may contact you to confirm the order before delivery.',
      },
      {
        q: 'Can I ask about styling before ordering?',
        a: 'Yes. Send the team a message with the product you like and the table mood you want.',
      },
      {
        q: 'Can I order a piece as a gift?',
        a: 'Yes. Add notes during checkout or contact the team for gifting details before ordering.',
      },
    ],
    responseTitle: 'What to include in your message',
    responsePoints: ['Product name or screenshot', 'Your city/area', 'Payment method question if needed', 'Any gift or styling request'],
    trust: [
      {
        title: 'Order support',
        text: 'Ask about checkout, payment proof, delivery, or order status.',
        icon: PackageCheck,
      },
      {
        title: 'Secure payment steps',
        text: 'Instapay proof and payment notes are saved with your order.',
        icon: ShieldCheck,
      },
      {
        title: 'Styling help',
        text: 'Message ByJojo for table setup ideas and collection guidance.',
        icon: Sparkles,
      },
    ],
  },
  ar: {
    seoTitle: 'تواصل مع ByJojo',
    seoDescription: 'تواصلي مع ByJojo للاستفسار عن الطلبات، التوصيل، الدفع، التعاونات، وتنسيق الطاولة.',
    eyebrow: 'تواصل مع ByJojo',
    title: 'محتاجة مساعدة في طلب، تنسيق طاولة، أو طلب خاص؟',
    intro: 'ابعتيلنا رسالة وهنساعدك في تفاصيل المنتجات، الدفع، إثبات Instapay، التوصيل، الهدايا، والتعاونات.',
    whatsappTitle: 'الطلبات والأسئلة السريعة',
    whatsappCopy: 'الأفضل لمتابعة الطلب، تفاصيل التوصيل، أسئلة المنتجات، وإرسال إثبات Instapay.',
    instagramTitle: 'التنسيق والتعاونات',
    instagramCopy: 'الأفضل لإلهام تنسيقات الطاولة، التعاونات، الهدايا، وصناع المحتوى.',
    emailTitle: 'راسلينا بالإيميل',
    emailCopy: 'الأفضل للطلبات الطويلة، الشراكات، والتفاصيل الخاصة.',
    faqEyebrow: 'قبل ما تسألي',
    faqTitle: 'إجابات سريعة',
    faqs: [
      {
        q: 'هل يمكن الدفع عن طريق Instapay؟',
        a: 'نعم، إذا كان Instapay متاح في صفحة الدفع. يمكنك إرسال إثبات التحويل عبر واتساب أو إنستجرام أو وسيلة أخرى.',
      },
      {
        q: 'هل يوجد دفع عند الاستلام؟',
        a: 'نعم، إذا كان الدفع عند الاستلام متاح في صفحة الدفع. قد يتواصل الفريق معك لتأكيد الطلب قبل التوصيل.',
      },
      {
        q: 'هل يمكن السؤال عن التنسيق قبل الطلب؟',
        a: 'نعم. ابعتي لنا المنتج اللي عجبك والمود اللي عايزاه للطاولة.',
      },
      {
        q: 'هل يمكن طلب قطعة كهدية؟',
        a: 'نعم. يمكنك كتابة ملاحظات أثناء الدفع أو التواصل معنا قبل الطلب لتفاصيل الهدايا.',
      },
    ],
    responseTitle: 'ماذا تكتبي في رسالتك؟',
    responsePoints: ['اسم المنتج أو صورة منه', 'المدينة أو المنطقة', 'سؤال الدفع إذا موجود', 'أي طلب هدية أو تنسيق خاص'],
    trust: [
      {
        title: 'دعم الطلبات',
        text: 'اسألي عن الدفع، إثبات التحويل، التوصيل، أو حالة الطلب.',
        icon: PackageCheck,
      },
      {
        title: 'خطوات دفع واضحة',
        text: 'إثبات Instapay وملاحظات الدفع يتم حفظها مع الطلب.',
        icon: ShieldCheck,
      },
      {
        title: 'مساعدة في التنسيق',
        text: 'تواصلي معنا لأفكار تنسيق الطاولة واختيار القطع المناسبة.',
        icon: Sparkles,
      },
    ],
  },
};

function InstagramIcon() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <defs>
          <linearGradient id="instagram-icon-contact" x1="2" y1="22" x2="22" y2="2">
            <stop offset="0" stopColor="#f6c85f" />
            <stop offset="0.45" stopColor="#df5b6b" />
            <stop offset="0.75" stopColor="#b43ab8" />
            <stop offset="1" stopColor="#5f6edb" />
          </linearGradient>
        </defs>
        <rect x="4.5" y="4.5" width="15" height="15" rx="4.5" fill="none" stroke="url(#instagram-icon-contact)" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.4" fill="none" stroke="url(#instagram-icon-contact)" strokeWidth="2" />
        <circle cx="16.8" cy="7.2" r="1.2" fill="url(#instagram-icon-contact)" />
      </svg>
    </span>
  );
}

function whatsappLink(number) {
  const digits = String(number || BRAND_WHATSAPP).replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '#';
}

export default function Contact() {
  const { t, isArabic } = useLanguage();
  const c = isArabic ? copy.ar : copy.en;

  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get('/settings')).data,
  });

  const settings = data?.settings || {};
  const whatsapp = settings.whatsappNumber || BRAND_WHATSAPP;
  const instagram = settings.instagramUrl || BRAND_INSTAGRAM;
  const contactEmail = settings.contactEmail || '';

  return (
    <>
      <SEO
        title={c.seoTitle}
        description={c.seoDescription}
        image="/images/logo.webp"
      />

      <section className="relative overflow-hidden bg-beige">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(185,154,91,0.18),transparent_28%),linear-gradient(115deg,rgba(250,247,239,0.95),rgba(232,221,203,0.72))]" />

        <div className="container-soft relative grid min-h-[calc(86vh-112px)] items-center gap-10 py-16 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="eyebrow inline-flex items-center gap-2 text-olive">
              <Send className="h-4 w-4" />
              {c.eyebrow}
            </p>

            <h1 className="page-title mt-5 max-w-4xl">{c.title}</h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/72">
              {c.intro}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a className="btn-primary" href={whatsappLink(whatsapp)} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>

              <a className="btn-secondary" href={instagram} target="_blank" rel="noreferrer">
                <InstagramIcon />
                Instagram
              </a>
            </div>
          </div>

          <aside className="rounded-[34px] border border-sand bg-white/82 p-6 shadow-[0_28px_80px_rgba(79,91,58,0.14)] backdrop-blur">
            <p className="eyebrow">{t('contactOptions')}</p>

            <div className="mt-5 space-y-3">
              <ContactCard
                icon={MessageCircle}
                title={c.whatsappTitle}
                text={c.whatsappCopy}
                href={whatsappLink(whatsapp)}
                label="WhatsApp"
              />

              <ContactCard
                icon={InstagramIcon}
                title={c.instagramTitle}
                text={c.instagramCopy}
                href={instagram}
                label="Instagram"
              />

              <ContactCard
                icon={Mail}
                title={c.emailTitle}
                text={c.emailCopy}
                href={contactEmail ? `mailto:${contactEmail}` : '#'}
                label={contactEmail || t('emailNotAdded')}
                disabled={!contactEmail}
              />
            </div>
          </aside>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-soft">
          <div className="grid gap-4 md:grid-cols-3">
            {c.trust.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="rounded-[28px] border border-sand bg-white p-5 shadow-[0_18px_55px_rgba(79,91,58,0.08)]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-olive">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-5 font-serif text-3xl leading-tight text-charcoal">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-charcoal/60">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white/72 py-20">
        <div className="container-soft grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow inline-flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              {c.faqEyebrow}
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-tight text-charcoal">{c.faqTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-charcoal/70">
              {c.responseTitle}
            </p>

            <div className="mt-6 grid gap-3">
              {c.responsePoints.map((point) => (
                <div key={point} className="rounded-2xl border border-sand bg-ivory/70 px-4 py-3 text-sm font-bold text-olive">
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {c.faqs.map((faq) => (
              <article key={faq.q} className="rounded-[28px] border border-sand bg-white p-5 shadow-[0_18px_55px_rgba(79,91,58,0.06)]">
                <h3 className="font-serif text-2xl leading-tight text-charcoal">{faq.q}</h3>
                <p className="mt-3 leading-7 text-charcoal/65">{faq.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-soft overflow-hidden rounded-[36px] bg-olive p-8 text-white md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-beige">
                {t('byjojoSupport')}
              </p>
              <h2 className="mt-3 max-w-3xl font-serif text-5xl leading-tight">
                {t('contactClosingTitle')}
              </h2>
              <p className="mt-4 max-w-2xl leading-8 text-white/72">
                {t('contactClosingCopy')}
              </p>
            </div>

            <a className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 font-bold !text-charcoal transition hover:bg-beige" href={whatsappLink(whatsapp)} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactCard({ icon: Icon, title, text, href, label, disabled = false }) {
  const content = (
    <>
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ivory text-olive">
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-serif text-2xl leading-tight text-charcoal">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-charcoal/58">{text}</span>
        <span className="mt-3 inline-flex text-sm font-bold text-olive">{label}</span>
      </span>
    </>
  );

  if (disabled) {
    return (
      <div className="flex gap-4 rounded-[24px] border border-sand bg-ivory/50 p-4 opacity-75">
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      target={href?.startsWith('mailto:') ? undefined : '_blank'}
      rel={href?.startsWith('mailto:') ? undefined : 'noreferrer'}
      className="flex gap-4 rounded-[24px] border border-sand bg-ivory/50 p-4 transition hover:border-olive hover:bg-white"
    >
      {content}
    </a>
  );
}
