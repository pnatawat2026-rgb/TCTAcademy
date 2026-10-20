import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';
import { playCyberClick } from '../utils/soundEffects';

interface LanguageToggleProps {
  variant?: 'pill' | 'compact' | 'button';
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ variant = 'pill', className = '' }) => {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => {
          playCyberClick();
          toggleLanguage();
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-blue-950/80 text-blue-300 border-blue-500/50 shadow-sm shadow-blue-500/20'
            : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-600'
        } ${className}`}
        title="สลับภาษา / Switch Language (TH / EN)"
      >
        <Globe className="w-3.5 h-3.5 text-cyan-400" />
        <span>{language.toUpperCase()}</span>
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={() => {
          playCyberClick();
          toggleLanguage();
        }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-blue-900/90 text-blue-100 border-blue-400 shadow-md shadow-blue-500/30'
            : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-slate-600'
        } ${className}`}
      >
        <Globe className="w-4 h-4 text-cyan-400" />
        <span>{language === 'th' ? '🇹🇭 ภาษาไทย (TH)' : '🇬🇧 English (EN)'}</span>
      </button>
    );
  }

  // Default 'pill' segmented switch
  return (
    <div className={`inline-flex items-center p-0.5 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (language !== 'th') {
            playCyberClick();
            setLanguage('th');
          }
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          language === 'th'
            ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <span>🇹🇭</span>
        <span>TH</span>
      </button>
      <button
        type="button"
        onClick={() => {
          if (language !== 'en') {
            playCyberClick();
            setLanguage('en');
          }
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
};
