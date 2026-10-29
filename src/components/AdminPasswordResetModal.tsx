import React, { useState, useEffect } from 'react';
import { 
  X, 
  KeyRound, 
  CheckCircle2, 
  Clock, 
  User, 
  ShieldCheck, 
  RefreshCw, 
  Trash2, 
  Check, 
  AlertCircle,
  Phone,
  Send,
  Unlock
} from 'lucide-react';
import { 
  PasswordResetRequest, 
  getPasswordResetRequests, 
  resolvePasswordResetRequest,
  validateEmployeePassword,
  unlockEmployeeForPasswordReset
} from '../utils/passwordSecurity';
import { setEmployeePin, getEmployeePin } from '../data/traineeData';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';

interface AdminPasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRosterCleaned?: () => void;
}

export const AdminPasswordResetModal: React.FC<AdminPasswordResetModalProps> = ({
  isOpen,
  onClose
}) => {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<PasswordResetRequest | null>(null);
  const [newTempPassword, setNewTempPassword] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRequests(getPasswordResetRequests());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenResetAction = (req: PasswordResetRequest) => {
    playCyberClick();
    setSelectedReq(req);
    // Suggest default compliant temporary password: 5-digit empId + Abc@1
    const cleanId = req.empId.padStart(5, '0').slice(-5);
    setNewTempPassword(`${cleanId}Abc@1`);
  };

  const handleApplyReset = (clearOnly: boolean) => {
    if (!selectedReq) return;
    const cleanId = selectedReq.empId.trim().toUpperCase();

    if (clearOnly) {
      // Clear password so user sets first-time password upon next login
      localStorage.removeItem(`tct_pin_${cleanId}`);
      // Also update in pins map
      try {
        const raw = localStorage.getItem('tct_employee_pins_v1');
        if (raw) {
          const pins = JSON.parse(raw);
          delete pins[cleanId];
          localStorage.setItem('tct_employee_pins_v1', JSON.stringify(pins));
        }
      } catch (e) {}

      resolvePasswordResetRequest(selectedReq.id, 'แอดมินล้างรหัสผ่านเดิมเรียบร้อยแล้ว พนักงานสามารถตั้งรหัสใหม่ได้ทันที');
      playSuccessChime();
      setActionNotice(`ล้างรหัสผ่านของ ${selectedReq.fullName} เรียบร้อยแล้ว (พนักงานสามารถตั้งรหัสใหม่ในการเข้าครั้งถัดไป)`);
    } else {
      // Set temporary password
      const cleanPwd = newTempPassword.trim();
      const validation = validateEmployeePassword(cleanId, cleanPwd);
      if (!validation.isValid) {
        playErrorBuzz();
        alert(validation.errors[0] || 'รหัสผ่านต้องมีความยาว 10 ตัวอักษรและตรงตามเกณฑ์');
        return;
      }

      setEmployeePin(cleanId, cleanPwd);
      resolvePasswordResetRequest(selectedReq.id, `แอดมินกำหนดรหัสผ่านชั่วคราว: ${cleanPwd}`);
      playSuccessChime();
      setActionNotice(`ตั้งรหัสผ่านชั่วคราวให้ ${selectedReq.fullName} เป็น "${cleanPwd}" เรียบร้อยแล้ว`);
    }

    setRequests(getPasswordResetRequests());
    setSelectedReq(null);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleDirectUnlock = (req: PasswordResetRequest) => {
    playSuccessChime();
    unlockEmployeeForPasswordReset(req.empId);
    resolvePasswordResetRequest(req.id, 'ผู้ดูแลระบบปลดล็อกให้พนักงานตั้งรหัสผ่านใหม่เรียบร้อยแล้ว');
    setActionNotice(`🔓 ปลดล็อกบัญชีของ ${req.fullName} (${req.empId}) เรียบร้อยแล้ว! พนักงานสามารถเข้าสู่ระบบเพื่อตั้งรหัสใหม่และกรอกข้อมูลประวัติได้ทันที`);
    setRequests(getPasswordResetRequests());
    setSelectedReq(null);
    setTimeout(() => setActionNotice(null), 6000);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const resolvedRequests = requests.filter(r => r.status === 'resolved');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn font-sarabun text-slate-800">
      <div className="relative w-full max-w-[95vw] sm:max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-5 sm:p-6 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-[11px] font-bold border border-white/20">
                <KeyRound className="w-3.5 h-3.5" />
                <span>ADMIN SECURITY • PASSWORD RESET MANAGEMENT</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                จัดการคำขอรีเซ็ตรหัสผ่านพนักงาน
              </h2>
              <p className="text-xs text-slate-300">
                ตรวจสอบและแก้ไข/รีเซ็ตรหัสผ่านสำหรับพนักงานที่ลืมรหัสผ่าน
              </p>
            </div>

            <button
              onClick={() => {
                playCyberClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Notice Banner */}
        {actionNotice && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Selected Request Action Box */}
          {selectedReq && (
            <div className="p-4 bg-blue-50/80 rounded-2xl border-2 border-blue-300 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#005A9C]" />
                  <span>รีเซ็ตรหัสผ่านให้: {selectedReq.fullName} ({selectedReq.empId})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ยกเลิก
                </button>
              </div>

              <div className="space-y-1 text-slate-600">
                <div>แผนก: <strong>{selectedReq.department}</strong> | วันที่ขอ: {selectedReq.requestedAt}</div>
                {selectedReq.phoneOrContact && (
                  <div>เบอร์ติดต่อ: <strong>{selectedReq.phoneOrContact}</strong></div>
                )}
              </div>

              <div className="pt-2 border-t border-blue-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Clear password so employee sets anew */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800">ตัวเลือกที่ 1: ล้างรหัสผ่านให้ตั้งใหม่</div>
                    <p className="text-[11px] text-slate-500">
                      พนักงานจะเข้าสู่ระบบในฐานะผู้ใช้ใหม่ และตั้งรหัสผ่าน 10 หลักด้วยตนเอง
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyReset(true)}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer transition-colors"
                  >
                    ล้างรหัสผ่านให้ตั้งใหม่
                  </button>
                </div>

                {/* Option 2: Set compliant temporary password */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">ตัวเลือกที่ 2: กำหนดรหัสชั่วคราว</div>
                  <input
                    type="text"
                    value={newTempPassword}
                    onChange={(e) => setNewTempPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#005A9C]"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyReset(false)}
                    className="w-full py-2 px-3 rounded-lg bg-[#005A9C] hover:bg-[#004070] text-white font-bold text-xs cursor-pointer transition-colors"
                  >
                    บันทึกรหัสผ่านนี้
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pending Requests Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
              <span className="flex items-center gap-2">
                <span>คำขอรอดำเนินการ (Pending Requests)</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs">
                  {pendingRequests.length}
                </span>
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-500">
                ไม่มีคำขอรีเซ็ตรหัสผ่านที่ค้างอยู่
              </div>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map(req => (
                  <div key={req.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {req.fullName} <span className="font-mono text-slate-500 font-normal">({req.empId})</span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#003875] font-semibold">
                          แผนก {req.department}
                        </span>
                        <span>ขอเมื่อ: {req.requestedAt}</span>
                        {req.phoneOrContact && (
                          <span className="text-slate-700">ติดต่อ: {req.phoneOrContact}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleDirectUnlock(req)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                        title="ปลดล็อกบัญชีให้พนักงานสามารถเข้าสู่ระบบเพื่อตั้งรหัสผ่านใหม่ได้ทันที"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>ปลดล็อกให้ตั้งใหม่</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenResetAction(req)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border border-slate-300 transition-colors"
                      >
                        ตัวเลือกอื่น
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolved History Section */}
          {resolvedRequests.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="font-bold text-slate-700 text-xs">ประวัติการรีเซ็ตรหัสผ่านล่าสุด:</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {resolvedRequests.slice(0, 5).map(req => (
                  <div key={req.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                    <div>
                      <span className="font-bold text-slate-800">{req.fullName}</span> ({req.empId})
                      <div className="text-slate-400">{req.adminNote || 'รีเซ็ตแล้ว'} • {req.resolvedAt}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      เรียบร้อยแล้ว
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
