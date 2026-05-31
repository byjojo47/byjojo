import { Link } from 'react-router-dom';
import { ArrowRight, Droplets, Leaf, Sparkles, SunMedium } from 'lucide-react';
import SEO from '../components/SEO.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const copy = {
  en: {
    title: 'Care Guide',
    headline: 'Keep your ByJojo linen pieces beautiful for longer.',
    intro: 'A little care keeps printed linen and embroidered table pieces looking fresh, soft, and ready for your next setup.',
    steps: [
      {
        title: 'Wash gently',
        text: 'Use cold or lukewarm water with a gentle detergent. Avoid bleach or harsh stain removers.',
        icon: Droplets,
      },
      {
        title: 'Dry naturally',
        text: 'Air dry when possible. Avoid high heat because it can affect texture, color, and embroidery.',
        icon: SunMedium,
      },
      {
        title: 'Iron softly',
        text: 'Iron on low to medium heat from the reverse side, especially for embroidered pieces.',
        icon: Sparkles,
      },
      {
        title: 'Store with care',
        text: 'Fold neatly and store in a dry place away from direct sunlight to protect the colors.',
        icon: Leaf,
      },
    ],
  },
  ar: {
    title: 'دليل العناية',
    headline: 'حافظي على قطع ByJojo جميلة لفترة أطول.',
    intro: 'العناية البسيطة تحافظ على اللينن المطبوع والمطرز ناعمًا وجاهزًا لتنسيق طاولتك القادمة.',
    steps: [
      {
        title: 'غسيل لطيف',
        text: 'استخدمي ماء بارد أو فاتر مع منظف لطيف. تجنبي الكلور أو مزيلات البقع القوية.',
        icon: Droplets,
      },
      {
        title: 'تجفيف طبيعي',
        text: 'يفضل التجفيف في الهواء. تجنبي الحرارة العالية لأنها قد تؤثر على الخامة والألوان والتطريز.',
        icon: SunMedium,
      },
      {
        title: 'كي ناعم',
        text: 'استخدمي حرارة منخفضة إلى متوسطة ويفضل الكي من الجهة الداخلية، خصوصًا القطع المطرزة.',
        icon: Sparkles,
      },
      {
        title: 'تخزين بعناية',
        text: 'اطوي القطع بشكل مرتب واحفظيها في مكان جاف بعيدًا عن الشمس المباشرة.',
        icon: Leaf,
      },
    ],
  },
};

export default function CareGuide() {
  const { isArabic } = useLanguage();
  const c = isArabic ? copy.ar : copy.en;

  return (
    <>
      <SEO
        title={c.title}
        description={c.intro}
        image="/images/products/linen-whisper/1.webp"
      />

      <section className="relative overflow-hidden bg-beige">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(185,154,91,0.18),transparent_28%),linear-gradient(115deg,rgba(250,247,239,0.95),rgba(232,221,203,0.72))]" />

        <div className="container-soft relative grid min-h-[70vh] items-center gap-10 py-16 lg:grid-cols-[1fr_460px]">
          <div>
            <p className="eyebrow">{c.title}</p>
            <h1 className="page-title mt-4 max-w-4xl">{c.headline}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/72">{c.intro}</p>
            <Link to="/shop" className="btn-primary mt-9">
              {isArabic ? 'تسوقي المجموعة' : 'Shop the collection'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-[36px] bg-white p-3 shadow-[0_28px_80px_rgba(79,91,58,0.16)]">
            <img
              src="/images/products/linen-whisper/1.webp"
              alt="ByJojo care guide"
              className="h-[520px] w-full rounded-[28px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-soft grid gap-5 md:grid-cols-2">
          {c.steps.map((step) => {
            const Icon = step.icon;

            return (
              <article key={step.title} className="rounded-[30px] border border-sand bg-white p-6 shadow-[0_18px_55px_rgba(79,91,58,0.08)]">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-olive">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-5 font-serif text-3xl text-charcoal">{step.title}</h2>
                <p className="mt-3 leading-7 text-charcoal/65">{step.text}</p>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}