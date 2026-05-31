import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Leaf, Sparkles, Stars } from 'lucide-react';
import SEO from '../components/SEO.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const copy = {
  en: {
    seoTitle: 'About ByJojo',
    seoDescription: 'Discover the story behind ByJojo, a premium table linen brand designed for warm homes, elegant hosting, and thoughtful table styling.',
    eyebrow: 'About ByJojo',
    title: 'Designed for tables that feel warm, thoughtful, and beautifully lived-in.',
    intro: 'ByJojo creates premium table linen pieces for homes that care about details — soft colors, graceful prints, delicate embroidery, and table setups that feel special without trying too hard.',
    cta: 'Shop the collection',
    secondaryCta: 'Contact ByJojo',
    storyEyebrow: 'Brand story',
    storyTitle: 'A softer way to dress the table.',
    storyCopy: 'The idea behind ByJojo is simple: a table can change the whole mood of a home. Whether it is a quiet breakfast, a family lunch, or a warm dinner with friends, the right linen piece makes the moment feel more intentional.',
    valuesTitle: 'What ByJojo cares about',
    values: [
      {
        title: 'Warm natural palette',
        text: 'Soft tones, olive touches, beige warmth, and prints that feel close to nature.',
        icon: Leaf,
      },
      {
        title: 'Table-ready elegance',
        text: 'Pieces made to instantly elevate the table without feeling too formal or heavy.',
        icon: Sparkles,
      },
      {
        title: 'Details with feeling',
        text: 'From printed linen to embroidery, every piece is chosen to add character and softness.',
        icon: Heart,
      },
    ],
    qualityTitle: 'Made to style beautifully',
    qualityCopy: 'Each piece is presented with care so customers can imagine it on their own table. The collection is built around styling flexibility: daily home moments, Ramadan tables, gatherings, gifts, and curated setups.',
    qualityPoints: ['Premium linen feeling', 'Printed and embroidered collections', 'Elegant hosting pieces', 'Limited seasonal drops'],
    closingEyebrow: 'For your next table',
    closingTitle: 'Choose the piece that makes the setup feel complete.',
    closingCopy: 'Explore ByJojo’s printed linen and embroidery collections, then build a table around the mood you want: calm, warm, fresh, romantic, or golden.',
  },
  ar: {
    seoTitle: 'عن ByJojo',
    seoDescription: 'تعرفي على قصة ByJojo، براند مفروشات الطاولة الفاخرة المصمم للبيوت الدافئة والضيافة الأنيقة.',
    eyebrow: 'عن ByJojo',
    title: 'تصميمات للطاولات الدافئة، الهادئة، والمليانة تفاصيل جميلة.',
    intro: 'ByJojo بتقدم قطع مفروشات طاولة فاخرة للبيوت اللي بتحب التفاصيل — ألوان هادية، نقوش راقية، تطريز ناعم، وتنسيقات طاولة تحسسك إن اللحظة مختلفة.',
    cta: 'تسوقي المجموعة',
    secondaryCta: 'تواصلي معنا',
    storyEyebrow: 'قصة البراند',
    storyTitle: 'طريقة أهدى وأجمل لتنسيق الطاولة.',
    storyCopy: 'فكرة ByJojo بسيطة: الطاولة ممكن تغير إحساس البيت كله. سواء فطار هادي، عزومة عائلية، أو عشاء دافي مع أصحابك، قطعة اللينن الصح بتخلي اللحظة أرقى وأجمل.',
    valuesTitle: 'ما يهم ByJojo',
    values: [
      {
        title: 'ألوان طبيعية دافئة',
        text: 'درجات هادية، لمسات زيتونية، دفء البيج، ونقوش قريبة من الطبيعة.',
        icon: Leaf,
      },
      {
        title: 'أناقة جاهزة للطاولة',
        text: 'قطع ترفع شكل الطاولة فوراً من غير ما تكون رسمية أو مبالغ فيها.',
        icon: Sparkles,
      },
      {
        title: 'تفاصيل بإحساس',
        text: 'من اللينن المطبوع للتطريز، كل قطعة مختارة عشان تضيف شخصية ونعومة.',
        icon: Heart,
      },
    ],
    qualityTitle: 'مصممة لتظهر بشكل جميل',
    qualityCopy: 'كل قطعة بتتقدم بعناية عشان العميل يقدر يتخيلها على طاولته. المجموعة مناسبة للحظات اليومية، عزومات رمضان، الهدايا، والتنسيقات الخاصة.',
    qualityPoints: ['إحساس لينن فاخر', 'مجموعات مطبوعة ومطرزة', 'قطع مناسبة للضيافة', 'إصدارات موسمية محدودة'],
    closingEyebrow: 'لطاولتك القادمة',
    closingTitle: 'اختاري القطعة اللي تكمل إحساس التنسيق.',
    closingCopy: 'اكتشفي مجموعات ByJojo من اللينن المطبوع والتطريز، وابدئي تنسيق طاولة بالمود اللي تحبيه: هادي، دافي، منعش، رومانسي، أو ذهبي.',
  },
};

export default function About() {
  const { t, isArabic } = useLanguage();
  const c = isArabic ? copy.ar : copy.en;

  return (
    <>
      <SEO
        title={c.seoTitle}
        description={c.seoDescription}
        image="/images/products/safari-bloom/3.webp"
      />

      <section className="relative overflow-hidden bg-beige">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(185,154,91,0.18),transparent_28%),linear-gradient(115deg,rgba(250,247,239,0.95),rgba(232,221,203,0.72))]" />

        <div className="container-soft relative grid min-h-[calc(100vh-112px)] items-center gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="byjojo-fade-up">
            <p className="eyebrow inline-flex items-center gap-2 text-olive">
              <Stars className="h-4 w-4" />
              {c.eyebrow}
            </p>

            <h1 className="page-title mt-5 max-w-4xl">{c.title}</h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/72">
              {c.intro}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary">
                {c.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link to="/contact" className="btn-secondary">
                {c.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="relative byjojo-fade-up">
            <div className="absolute -left-4 top-10 z-10 hidden rounded-full border border-sand bg-white/90 px-5 py-3 text-sm font-bold text-olive shadow-[0_18px_45px_rgba(79,91,58,0.12)] md:inline-flex">
              {t('premiumTableLinen')}
            </div>

            <div className="grid grid-cols-[0.82fr_1.18fr] gap-4">
              <div className="space-y-4 pt-16">
                <img
                  src="/images/products/blooming-eve/1.webp"
                  alt=""
                  className="h-52 w-full rounded-[28px] object-cover shadow-[0_22px_60px_rgba(79,91,58,0.12)]"
                />
                <img
                  src="/images/products/golden-garden/2.webp"
                  alt=""
                  className="h-64 w-full rounded-[28px] object-cover shadow-[0_22px_60px_rgba(79,91,58,0.12)]"
                />
              </div>

              <div className="overflow-hidden rounded-[36px] bg-white p-3 shadow-[0_28px_80px_rgba(79,91,58,0.18)]">
                <img
                  src="/images/products/safari-bloom/3.webp"
                  alt={t('premiumTableLinen')}
                  className="h-[620px] max-h-[68vh] w-full rounded-[28px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-soft grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">{c.storyEyebrow}</p>
            <h2 className="mt-3 font-serif text-5xl leading-tight text-charcoal">{c.storyTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-charcoal/70">{c.storyCopy}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {c.values.map((value) => {
              const Icon = value.icon;

              return (
                <article key={value.title} className="rounded-[28px] border border-sand bg-white p-5 shadow-[0_18px_55px_rgba(79,91,58,0.08)]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-olive">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-serif text-2xl leading-tight text-charcoal">{value.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-charcoal/60">{value.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white/72 py-20">
        <div className="container-soft grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/images/products/rose-elan/1.webp"
              alt=""
              className="h-80 w-full rounded-[32px] object-cover"
            />
            <img
              src="/images/products/olive-serenity/1.webp"
              alt=""
              className="mt-12 h-80 w-full rounded-[32px] object-cover"
            />
          </div>

          <div>
            <p className="eyebrow">{t('quality')}</p>
            <h2 className="mt-3 font-serif text-5xl leading-tight text-charcoal">{c.qualityTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-charcoal/70">{c.qualityCopy}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {c.qualityPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-sand bg-ivory/70 px-4 py-3 text-sm font-bold text-olive">
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-soft overflow-hidden rounded-[36px] bg-olive p-8 text-white md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-beige">{c.closingEyebrow}</p>
              <h2 className="mt-3 max-w-3xl font-serif text-5xl leading-tight">{c.closingTitle}</h2>
              <p className="mt-4 max-w-2xl leading-8 text-white/72">{c.closingCopy}</p>
            </div>

            <Link
              to="/shop"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 font-bold !text-charcoal transition hover:bg-beige"
            >
              {c.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
