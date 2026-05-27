import { Linkedin } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#060708] px-6 py-14 text-[#6f7480] lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 text-[10px] font-bold uppercase tracking-[0.18em] md:flex-row">
        <div className="text-center md:text-left">
          <div className="font-display text-sm tracking-[0.16em] text-[#f5f3ef]">BULOCATION</div>
          <div className="mt-2">&copy; {new Date().getFullYear()} {t('footer.desc')}</div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8">
          <a className="transition-colors hover:text-[#6366F1]" href="/hizmetlerimiz">
            {t('footer.services')}
          </a>
          <a className="transition-colors hover:text-[#6366F1]" href="/#about">
            {t('footer.about')}
          </a>
          <a
            className="flex items-center gap-2 text-[#c5c5d6] transition-colors hover:text-[#6366F1]"
            href="https://www.linkedin.com/in/mikdatkeremkalkan"
            rel="noopener noreferrer"
            target="_blank"
          >
            LinkedIn
            <Linkedin className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
