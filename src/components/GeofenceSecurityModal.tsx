import React, { useState } from 'react';
import { 
  MapPin, 
  ShieldAlert, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Lock,
  Building2,
  Navigation,
  KeyRound,
  X
} from 'lucide-react';
import { 
  TEIJIN_CORD_COORDS, 
  MAX_ALLOWED_DISTANCE_KM, 
  GeoLocationResult, 
  setAdminGeoBypass 
} from '../utils/geolocationSecurity';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';

interface GeofenceSecurityModalProps {
  isOpen: boolean;
  locationResult: GeoLocationResult | null;
  isChecking: boolean;
  onRecheck: () => void;
  onBypassApproved: () => void;
  onClose?: () => void;
}

const VALID_ADMIN_PINS = [
  '25056', 'TCTADMIN', 'ADMIN2026', 'TCTDEV', 'DEV2026', 
  'DEVELOPER999', 'ADMIN', 'TCT', '1234', '123456', 
  'SECRET', 'SUPERADMIN', 'TEIJIN', 'PASSWORD', 'ADMIN1234'
];

export const GeofenceSecurityModal: React.FC<GeofenceSecurityModalProps> = ({
  isOpen,
  locationResult,
  isChecking,
  onRecheck,
  onBypassApproved,
  onClose
}) => {
  const [showAdminBypass, setShowAdminBypass] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [bypassError, setBypassError] = useState('');

  if (!isOpen) return null;

  const distanceFormatted = locationResult?.distanceKm !== null && locationResult?.distanceKm !== undefined
    ? locationResult.distanceKm < 1
      ? `${(locationResult.distanceKm * 1000).toFixed(0)} เมตร`
      : `${locationResult.distanceKm.toFixed(2)} กิโลเมตร`
    : null;

  const handleAdminBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBypassError('');
    const clean = adminPin.trim().toUpperCase();
    if (!clean) {
      playErrorBuzz();
      setBypassError('กรุณากรอกรหัสผ่านผู้ดูแลระบบ');
      return;
    }

    if (VALID_ADMIN_PINS.includes(clean)) {
      playSuccessChime();
      setAdminGeoBypass(true);
      onBypassApproved();
    } else {
      playErrorBuzz();
      setBypassError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sarabun">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 text-white p-5 sm:p-6 text-center relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 shadow-inner border border-white/30">
            <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>ระบบความปลอดภัยในข้อมูลและหลักสูตร (Geofencing Security)</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            จำกัดการเข้าใช้งานเฉพาะในพื้นที่บริษัท
          </h3>
          <p className="text-xs text-rose-100 mt-1 max-w-sm mx-auto">
            บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-slate-700 text-sm">
          {/* Status Alert Box */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-rose-900">
                  {locationResult?.status === 'permission_denied'
                    ? 'ไม่อนุญาตการเข้าถึงตำแหน่ง GPS'
                    : locationResult?.status === 'outside_allowed_radius'
                    ? 'อยู่นอกพื้นที่รัศมีที่กำหนด (เกิน 1 กิโลเมตร)'
                    : 'ไม่สามารถยืนยันตำแหน่งที่ตั้งในปัจจุบันได้'}
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {locationResult?.errorMessage || 
                    `เพื่อความปลอดภัยของข้อมูลและหลักสูตรภายใน พนักงานจะสามารถเข้าใช้งานได้เฉพาะเมื่ออยู่ในรัศมีไม่เกิน ${MAX_ALLOWED_DISTANCE_KM} กิโลเมตร จากบริษัทเท่านั้น`}
                </p>
              </div>
            </div>

            {distanceFormatted && (
              <div className="mt-2 pt-2 border-t border-rose-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-600">ระยะห่างปัจจุบันจากบริษัท:</span>
                <span className="font-bold text-rose-700 text-sm">{distanceFormatted}</span>
              </div>
            )}
          </div>

          {/* Company Target Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Building2 className="w-4 h-4 text-[#005A9C]" />
              <span>{TEIJIN_CORD_COORDS.name}</span>
            </div>
            <div className="text-slate-500 flex items-center justify-between">
              <span>สถานที่ตั้ง: สวนอุตสาหกรรมโรจนะ พระนครศรีอยุธยา</span>
              <a
                href={TEIJIN_CORD_COORDS.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#005A9C] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>แผนที่บริษัท</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* How to solve guidance */}
          <div className="text-xs text-slate-500 space-y-1 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
            <div className="font-semibold text-amber-900 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-amber-600" />
              <span>คำแนะนำในการเข้าใช้งาน:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800">
              <li>เปิดใช้งาน GPS / Location บนอุปกรณ์มือถือหรือคอมพิวเตอร์</li>
              <li>กดยอมรับ "อนุญาต (Allow)" ให้เบราว์เซอร์เข้าถึงตำแหน่ง</li>
              <li>เข้าใช้งานขณะอยู่ภายในบริเวณโรงงาน Teijin Cord Thailand</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => {
                playCyberClick();
                onRecheck();
              }}
              disabled={isChecking}
              className="w-full py-3 px-4 rounded-xl bg-[#005A9C] hover:bg-[#004070] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'กำลังตรวจสอบตำแหน่ง GPS...' : 'ตรวจสอบตำแหน่งอีกครั้ง (Re-check GPS)'}</span>
            </button>

            {/* Admin Bypass Toggle */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowAdminBypass(!showAdminBypass)}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium underline cursor-pointer"
              >
                {showAdminBypass ? 'ซ่อนการปลดล็อกสำหรับแอดมิน' : 'สำหรับผู้ดูแลระบบ / ทดสอบระบบ (Admin Override)'}
              </button>
            </div>

            {/* Admin Override Form */}
            {showAdminBypass && (
              <form onSubmit={handleAdminBypassSubmit} className="mt-2 p-3 bg-slate-100 rounded-xl space-y-2 border border-slate-200 animate-fadeIn">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>ใส่รหัสผ่านผู้ดูแลระบบเพื่อยกเว้นการตรวจพิกัด (Admin Bypass)</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="รหัสผ่าน Admin..."
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    ปลดล็อก
                  </button>
                </div>
                {bypassError && (
                  <div className="text-[11px] text-red-600 font-semibold">{bypassError}</div>
                )}
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
