import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#060708] pt-20">
      <div className="absolute inset-0 landing-technical-grid opacity-35" />
      <div className="absolute inset-x-0 top-0 h-32 bg-[#060708]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-80px)] max-w-7xl flex-col items-center justify-center px-6 py-16 text-center lg:px-10">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="max-w-6xl pt-16"
        >
          <h1 className="font-display text-[4.4rem] font-extrabold uppercase leading-[0.84] tracking-[-0.075em] text-[#f5f3ef] sm:text-8xl lg:text-[7.4rem]">
            {t('hero.title.line1')}
            <br />
            <span className="landing-text-glow text-[#6366F1]">{t('hero.title.line2')}</span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg font-light leading-8 text-[#c5c5d6] md:text-2xl">
            {t('hero.desc')}
          </p>

          <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#f5f3ef] px-9 py-5 text-sm font-extrabold uppercase tracking-[0.16em] text-[#060708] transition-transform hover:-translate-y-1"
              href="#features"
            >
              {t('hero.btn.primary')}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              className="inline-flex items-center justify-center rounded-lg bg-[#121315] px-9 py-5 text-sm font-extrabold uppercase tracking-[0.16em] text-[#f5f3ef] transition-colors hover:bg-[#1f2021]"
              href="#how-it-works"
            >
              {t('hero.btn.secondary')}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
