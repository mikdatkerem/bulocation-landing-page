import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';

export default function TechStack() {
  const { t } = useLanguage();

  return (
    <section className="bg-[#85ADFF] py-20" id="contact">
      <div className="mx-auto max-w-6xl px-6 text-center lg:px-8">
        <motion.h2
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="font-display text-4xl font-bold uppercase tracking-[-0.04em] text-[#17356B] sm:text-6xl"
        >
          {t('cta.title')}
        </motion.h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            className="border-2 border-[#17356B] bg-[#17356B] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#85ADFF] transition-transform hover:-translate-y-0.5"
            href="mailto:hello@bulocation.com"
          >
            {t('cta.primary')}
          </a>
          <a
            className="border-2 border-[#17356B] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#17356B] transition-colors hover:bg-[#17356B] hover:text-[#85ADFF]"
            href="#features"
          >
            {t('cta.secondary')}
          </a>
        </div>
      </div>
    </section>
  );
}
