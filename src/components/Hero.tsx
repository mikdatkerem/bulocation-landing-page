import { motion } from 'framer-motion';
import { ArrowRight, MapPinned } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const parkingSpots = [
  { id: 'A18', x: 690, y: 94, occupied: true },
  { id: 'A19', x: 690, y: 130, occupied: false },
  { id: 'A20', x: 690, y: 166, occupied: true },
  { id: 'A21', x: 690, y: 202, occupied: false },
  { id: 'A22', x: 690, y: 238, occupied: false, target: true },
  { id: 'A23', x: 690, y: 274, occupied: true },
  { id: 'B11', x: 450, y: 94, occupied: false },
  { id: 'B12', x: 450, y: 130, occupied: true },
  { id: 'B13', x: 450, y: 166, occupied: false },
  { id: 'B14', x: 450, y: 202, occupied: true },
  { id: 'B15', x: 450, y: 238, occupied: false },
  { id: 'B16', x: 450, y: 274, occupied: true },
  { id: 'C04', x: 210, y: 94, occupied: true },
  { id: 'C05', x: 210, y: 130, occupied: false },
  { id: 'C06', x: 210, y: 166, occupied: false },
  { id: 'C07', x: 210, y: 202, occupied: true },
  { id: 'C08', x: 210, y: 238, occupied: false },
  { id: 'C09', x: 210, y: 274, occupied: true },
];

const routePath = 'M118 334 H560 V238 H690';

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
          <div className="absolute inset-0 bg-[#090b0d]" />
          <div className="absolute inset-x-8 top-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[#bac3ff]/70">
            <span>B2 Parking floor</span>
            <span>A22 · 12 boş · 6 dolu</span>
          </div>

          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" viewBox="0 0 900 420">
            <defs>
              <filter id="parkingRouteGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g>
              <rect x="70" y="58" width="760" height="304" rx="4" fill="#0d1013" />
              <rect x="70" y="58" width="760" height="304" rx="4" fill="none" stroke="rgba(186,195,255,0.09)" />

              <g fill="rgba(245,243,239,0.035)">
                <rect x="142" y="74" width="136" height="224" rx="3" />
                <rect x="382" y="74" width="136" height="224" rx="3" />
                <rect x="622" y="74" width="136" height="224" rx="3" />
              </g>

              <g fill="none" stroke="rgba(186,195,255,0.085)" strokeWidth="1.2">
                <path d="M104 318 H794" />
                <path d="M104 318 V348 H794 V318" />
                <path d="M320 74 V298" />
                <path d="M560 74 V298" />
              </g>

              <text x="186" y="56" fill="rgba(186,195,255,0.55)" fontSize="10" fontWeight="700" letterSpacing="2">ZONE C</text>
              <text x="426" y="56" fill="rgba(186,195,255,0.55)" fontSize="10" fontWeight="700" letterSpacing="2">ZONE B</text>
              <text x="666" y="56" fill="rgba(186,195,255,0.55)" fontSize="10" fontWeight="700" letterSpacing="2">ZONE A</text>

              {parkingSpots.map((spot) => (
                <g key={spot.id}>
                  <rect
                    x={spot.x - 32}
                    y={spot.y - 12}
                    width="64"
                    height="24"
                    rx="4"
                    fill={spot.target ? 'rgba(24,54,185,0.95)' : spot.occupied ? 'rgba(153,42,42,0.88)' : 'rgba(23,118,78,0.88)'}
                  />
                  <text x={spot.x} y={spot.y + 4} fill="#f5f3ef" fontSize="10" fontWeight="800" letterSpacing="1" textAnchor="middle">
                    {spot.id}
                  </text>
                </g>
              ))}

              <path
                d={routePath}
                fill="none"
                stroke="rgba(186,195,255,0.15)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="7"
              />
              <motion.path
                animate={{ pathLength: [0, 1], opacity: [0.25, 1, 0.8] }}
                d={routePath}
                fill="none"
                filter="url(#parkingRouteGlow)"
                initial={{ pathLength: 0 }}
                stroke="#1836B9"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
                transition={{ duration: 3.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.2 }}
              />
              <g>
                <circle cx="118" cy="334" r="7" fill="#1836B9" />
                <circle cx="560" cy="334" r="5.5" fill="#bac3ff" />
                <circle cx="560" cy="238" r="5.5" fill="#bac3ff" />
                <circle cx="690" cy="238" r="9" fill="#1836B9" />
                <circle cx="690" cy="238" r="20" fill="none" stroke="rgba(24,54,185,0.42)" />
                <text x="96" y="366" fill="rgba(245,243,239,0.72)" fontSize="10" fontWeight="800" letterSpacing="1.5">ENTRY</text>
              </g>
            </g>
          </svg>

          <div className="absolute right-8 top-8 flex items-center gap-3 rounded-xl bg-[#060708]/80 px-4 py-3 backdrop-blur-xl">
            <MapPinned className="h-4 w-4 text-[#bac3ff]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c5c5d6]">ENTRY → A22</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
