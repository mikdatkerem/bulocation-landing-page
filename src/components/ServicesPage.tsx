import { motion } from 'framer-motion';
import TopBar from './TopBar';
import Footer from './Footer';
import { useLanguage } from '../hooks/useLanguage';

export default function ServicesPage() {
  const { t } = useLanguage();
  const services = [1, 2, 3, 4, 5, 6];

  return (
    <div className="min-h-screen bg-[#060708] text-[#f5f3ef]">
      <TopBar active="services" />
      <main className="pt-28">
        <section className="px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#bac3ff]">{t('services.eyebrow')}</p>
            <h1 className="mt-5 max-w-5xl font-display text-6xl font-extrabold leading-[0.88] tracking-[-0.07em] text-[#f5f3ef] md:text-8xl">
              {t('services.title')}
            </h1>
            <p className="mt-8 max-w-2xl text-lg font-light leading-8 text-[#c5c5d6]">{t('services.desc')}</p>
          </div>
        </section>

        <section className="px-6 pb-28 lg:px-10">
          <div className="mx-auto max-w-7xl space-y-4">
            {services.map((id, index) => (
              <motion.article
                key={id}
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 18 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="rounded-xl bg-[#121315] px-8 py-8 transition-colors hover:bg-[#1f2021] md:px-10"
              >
                <div className="grid gap-6 md:grid-cols-[0.16fr_0.84fr] md:items-start">
                  <span className="font-display text-sm font-extrabold text-[#1836B9]">0{id}</span>
                  <div>
                    <h2 className="font-display text-2xl font-extrabold uppercase tracking-[-0.03em] text-[#f5f3ef]">
                      {t(`services.${id}.title`)}
                    </h2>
                    <p className="mt-4 max-w-4xl text-sm font-light leading-7 text-[#c5c5d6]">
                      {t(`services.${id}.desc`)}{' '}
                      <a className="font-bold text-[#bac3ff] hover:text-[#f5f3ef]" href="mailto:hello@bulocation.com">
                        {t('services.contact')}
                      </a>
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
