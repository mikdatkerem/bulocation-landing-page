import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';

type TopBarProps = {
  active?: 'home' | 'services';
};

export default function TopBar({ active = 'home' }: TopBarProps) {
  const { t } = useLanguage();

  const linkClassName = (isActive: boolean) =>
    `border-b-2 pb-1 transition-colors ${isActive ? 'border-[#1836B9] text-[#F5F3EF]' : 'border-transparent text-[#9da3ad] hover:text-[#F5F3EF]'}`;

  return (
    <header className="bg-[#060708]">
      <div className="mx-auto grid h-28 max-w-6xl grid-cols-[1fr_auto] items-center px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <a className="relative block h-16 w-72 justify-self-start overflow-visible lg:-ml-2 lg:w-80" href="/">
          <img
            alt="BuLocation"
            className="absolute left-0 top-9 h-42 w-auto max-w-none -translate-y-1/2 object-contain sm:h-64"
            src="/logo_removed_bg.png"
          />
        </a>
        <nav className="flex items-center justify-end gap-8 text-[11px] font-semibold uppercase tracking-[0.22em]">
          <motion.a
            className={linkClassName(active === 'services')}
            href="/hizmetlerimiz"
            whileHover={{ y: -1 }}
          >
            {t('nav.services')}
          </motion.a>
          <motion.a
            className={linkClassName(false)}
            href="/#about"
            whileHover={{ y: -1 }}
          >
            {t('nav.about')}
          </motion.a>
          <motion.a
            className={linkClassName(false)}
            href="/#contact"
            whileHover={{ y: -1 }}
          >
            {t('nav.contact')}
          </motion.a>
        </nav>
      </div>
    </header>
  );
}
