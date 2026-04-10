import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';

type TopBarProps = {
  active?: 'home' | 'services';
};

export default function TopBar({ active = 'home' }: TopBarProps) {
  const { t } = useLanguage();

  const linkClassName = (isActive: boolean) =>
    [
      'font-display text-[11px] font-bold uppercase tracking-[0.2em] transition-colors',
      isActive ? 'text-[#f5f3ef]' : 'text-[#8f96a3] hover:text-[#f5f3ef]',
    ].join(' ');

  return (
    <header className="fixed left-0 top-0 z-40 w-full bg-[#060708]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <a className="relative block h-20 w-56 overflow-visible md:w-64" href="/">
          <img
            alt="BuLocation"
            className="absolute left-0 top-1/2 h-24 w-auto max-w-none -translate-y-1/2 object-contain md:h-45"
            src="/logo_removed_bg.png"
          />
        </a>

        <nav className="hidden items-center gap-10 md:flex">
          <motion.a className={linkClassName(active === 'services')} href="/hizmetlerimiz" whileHover={{ y: -1 }}>
            {t('nav.services')}
          </motion.a>
          <motion.a className={linkClassName(false)} href="/#about" whileHover={{ y: -1 }}>
            {t('nav.about')}
          </motion.a>
          <motion.a className={linkClassName(false)} href="/#contact" whileHover={{ y: -1 }}>
            {t('nav.contact')}
          </motion.a>
        </nav>
      </div>
    </header>
  );
}
