import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const useCases = ['Hastaneler', 'Kampusler', 'AVM ve karma yapilar', 'Otopark operasyonlari'];

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-[#060708]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[6%] top-[28%] h-[36vw] max-h-[460px] w-px bg-[#15191d]" />
        <div className="absolute right-[8%] top-[20%] h-[42vw] max-h-[520px] w-px bg-[#15191d]" />
        <div className="absolute inset-x-[18%] top-[19%] h-px bg-[#15191d]" />
        <div className="absolute bottom-[16%] left-[10%] right-[10%] h-px bg-[#0d1013]" />
        <div className="absolute left-[12%] top-[38%] h-[220px] w-[220px] border border-[#0d1013]" />
        <div className="absolute right-[16%] top-[34%] h-[280px] w-[280px] border border-[#0d1013]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-124px)] max-w-6xl items-center px-6 py-16 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 28 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-4xl"
          >
            <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#4B18B9]">
              {t('hero.badge')}
            </p>

            <h1 className="max-w-4xl font-display text-6xl font-bold leading-[0.9] tracking-[-0.06em] text-[#F5F3EF] sm:text-7xl lg:text-[6rem]">
              Iceride yon bulmayi
              <br />
              yeniden tasarliyoruz.
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-[#c5c0ba] sm:text-lg">
              Bulocation; hastaneler, kampusler, avm’ler ve buyuk kapali alanlar icin
              indoor navigation altyapisini tek bir platformda toplar. Otopark bu
              sistemin bir parcasi, ama merkeze bina ici yonlendirmeyi koyar.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center gap-2 bg-[#1836B9] px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#F5F3EF] transition-transform duration-200 hover:-translate-y-0.5"
                href="#features"
              >
                {t('hero.btn.primary')}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                className="inline-flex items-center border border-[#4B18B9] px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#F5F3EF] transition-colors duration-200 hover:bg-[#0d1013]"
                href="#how-it-works"
              >
                {t('hero.btn.secondary')}
              </a>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: 28 }}
            transition={{ duration: 0.8, delay: 0.12, ease: 'easeOut' }}
            className="border border-[#15191d] bg-[#0d1013] p-6 lg:p-8"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#8e8a84]">
              PLATFORM ODAKLARI
            </div>

            <div className="mt-8 space-y-6">
              {useCases.map((item, index) => (
                <div
                  key={item}
                  className={`flex items-center justify-between border-b border-[#15191d] pb-4 ${
                    index === useCases.length - 1 ? 'border-b-0 pb-0' : ''
                  }`}
                >
                  <span className="text-lg font-medium tracking-[-0.03em] text-[#F5F3EF]">
                    {item}
                  </span>
                  <span className="text-xs uppercase tracking-[0.24em] text-[#1836B9]">
                    0{index + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-10 border-t border-[#15191d] pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#8e8a84]">
                KURUMSAL KULLANIM
              </p>
              <p className="mt-4 text-sm leading-7 text-[#c5c0ba]">
                Harita yonetimi, kat bazli navigasyon, QR temelli konum acilisi,
                kamera-zone kurgusu ve operasyonel backoffice ayni cati altinda
                yonetilir.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
