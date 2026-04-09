import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';

export default function AboutSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-[#131314] py-24" id="about">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#85ADFF]">{t('about.eyebrow')}</p>
          <h2 className="mt-4 font-display text-4xl font-bold uppercase tracking-[-0.04em] text-white sm:text-5xl">
            {t('about.title')}
          </h2>
        </div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.45 }}
          className="grid gap-px bg-white/5"
        >
          {[1, 2, 3].map((id) => (
            <div key={id} className="bg-[#0E0E0F] px-7 py-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-white">{t(`about.${id}.title`)}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">{t(`about.${id}.desc`)}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
