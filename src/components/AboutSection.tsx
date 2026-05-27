import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';

const pillars = [1, 2, 3].map((id) => ({
  id,
  titleKey: `about.${id}.title`,
  descKey: `about.${id}.desc`,
}));

export default function AboutSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-[#060708] px-6 py-32 lg:px-10" id="about">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c4b5fd]">{t('about.eyebrow')}</p>
          <h2 className="mt-5 max-w-xl font-display text-5xl font-extrabold leading-[0.92] tracking-[-0.06em] text-[#f5f3ef] md:text-6xl">
            {t('about.title')}
          </h2>
        </div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 22 }}
          transition={{ duration: 0.55 }}
          className="space-y-5"
        >
          {pillars.map((pillar) => (
            <article key={pillar.id} className="rounded-xl bg-[#121315] p-9">
              <div className="flex items-start gap-8">
                <span className="font-display text-sm font-extrabold text-[#6366F1]">0{pillar.id}</span>
                <div>
                  <h3 className="font-display text-2xl font-extrabold tracking-[-0.04em] text-[#f5f3ef]">
                    {t(pillar.titleKey)}
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm font-light leading-7 text-[#c5c5d6]">{t(pillar.descKey)}</p>
                </div>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
