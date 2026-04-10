import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';

const steps = [1, 2, 3, 4].map((id) => ({
  id: `0${id}`,
  titleKey: `flow.${id}.title`,
  descKey: `flow.${id}.desc`,
}));

export default function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section className="bg-[#060708] px-6 py-32 lg:px-10" id="how-it-works">
      <div className="mx-auto max-w-7xl">
        <div className="mb-24 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#bac3ff]">{t('flow.eyebrow')}</p>
          <h2 className="mt-5 font-display text-5xl font-extrabold tracking-[-0.055em] text-[#f5f3ef] md:text-6xl">
            {t('flow.title')}
          </h2>
        </div>

        <div className="relative grid gap-12 md:grid-cols-4">
          <div className="absolute left-0 top-12 hidden h-px w-full bg-white/[0.04] md:block" />
          {steps.map((step, index) => (
            <motion.article
              key={step.id}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 28 }}
              transition={{ duration: 0.48, delay: index * 0.08 }}
              className="relative"
            >
              <div className="select-none font-display text-[7rem] font-extrabold leading-none tracking-[-0.08em] text-white/[0.055]">
                {step.id}
              </div>
              <div className="-mt-12">
                <h3 className="text-lg font-extrabold uppercase tracking-[0.14em] text-[#f5f3ef]">{t(step.titleKey)}</h3>
                <p className="mt-5 text-sm font-light leading-7 text-[#c5c5d6]">{t(step.descKey)}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
