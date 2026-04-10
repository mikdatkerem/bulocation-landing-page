import { Linkedin } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0d1013] text-[#c5c0ba]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 text-[11px] uppercase tracking-[0.18em] md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <span className="font-display text-sm tracking-[0.12em] text-[#F5F3EF]">
            BuLocation
          </span>
          <span className="text-sm">
            &copy; {new Date().getFullYear()} {t('footer.rights')}
          </span>
        </div>

        <div className="flex flex-col items-center gap-3 md:flex-row md:gap-6">
          <span>{t('footer.developed')}</span>
          <a
            href="https://www.linkedin.com/in/mikdatkeremkalkan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#F5F3EF] transition-colors duration-200 hover:text-[#4B18B9]"
          >
            Mikdat Kerem Kalkan
            <Linkedin className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
