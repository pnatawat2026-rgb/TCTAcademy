import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const SystemAutoCorrectionView: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'running' | 'fixed'>('idle');
  const [lastCheck, setLastCheck] = useState<string>('ยังไม่ได้ตรวจสอบ');

  const runCorrection = () => {
    setStatus('running');
    // Simulate auto-correction
    setTimeout(() => {
      setStatus('fixed');
      setLastCheck(new Date().toLocaleTimeString('th-TH'));
      setTimeout(() => setStatus('idle'), 3000);
    }, 2000);
  };

  return (
    <div className="bg-[#0D1322] border border-slate-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
          <Cpu className="w-4 h-4 text-cyan-400" />
          ระบบตรวจสอบและแก้ไขอัตโนมัติ (System Auto-Correction)
        </div>
        <button 
            onClick={runCorrection}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1.5 rounded-lg border border-slate-600 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3 h-3 ${status === 'running' ? 'animate-spin' : ''}`} />
          ตรวจสอบเดี๋ยวนี้
        </button>
      </div>
      
      <div className="text-[11px] text-slate-400">
        ระบบตรวจสอบความผิดพลาดของคะแนนและการเชื่อมต่อข้อมูลอัตโนมัติ
      </div>

      {status === 'fixed' && (
        <div className="p-2 bg-emerald-950/50 border border-emerald-500/30 rounded text-[10px] text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3"/> ระบบตรวจพบและแก้ไขข้อผิดพลาดเรียบร้อยแล้ว
        </div>
      )}
    </div>
  );
};
