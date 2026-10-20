import React, { useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { playCyberClick } from '../utils/soundEffects';
import { DataSecurityStandardModal } from './DataSecurityStandardModal';

interface DataSecurityBadgeProps {
  variant?: 'compact' | 'full' | 'subtle' | 'pill';
  className?: string;
}

export const DataSecurityBadge: React.FC<DataSecurityBadgeProps> = ({
  variant = 'compact',
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playCyberClick();
    setIsModalOpen(true);
  };

  if (variant === 'pill') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          title="คลิกเพื่อดูมาตรฐานการรักษาความปลอดภัยของข้อมูล (Data Security Standard)"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>มาตรฐานความปลอดภัยข้อมูล PDPA</span>
        </button>
        <DataSecurityStandardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  if (variant === 'subtle') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          title="ระบบรักษาความปลอดภัยข้อมูลและความลับขั้นสูง"
          className={`inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>ความปลอดภัยข้อมูลตามมาตรฐาน PDPA</span>
        </button>
        <DataSecurityStandardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  if (variant === 'full') {
    return (
      <>
        <div 
          onClick={handleClick}
          className={`p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 cursor-pointer hover:border-[#005A9C]/40 transition-all ${className}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>มาตรฐานการรักษาความปลอดภัยของข้อมูล</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">SECURED</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                ข้อมูลพนักงาน 230 คน • ป้องกันความลับขั้นสูงสุด • บันทึกประวัติข้อสอบจริง
              </div>
            </div>
          </div>
          <span className="text-[10px] text-[#005A9C] font-bold hover:underline shrink-0">
            ดูมาตรฐาน &raquo;
          </span>
        </div>
        <DataSecurityStandardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  // default: compact (ideal for header/navbar)
  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title="คลิกเพื่อดูมาตรฐานการรักษาความปลอดภัยของข้อมูล (TCT Certified Data Security Standard)"
        className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="hidden sm:inline">มาตรฐานความปลอดภัย</span>
        <span className="sm:hidden">PDPA</span>
      </button>
      <DataSecurityStandardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
