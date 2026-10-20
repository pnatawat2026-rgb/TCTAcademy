import React, { useState } from 'react';
import { 
  SystemAccessConfig, 
  getSystemAccessConfig, 
  saveSystemAccessConfig, 
  checkTraineeAccessStatus 
} from '../utils/accessControl';
import { 
  Power, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Settings2, 
  Save, 
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  Radio,
  Sliders,
  Info
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { addStoredAuditLog } from '../data/traineeData';

interface SystemAccessSettingsProps {
  onConfigChanged?: (newConfig: SystemAccessConfig) => void;
}

export const SystemAccessSettings: React.FC<SystemAccessSettingsProps> = ({ onConfigChanged }) => {
  const [config, setConfig] = useState<SystemAccessConfig>(() => getSystemAccessConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentAccessStatus = checkTraineeAccessStatus(config);
  const now = new Date();
  const currentDay = now.getDate();
  const currentDateStr = now.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleToggleMasterPower = (enable: boolean) => {
    playCyberClick();
    const updated: SystemAccessConfig = {
      ...config,
      isEnabled: enable
    };
    setConfig(updated);
    saveSystemAccessConfig(updated);
    if (onConfigChanged) onConfigChanged(updated);
    
    addStoredAuditLog({
      empId: 'ADMIN',
      action: 'profile_updated',
      detail: `ผู้ดูแลระบบเปลี่ยนสถานะระบบเป็น: ${enable ? 'เปิดใช้งาน (ON)' : 'ปิดการใช้งาน (OFF)'}`
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    playSuccessChime();
    saveSystemAccessConfig(config);
    if (onConfigChanged) onConfigChanged(config);

    addStoredAuditLog({
      empId: 'ADMIN',
      action: 'profile_updated',
      detail: `อัปเดตการตั้งค่าการเข้าถึง: วันที่ ${config.startDay} - ${config.endDay} (สถานะ: ${config.isEnabled ? 'ON' : 'OFF'})`
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    playCyberClick();
    const def: SystemAccessConfig = {
      isEnabled: true,
      useDateRestriction: true,
      startDate: '2026-08-24',
      endDate: '2026-08-28',
      startDay: 24,
      endDay: 28,
      mode: 'date_window',
      closedMessage: 'ระบบฝึกอบรม TCT E-Training เปิดให้เข้าใช้งานเฉพาะช่วงวันที่ 24 ถึง 28 เท่านั้น หากต้องการใช้งานเพิ่มเติมกรุณาติดต่อผู้ดูแลระบบ TCT ACADEMY'
    };
    setConfig(def);
    saveSystemAccessConfig(def);
    if (onConfigChanged) onConfigChanged(def);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 font-sarabun text-slate-800">
      
      {/* 1. Quick Master Switch Card */}
      <div className={`rounded-3xl p-6 sm:p-7 border transition-all shadow-md relative overflow-hidden bg-white ${
        config.isEnabled 
          ? 'border-emerald-300 ring-2 ring-emerald-500/10' 
          : 'border-rose-300 ring-2 ring-rose-500/10'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md shrink-0 transition-all ${
              config.isEnabled
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-rose-500 text-white shadow-rose-500/20'
            }`}>
              <Power className={`w-8 h-8 transition-transform ${
                config.isEnabled ? 'scale-110' : ''
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  config.isEnabled 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-rose-50 text-rose-700 border-rose-300'
                }`}>
                  {config.isEnabled ? 'SYSTEM STATUS: ONLINE (ON)' : 'SYSTEM STATUS: OFFLINE (OFF)'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Master Switch
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                สวิตช์ควบคุมการเปิด/ปิดระบบ (Admin Master Control)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                แอดมินสามารถเปิดหรือปิดระบบสำหรับผู้เรียนได้ทันทีโดยไม่ต้องแก้ไขโค้ด (แอดมินยังเข้าหลังบ้านได้ตลอดเวลา)
              </p>
            </div>
          </div>

          {/* Big ON / OFF Toggle Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              id="admin-switch-btn-on"
              type="button"
              onClick={() => handleToggleMasterPower(true)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-sm ${
                config.isEnabled
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400 font-extrabold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
              }`}
            >
              <Unlock className="w-4 h-4" />
              <span>เปิดระบบ (ON)</span>
            </button>

            <button
              id="admin-switch-btn-off"
              type="button"
              onClick={() => handleToggleMasterPower(false)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-sm ${
                !config.isEnabled
                  ? 'bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-400 font-extrabold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>ปิดระบบ (OFF)</span>
            </button>
          </div>

        </div>

        {/* Live Diagnostics Pill */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">สถานะการเข้าถึงสำหรับผู้เรียนขณะนี้:</span>
            {currentAccessStatus.isAllowed ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ผู้เรียนเข้าทำแบบทดสอบได้ตามปกติ
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                ระบบถูกล็อคสำหรับผู้เรียน ({currentAccessStatus.details})
              </span>
            )}
          </div>

          <div className="text-slate-500 font-mono text-xs">
            วันที่ปัจจุบัน: <span className="text-[#002D5A] font-bold">{currentDateStr}</span> (วันที่ {currentDay})
          </div>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-800 flex items-center justify-between animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>บันทึกการตั้งค่าระบบและอัปเดตสถานะการเข้าถึงเรียบร้อยแล้ว</span>
          </div>
          <button onClick={() => setSaveSuccess(false)} className="text-slate-500 hover:text-slate-700 cursor-pointer font-bold">
            ปิด
          </button>
        </div>
      )}

      {/* 2. Detailed Configuration Form */}
      <form onSubmit={handleSaveConfig} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                ตั้งค่าช่วงเวลาเปิดระบบฝึกอบรม (Date & Time Window Schedule)
              </h3>
              <p className="text-xs text-slate-500">
                กำหนดวันที่เปิดให้เข้าอบรมอัตโนมัติ (เช่น วันที่ 24 ถึง 28 ของทุกเดือน หรือระบุช่วงวันที่ชัดเจน)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>คืนค่าเริ่มต้น (24-28)</span>
          </button>
        </div>

        {/* Setting Options */}
        <div className="space-y-4">
          
          {/* Checkbox: Enforce Date Window */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.useDateRestriction}
                onChange={(e) => setConfig({ ...config, useDateRestriction: e.target.checked })}
                className="mt-1 w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <div className="text-sm font-bold text-slate-900">
                  จำกัดการเข้าใช้งานเฉพาะช่วงวันที่กำหนด (Enforce Date Range: 24 - 28)
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  เมื่อเปิดใช้งาน ผู้เรียนจะเข้าได้เฉพาะช่วงวันที่กำหนดเท่านั้น หากอยู่นอกช่วงเวลา ระบบจะแสดงหน้าแจ้งเตือนพร้อมเหตุผล
                </div>
              </div>
            </label>

            {config.useDateRestriction && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    วันเริ่มต้นเปิดระบบ (Start Day of Month)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={config.startDay}
                      onChange={(e) => setConfig({ ...config, startDay: parseInt(e.target.value) || 24 })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      ของเดือน (00:00 น.)
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    วันสิ้นสุดปิดระบบ (End Day of Month)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={config.endDay}
                      onChange={(e) => setConfig({ ...config, endDay: parseInt(e.target.value) || 28 })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      ของเดือน (23:59 น.)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Custom Notification Message */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              ข้อความแจ้งเตือนเมื่อระบบอยู่นอกช่วงเวลาทำการ (Closed Notice Message)
            </label>
            <textarea
              rows={3}
              value={config.closedMessage}
              onChange={(e) => setConfig({ ...config, closedMessage: e.target.value })}
              placeholder="กรอกข้อความที่ต้องการแจ้งผู้เรียนเมื่อระบบปิด..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-slate-500 font-medium">พรีเซ็ตด่วน:</span>
            <button
              type="button"
              onClick={() => {
                playCyberClick();
                setConfig({ ...config, isEnabled: true, useDateRestriction: true, startDay: 24, endDay: 28 });
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold border border-blue-200 cursor-pointer transition-colors"
            >
              เปิดวันที่ 24-28 (มาตรฐาน)
            </button>
            <button
              type="button"
              onClick={() => {
                playCyberClick();
                setConfig({ ...config, isEnabled: true, useDateRestriction: false });
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 cursor-pointer transition-colors"
            >
              เปิดตลอดเวลา (Unlimited)
            </button>
            <button
              type="button"
              onClick={() => {
                playCyberClick();
                setConfig({ ...config, isEnabled: false });
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold border border-rose-200 cursor-pointer transition-colors"
            >
              ปิดระบบชั่วคราว (Maintenance)
            </button>
          </div>

        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            id="admin-save-system-settings-btn"
            className="bg-[#002D5A] hover:bg-[#001f3f] text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md shadow-blue-900/10 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่า (Save Settings)</span>
          </button>
        </div>

      </form>

      {/* Info card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 space-y-1.5 shadow-2xs">
        <div className="font-bold text-blue-900 flex items-center gap-2 text-sm">
          <Info className="w-4 h-4 text-blue-700 shrink-0" />
          <span>หมายเหตุการควบคุมความปลอดภัย:</span>
        </div>
        <p className="leading-relaxed text-slate-600 pl-6">
          • ผู้ดูแลระบบ (Admin) สามารถเข้าสู่ระบบด้วยรหัสผ่านได้ตลอดเวลาแม้ระบบจะถูกปิด (OFF) หรืออยู่นอกช่วงวันที่ 24-28<br />
          • ผู้เรียนที่กำลังทำข้อสอบค้างอยู่ หากกดส่งคะแนนก่อนวันสิ้นสุด ผลการเรียนจะถูกบันทึกลงในระบบอย่างสมบูรณ์<br />
          • ข้อมูลการเปิด/ปิดจะถูกบันทึกลงใน Audit Log ของระบบเพื่อความโปร่งใส
        </p>
      </div>

    </div>
  );
};
