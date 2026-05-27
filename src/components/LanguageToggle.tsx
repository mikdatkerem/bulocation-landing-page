import { useLanguage } from '../hooks/useLanguage';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="fixed right-6 top-6 z-50">
      <div className="flex rounded-lg bg-[#121315] p-1">
        <button 
          onClick={() => setLanguage('en')}
          className={`rounded-md px-3 py-1 text-xs font-semibold tracking-[0.18em] transition-colors ${language === 'en' ? 'bg-[#6366F1] text-[#f5f3ef]' : 'text-[#8f96a3] hover:text-[#f5f3ef]'}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage('tr')}
          className={`rounded-md px-3 py-1 text-xs font-semibold tracking-[0.18em] transition-colors ${language === 'tr' ? 'bg-[#6366F1] text-[#f5f3ef]' : 'text-[#8f96a3] hover:text-[#f5f3ef]'}`}
        >
          TR
        </button>
      </div>
    </div>
  );
}
