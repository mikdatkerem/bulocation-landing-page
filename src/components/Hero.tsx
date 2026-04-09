import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="bg-[#0E0E0F]">
      <div className="mx-auto flex min-h-[calc(100svh-124px)] max-w-6xl items-center px-6 pb-10 pt-4 lg:px-8 lg:pb-12">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#85ADFF]">
              {t('hero.badge')}
            </p>
            <h1 className="max-w-xl font-display text-5xl font-bold leading-[0.92] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              {t('hero.title')}
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-slate-400 sm:text-base">
              {t('hero.desc')}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center gap-2 bg-[#85ADFF] px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#002C66] transition-transform duration-200 hover:-translate-y-0.5"
                href="#features"
              >
                {t('hero.btn.primary')}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                className="inline-flex items-center border-2 border-[#3B82F6] px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#85ADFF] transition-colors duration-200 hover:bg-[#131314]"
                href="#how-it-works"
              >
                {t('hero.btn.secondary')}
              </a>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, rotate: -12, scale: 1 }}
            initial={{ opacity: 0, rotate: -6, scale: 0.92 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            className="relative mx-auto flex h-[320px] w-full max-w-[420px] items-center justify-center overflow-hidden bg-[#131314]"
          >
            <div className="absolute inset-8 border border-white/10" />
            <div className="absolute inset-14 border border-white/5" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
              className="absolute h-56 w-56 border border-[#3B82F6]/30"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
              className="absolute h-40 w-40 border border-white/10"
            />
            <div className="absolute h-16 w-16 border border-[#85ADFF]" />
            <div className="absolute h-4 w-4 bg-[#85ADFF]" />
            <div className="absolute inset-[22%] border border-[#85ADFF]/10 bg-[#85ADFF]/5" />
          </motion.div>
        </div>
      </div>

    </section>
  );
}
