import { motion } from 'framer-motion';
import { ArrowRight, Box, Cpu } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const icons = [Box, Cpu, ArrowRight];

export default function HowItWorks() {
  const { t } = useLanguage();
  const steps = [1, 2, 3].map((id, index) => ({
    id,
    icon: icons[index],
    title: t(`hiw.step${id}.title`),
    description: t(`hiw.step${id}.desc`),
  }));

  return (
    <section className="bg-[#0E0E0F] py-24" id="how-it-works">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-14 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#85ADFF]">{t('hiw.eyebrow')}</p>
          <h2 className="mt-4 font-display text-4xl font-bold uppercase tracking-[-0.04em] text-white sm:text-5xl">
            {t('hiw.title')}
          </h2>
        </div>

        <div className="grid gap-px bg-white/5 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 26 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#131314] px-8 py-10"
              >
                <div className="mb-8 inline-flex h-12 w-12 items-center justify-center bg-[#201F21] text-[#85ADFF]">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-[0.08em] text-white">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
