import { motion } from 'framer-motion';
import TopBar from './TopBar';
import Footer from './Footer';
import { useLanguage } from '../hooks/useLanguage';

export default function ServicesPage() {
  const { t } = useLanguage();
  const services = [1, 2, 3, 4, 5, 6];

  return (
    <div className="min-h-screen bg-[#0E0E0F] text-white">
      <TopBar active="services" />
      <main>
        <section className="bg-[#0E0E0F] pb-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#85ADFF]">{t('services.eyebrow')}</p>
            <h1 className="mt-4 max-w-4xl font-display text-5xl font-bold leading-[0.92] tracking-[-0.05em] text-white sm:text-6xl">
              {t('services.title')}
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">{t('services.desc')}</p>
          </div>
        </section>

        <section className="bg-[#131314] py-8">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="grid gap-px bg-white/5">
              {services.map((id, index) => (
                <motion.article
                  key={id}
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 18 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="bg-[#0E0E0F] px-7 py-8"
                >
                  <h2 className="text-xl font-bold uppercase tracking-[0.08em] text-white">
                    {t(`services.${id}.title`)}
                  </h2>
                  <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-400">
                    {t(`services.${id}.desc`)}{' '}
                    <a className="font-semibold text-[#85ADFF] hover:text-white" href="mailto:hello@bulocation.com">
                      {t('services.contact')}
                    </a>
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
