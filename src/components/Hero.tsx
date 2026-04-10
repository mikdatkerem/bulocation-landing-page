import { motion } from 'framer-motion';
import { ArrowRight, MapPinned, Router } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const nodePositions = [
  { left: '18%', top: '55%', labelKey: 'hero.node.parking' },
  { left: '43%', top: '36%', labelKey: 'hero.node.entry' },
  { left: '70%', top: '48%', labelKey: 'hero.node.department' },
  { left: '57%', top: '72%', labelKey: 'hero.node.elevator' },
];

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#060708] pt-20">
      <div className="absolute inset-0 landing-technical-grid opacity-35" />
      <div className="absolute inset-x-0 top-0 h-32 bg-[#060708]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-80px)] max-w-7xl flex-col items-center justify-center px-6 py-16 text-center lg:px-10">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="max-w-6xl pt-16"
        >
          <h1 className="font-display text-[4.4rem] font-extrabold uppercase leading-[0.84] tracking-[-0.075em] text-[#f5f3ef] sm:text-8xl lg:text-[7.4rem]">
            {t('hero.title.line1')}
            <br />
            <span className="landing-text-glow text-[#1836B9]">{t('hero.title.line2')}</span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg font-light leading-8 text-[#c5c5d6] md:text-2xl">
            {t('hero.desc')}
          </p>

          <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#f5f3ef] px-9 py-5 text-sm font-extrabold uppercase tracking-[0.16em] text-[#060708] transition-transform hover:-translate-y-1"
              href="#features"
            >
              {t('hero.btn.primary')}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              className="inline-flex items-center justify-center rounded-lg bg-[#121315] px-9 py-5 text-sm font-extrabold uppercase tracking-[0.16em] text-[#f5f3ef] transition-colors hover:bg-[#1f2021]"
              href="#how-it-works"
            >
              {t('hero.btn.secondary')}
            </a>
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 34 }}
          transition={{ duration: 0.85, delay: 0.16, ease: 'easeOut' }}
          className="relative mt-20 h-[360px] w-full max-w-6xl overflow-hidden rounded-xl bg-[#121315] lg:h-[420px]"
        >
          <div className="absolute inset-0 landing-fine-grid opacity-70" />
          <div className="absolute inset-8 border border-white/[0.04]" />
          <div className="absolute inset-x-16 top-1/2 h-px bg-[#bac3ff]/18" />
          <div className="absolute inset-y-14 left-1/2 w-px bg-[#bac3ff]/18" />

          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1000 420">
            <path d="M180 230 L430 150 L705 205 L570 305 L180 230" fill="rgba(24,54,185,0.12)" stroke="rgba(186,195,255,0.35)" strokeWidth="1.2" />
            <path d="M430 150 L520 92 L805 245" fill="none" stroke="rgba(75,24,185,0.5)" strokeWidth="1.1" />
            <path d="M570 305 L610 210 L705 205" fill="none" stroke="rgba(245,243,239,0.45)" strokeWidth="1" />
            <path d="M180 230 L260 315 L570 305" fill="none" stroke="rgba(186,195,255,0.18)" strokeDasharray="6 6" strokeWidth="1" />
          </svg>

          {nodePositions.map((node, index) => (
            <div
              key={node.labelKey}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-3"
              style={{ left: node.left, top: node.top }}
            >
              <span className={`h-3 w-3 rounded-full ${index === 0 ? 'landing-signal bg-[#1836B9]' : 'bg-[#bac3ff]'}`} />
              <span className="hidden rounded-lg bg-[#060708]/75 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f5f3ef] backdrop-blur md:block">
                {t(node.labelKey)}
              </span>
            </div>
          ))}

          <div className="absolute bottom-8 left-8 flex items-center gap-4 rounded-xl bg-[#060708]/80 p-4 backdrop-blur-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1836B9] text-[#f5f3ef]">
              <Router className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#f5f3ef]">{t('hero.cluster.title')}</div>
              <div className="mt-1 text-xs text-[#bac3ff]/70">{t('hero.cluster.desc')}</div>
            </div>
          </div>

          <div className="absolute right-8 top-8 flex items-center gap-3 rounded-xl bg-[#060708]/70 px-4 py-3 backdrop-blur-xl">
            <MapPinned className="h-4 w-4 text-[#bac3ff]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c5c5d6]">{t('hero.qr')}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
