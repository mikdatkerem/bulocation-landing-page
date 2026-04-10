import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function TechStack() {
  const { t } = useLanguage();

  return (
    <section className="bg-[#060708] px-6 py-40 text-center lg:px-10" id="contact">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-6xl font-extrabold uppercase leading-[0.88] tracking-[-0.07em] text-[#f5f3ef] md:text-8xl">
          {t('cta.title.line1')}
          <br />
          <span className="landing-text-glow text-[#1836B9]">{t('cta.title.line2')}</span>
        </h2>
        <p className="mx-auto mt-9 max-w-2xl text-xl font-light leading-8 text-[#c5c5d6]">{t('cta.desc')}</p>
        <div className="mt-12 flex justify-center">
          <a
            className="group inline-flex items-center gap-4 rounded-lg bg-[#1836B9] px-12 py-6 font-display text-sm font-extrabold uppercase tracking-[0.22em] text-[#f5f3ef] transition-transform hover:-translate-y-1"
            href="mailto:hello@bulocation.com"
          >
            {t('cta.primary')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
