import { useLanguage } from '../hooks/useLanguage';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="fixed right-6 top-6 z-50">
      <div className="flex border border-white/10 bg-[#131314] p-1">
        <button 
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 text-xs font-semibold tracking-[0.18em] transition-colors ${language === 'en' ? 'bg-[#3B82F6] text-[#002C66]' : 'text-slate-500 hover:text-white'}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage('tr')}
          className={`px-3 py-1 text-xs font-semibold tracking-[0.18em] transition-colors ${language === 'tr' ? 'bg-[#3B82F6] text-[#002C66]' : 'text-slate-500 hover:text-white'}`}
        >
          TR
        </button>
      </div>
    </div>
  );
}
