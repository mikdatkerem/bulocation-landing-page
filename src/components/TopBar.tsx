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
    <header className="fixed left-0 top-0 z-40 w-full overflow-hidden bg-[#060708]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-10">
        <a className="relative flex h-20 w-44 items-center md:w-56" href="/">
          <img
            alt="BuLocation"
            className="h-12 w-auto object-contain md:h-14"
            src="/logo3d.png"
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
