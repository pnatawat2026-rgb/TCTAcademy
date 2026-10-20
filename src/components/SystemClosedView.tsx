import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Unlock,
  Calendar, 
  Clock, 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  AlertCircle,
  PhoneCall,
  CheckCircle2,
  Eye,
  ShieldCheck,
  X
} from 'lucide-react';
import { SystemAccessConfig } from '../utils/accessControl';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

interface SystemClosedViewProps {
  accessConfig: SystemAccessConfig;
  accessStatus: {
    isAllowed: boolean;
    reason: 'active' | 'manually_disabled' | 'outside_date_window';
    details: string;
  };
  isAdminLoggedIn?: boolean;
  onOpenAdminLogin: () => void;
  onBypassToEmployeeView?: () => void;
  onAdminAuthenticated?: () => void;
}

const REQUIRED_ADMIN_PIN = '25056';

export const SystemClosedView: React.FC<SystemClosedViewProps> = ({
  accessConfig,
  accessStatus,
  isAdminLoggedIn = false,
  onOpenAdminLogin,
  onBypassToEmployeeView,
  onAdminAuthenticated
}) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playCyberClick();

    if (pinInput.trim() === REQUIRED_ADMIN_PIN) {
      sessionStorage.setItem('tct_admin_auth', 'true');
      playSuccessChime();
      setPinError('');
      setShowPinModal(false);
      if (onAdminAuthenticated) {
        onAdminAuthenticated();
      } else {
        onOpenAdminLogin();
      }
    } else {
      setPinError('รหัสผ่าน PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen bg-[#080C15] text-slate-100 flex flex-col justify-between font-sarabun cyber-grid relative overflow-hidden px-4 py-6">
      {/* Background Cyber Lights */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Brand */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between border-b border-slate-800/80 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-cyan-300 uppercase bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                TCT E-TRAINING
              </span>
              <span className="text-[11px] text-amber-400 font-mono font-bold">TCT ACADEMY</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-100">
              ระบบฝึกอบรมและพัฒนาออนไลน์ พัฒนาโดย TCT ACADEMY
            </h1>
          </div>
        </div>

        {/* Admin Direct Access Buttons */}
        <div className="flex items-center gap-2">
          {isAdminLoggedIn && onBypassToEmployeeView && (
            <button
              id="btn-closed-employee-preview"
              type="button"
              onClick={() => {
                playCyberClick();
                onBypassToEmployeeView();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-purple-500/50 text-xs font-bold text-purple-200 transition-all cursor-pointer shadow-md"
            >
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span>มุมมองพนักงาน (Admin Preview)</span>
            </button>
          )}

          <button
            id="btn-closed-admin-entry"
            type="button"
            onClick={() => {
              playCyberClick();
              if (isAdminLoggedIn) {
                onOpenAdminLogin();
              } else {
                setShowPinModal(true);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-all cursor-pointer shadow-md"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>เข้าสู่ระบบแอดมิน (Admin Portal)</span>
          </button>
        </div>
      </header>

      {/* Main Center Message Box */}
      <main className="max-w-xl mx-auto w-full my-auto py-8 relative z-10">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-red-500/30 bg-[#0B0F19]/95 shadow-2xl relative text-center space-y-6">
          {/* Top Status Gradient Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-cyan-500 rounded-t-3xl" />

          {/* Locked Icon Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 border-2 border-red-500/30 mx-auto shadow-inner shadow-red-500/20 animate-bounce">
            <Lock className="w-10 h-10 text-red-400" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>SYSTEM ACCESS RESTRICTED • อยู่นอกช่วงเวลาทำการ</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              ระบบฝึกอบรมปิดรับการเข้าใช้งานชั่วคราว
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed px-2">
              {accessConfig.closedMessage || 'ระบบเปิดให้เข้าใช้งานเฉพาะช่วงวันที่ 24 ถึง 28 เท่านั้น'}
            </p>
          </div>

          {/* Schedule Window Info Box */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-left space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                กำหนดการเปิดระบบฝึกอบรม (Training Window)
              </span>
              <span className="text-[11px] font-mono text-cyan-300">ประจำเดือน</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-center font-mono">
              <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-2.5">
                <div className="text-[10px] text-cyan-400 uppercase">วันเริ่มต้น (Start)</div>
                <div className="text-lg font-black text-white">วันที่ {accessConfig.startDay}</div>
                <div className="text-[10px] text-slate-400">เวลา 00:00 น.</div>
              </div>
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-2.5">
                <div className="text-[10px] text-purple-400 uppercase">วันสิ้นสุด (End)</div>
                <div className="text-lg font-black text-white">วันที่ {accessConfig.endDay}</div>
                <div className="text-[10px] text-slate-400">เวลา 23:59 น.</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
              <span>วันที่ปัจจุบันของระบบ:</span>
              <span className="font-semibold text-slate-200">{currentDate}</span>
            </div>
          </div>

          {/* Admin Bypass Options & Quick Actions */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-3 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>ช่องทางพิเศษสำหรับผู้ดูแลระบบ (Admin 24/7 Master Access)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              ผู้ดูแลระบบสามารถเข้าสู่ระบบเพื่อแก้ไขข้อมูล หรือตรวจสอบเว็บในมุมมองพนักงานได้ตลอดเวลาแม้ระบบจะปิดอยู่
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                id="btn-admin-bypass-to-employee"
                type="button"
                onClick={() => {
                  playCyberClick();
                  if (isAdminLoggedIn && onBypassToEmployeeView) {
                    onBypassToEmployeeView();
                  } else {
                    setShowPinModal(true);
                  }
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Eye className="w-4 h-4 text-purple-400" />
                <span>ตรวจสอบในมุมมองพนักงาน</span>
              </button>

              <button
                id="btn-admin-go-backoffice"
                type="button"
                onClick={() => {
                  playCyberClick();
                  if (isAdminLoggedIn) {
                    onOpenAdminLogin();
                  } else {
                    setShowPinModal(true);
                  }
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>จัดการระบบ (Admin Backoffice)</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Admin PIN Login Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border-2 border-purple-500/40 bg-[#0B0F19] shadow-2xl relative">
            <button
              onClick={() => { playCyberClick(); setShowPinModal(false); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ยืนยันรหัสผ่านผู้ดูแลระบบ</h3>
                <p className="text-xs text-slate-400">Authorized Personnel Only</p>
              </div>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  รหัสผ่าน PIN สำหรับแอดมิน:
                </label>
                <input
                  id="input-closed-admin-pin"
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="กรอกรหัสผ่านผู้ดูแลระบบ"
                  className="w-full bg-slate-900/90 border border-purple-500/40 rounded-xl px-4 py-3 text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:border-purple-400"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  id="btn-closed-pin-submit"
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center text-xs text-slate-500 py-3 border-t border-slate-900 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • TEIJIN CORD (THAILAND) CO., LTD.</span>
        <span className="font-mono text-[11px] text-cyan-500/80">
          TCT ACADEMY
        </span>
      </footer>
    </div>
  );
};

