import React, { useEffect, useState } from 'react';
import { ShieldAlert, Clock, LogOut, RefreshCw, ShieldCheck, Lock } from 'lucide-react';
import { playCyberClick } from '../utils/soundEffects';

interface AutoLogoutSecurityModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  userName: string;
  empId: string;
  department: string;
  onExtendSession: () => void;
  onConfirmLogout: () => void;
}

export const AutoLogoutSecurityModal: React.FC<AutoLogoutSecurityModalProps> = ({
  isOpen,
  remainingSeconds,
  userName,
  empId,
  department,
  onExtendSession,
  onConfirmLogout
}) => {
  if (!isOpen) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isCritical = remainingSeconds <= 20;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-md w-full overflow-hidden text-slate-800 animate-scaleUp">
        
        {/* Header with warning accent */}
        <div className={`p-5 text-white ${isCritical ? 'bg-gradient-to-r from-red-700 to-rose-600 animate-pulse' : 'bg-gradient-to-r from-red-600 to-amber-600'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-red-100 flex items-center gap-1">
                <Lock className="w-3 h-3" /> TCT Security Auto-Protection
              </div>
              <h2 className="text-lg font-extrabold leading-tight">
                แจ้งเตือนความปลอดภัย: กำลังจะออกจากระบบอัตโนมัติ
              </h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* User info badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">บัญชีที่กำลังใช้งาน</div>
              <div className="font-bold text-slate-900 text-sm">{userName}</div>
              <div className="text-[11px] text-blue-700 font-semibold">
                รหัสพนักงาน: {empId} • แผนก: {department}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                ไม่มีการเคลื่อนไหว
              </span>
            </div>
          </div>

          {/* Countdown display */}
          <div className="text-center py-2">
            <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span>ระบบจะออกจากระบบอัตโนมัติภายใน</span>
            </div>
            <div className={`text-4xl sm:text-5xl font-mono font-black tracking-wider ${isCritical ? 'text-red-600 scale-105 transition-transform' : 'text-slate-800'}`}>
              {formattedTime}
            </div>
            <div className="text-xs text-red-600 font-medium mt-1">
              {isCritical ? '⚠️ กำลังจะออกจากระบบในไม่กี่วินาที!' : 'วินาที'}
            </div>
          </div>

          {/* Security reason notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">นโยบายความปลอดภัย TCT Academy:</span> ระบบตรวจพบว่าไม่มีการใช้งานเป็นเวลา 4 นาที จึงแจ้งเตือนเพื่อออกจากระบบอัตโนมัติ ป้องกันไม่ให้เพื่อนร่วมงานหรือบุคคลอื่นใช้งานบัญชีของคุณบนเครื่องนี้
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => {
                playCyberClick();
                onExtendSession();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>ฉันยังใช้งานอยู่ (ต่อเวลา 5 นาที)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playCyberClick();
                onConfirmLogout();
              }}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบทันที</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
