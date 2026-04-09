import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, ArrowRightLeft, Building2, CarFront, Hospital, Map, ParkingSquare, ShieldCheck, University } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const featureIcons = [Building2, Accessibility, Map, ArrowRightLeft, ShieldCheck, CarFront];

export default function Features() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'institutions' | 'parking'>('institutions');

  const features = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6].map((id, index) => ({
        id,
        icon: featureIcons[index],
        title: t(`feat.${id}.title`),
        description: t(`feat.${id}.desc`),
      })),
    [t],
  );

  const institutions = [
    {
      icon: Hospital,
      title: t('institutions.1.title'),
      description: t('institutions.1.desc'),
    },
    {
      icon: University,
      title: t('institutions.2.title'),
      description: t('institutions.2.desc'),
    },
    {
      icon: Building2,
      title: t('institutions.3.title'),
      description: t('institutions.3.desc'),
    },
  ];

  const parking = [
    {
      icon: ParkingSquare,
      title: t('parking.1.title'),
      description: t('parking.1.desc'),
    },
    {
      icon: CarFront,
      title: t('parking.2.title'),
      description: t('parking.2.desc'),
    },
    {
      icon: ShieldCheck,
      title: t('parking.3.title'),
      description: t('parking.3.desc'),
    },
  ];

  const activeItems = activeTab === 'institutions' ? institutions : parking;

  return (
    <>
      <section className="bg-[#131314] py-24" id="features">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#85ADFF]">{t('feat.eyebrow')}</p>
              <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl">
                {t('feat.title')}
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-400">{t('feat.subtitle')}</p>
          </div>

          <div className="mt-14 grid gap-px bg-white/5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className="bg-[#0E0E0F] px-7 py-8"
                >
                  <div className="mb-6 inline-flex h-11 w-11 items-center justify-center bg-[#201F21] text-[#85ADFF]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-white">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#0E0E0F] py-24" id="solutions">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#85ADFF]">{t('solutions.eyebrow')}</p>
              <h2 className="mt-4 font-display text-4xl font-bold uppercase tracking-[-0.04em] text-white sm:text-5xl">
                {t('solutions.title')}
              </h2>
            </div>
            <div className="flex border border-white/10">
              <button
                className={`px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                  activeTab === 'institutions' ? 'bg-[#3B82F6] text-[#002C66]' : 'bg-[#131314] text-slate-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('institutions')}
                type="button"
              >
                {t('solutions.tab.institutions')}
              </button>
              <button
                className={`px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                  activeTab === 'parking' ? 'bg-[#3B82F6] text-[#002C66]' : 'bg-[#131314] text-slate-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('parking')}
                type="button"
              >
                {t('solutions.tab.parking')}
              </button>
            </div>
          </div>

          <div className="sr-only" id="institutions" />
          <div className="sr-only" id="parking" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mt-14 grid gap-px bg-white/5 md:grid-cols-3"
              id={activeTab === 'institutions' ? 'institutions' : 'parking'}
            >
              {activeItems.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="bg-[#131314] px-7 py-8">
                    <div className="mb-6 inline-flex h-11 w-11 items-center justify-center bg-[#201F21] text-[#85ADFF]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-bold uppercase tracking-[0.08em] text-white">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-slate-400">{item.description}</p>
                  </article>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
