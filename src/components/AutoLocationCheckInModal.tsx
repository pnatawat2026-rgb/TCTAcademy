import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { 
  MapPin, 
  ShieldCheck, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  Radio, 
  Compass, 
  X,
  ExternalLink
} from 'lucide-react';
import { 
  checkUserLocationSecurity, 
  recordEmployeeLocationCheckIn, 
  formatDistanceThai, 
  TEIJIN_CORD_COORDS, 
  GeoLocationResult 
} from '../utils/geolocationSecurity';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';

interface AutoLocationCheckInModalProps {
  user: UserProfile;
  activeCourseId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AutoLocationCheckInModal: React.FC<AutoLocationCheckInModalProps> = ({
  user,
  activeCourseId = 'risk-management',
  isOpen,
  onClose
}) => {
  const [status, setStatus] = useState<'idle' | 'detecting' | 'success' | 'warning' | 'denied'>('idle');
  const [result, setResult] = useState<GeoLocationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<number | null>(null);
  const hasTriggeredRef = useRef(false);

  const performAutoCheckIn = async () => {
    setStatus('detecting');
    setErrorMessage('');

    try {
      const geoResult = await checkUserLocationSecurity(user.empId, activeCourseId);
      setResult(geoResult);

      if (geoResult.userCoords) {
        // Successfully detected coordinates
        try {
          await recordEmployeeLocationCheckIn({
            empId: user.empId,
            fullName: user.fullName,
            department: user.department,
            position: user.position,
            courseId: activeCourseId,
            courseTitle: 'TCT E-Training Onsite Check-In',
            coords: geoResult.userCoords,
            accuracyMeters: geoResult.accuracyMeters || 10,
            notes: geoResult.isAllowed ? 'เข้าใช้งานในพื้นที่โรงงาน TCT' : 'บันทึกพิกัดเข้าอบรม'
          });
        } catch (e) {
          console.debug('Checkin recorded in memory', e);
        }

        setStatus('success');
        playSuccessChime();

        // Mark session as verified so employee isn't bothered repeatedly
        try {
          sessionStorage.setItem('tct_session_location_checked', 'true');
        } catch (e) {}

        // Auto close after 2.5 seconds
        const timer = window.setTimeout(() => {
          onClose();
        }, 2500);
        setAutoAdvanceTimer(timer);
      } else {
        // No coordinates (denied or unsupported)
        if (geoResult.status === 'permission_denied') {
          setStatus('denied');
          setErrorMessage('กรุณากด "อนุญาต" (Allow) การเข้าถึงตำแหน่งที่ตั้งในเบราว์เซอร์ เพื่อแชร์พิกัด GPS');
        } else {
          setStatus('warning');
          setErrorMessage(geoResult.errorMessage || 'ระบบบันทึกการเข้าใช้งานเรียบร้อยแล้ว');
        }
      }
    } catch (err: any) {
      setStatus('warning');
      setErrorMessage('ระบบบันทึกการเข้าสู่ระบบเรียบร้อยแล้ว (ไม่สามารถเข้าถึงสัญญาณดาวเทียม)');
    }
  };

  useEffect(() => {
    if (isOpen && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      performAutoCheckIn();
    }

    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualProceed = () => {
    playCyberClick();
    if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    try {
      sessionStorage.setItem('tct_session_location_checked', 'true');
    } catch (e) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn font-sarabun text-slate-800 select-none">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleUp">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#001D3D] via-[#002D62] to-[#005A9C] text-white p-5 sm:p-6 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-300 text-[11px] font-bold border border-white/20 whitespace-nowrap">
                <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                <span>ระบบแชร์ตำแหน่ง GPS อัตโนมัติ</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>ยืนยันพิกัดเข้าสู่ระบบ</span>
              </h3>
              <p className="text-xs text-blue-100">
                ศูนย์ฝึกอบรม TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
              </p>
            </div>

            <button
              type="button"
              onClick={handleManualProceed}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
              title="ข้าม"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Employee Badge Summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-900">{user.fullName}</div>
              <div className="text-slate-500 text-[11px]">
                รหัส <strong className="font-mono text-[#005A9C]">{user.empId}</strong> • แผนก {user.department} {user.position ? `(${user.position})` : ''}
              </div>
            </div>
            <div className="px-2 py-1 rounded-lg bg-blue-50 text-[#003875] text-[10.5px] font-bold border border-blue-200">
              {user.division || 'ฝ่ายผลิต'}
            </div>
          </div>

          {/* Status Display */}
          {status === 'detecting' && (
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-center space-y-3">
              <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
                <div className="w-12 h-12 rounded-full bg-[#005A9C] flex items-center justify-center text-white shadow-md">
                  <Navigation className="w-6 h-6 animate-spin text-cyan-300" />
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">กำลังตรวจหาพิกัด GPS อัตโนมัติ...</div>
                <div className="text-xs text-slate-500 mt-1">
                  หากเบราว์เซอร์แจ้งเตือน กรุณากดปุ่ม <strong>"อนุญาต" (Allow)</strong> เพื่อบันทึกพิกัด
                </div>
              </div>
            </div>
          )}

          {status === 'success' && result?.userCoords && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-sm font-bold text-emerald-900">ตรวจพบและบันทึกพิกัดเรียบร้อยแล้ว</span>
              </div>

              <div className="p-2.5 bg-white/90 rounded-xl border border-emerald-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">พิกัดปัจจุบัน:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {result.userCoords.lat.toFixed(6)}, {result.userCoords.lng.toFixed(6)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ระยะห่างจาก TCT:</span>
                  <span className="font-bold text-emerald-700">
                    {formatDistanceThai(result.distanceKm)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">พื้นที่ตรวจพบ:</span>
                  <span className="font-semibold text-slate-700">
                    {result.distanceKm !== null && result.distanceKm <= 1.0 
                      ? 'ภายในโรงงาน สวนอุตสาหกรรมโรจนะ' 
                      : 'นอกพื้นที่โรงงาน (ได้รับอนุญาตเช็กอิน)'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-emerald-700 text-center font-medium">
                กำลังนำท่านเข้าสู่ระบบการเรียนรู้อัตโนมัติ...
              </div>
            </div>
          )}

          {status === 'denied' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2.5 animate-fadeIn">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-amber-900">รอการอนุญาตเปิดใช้งานตำแหน่ง (GPS)</div>
                  <div className="text-xs text-amber-800 mt-1 leading-relaxed">
                    เบราว์เซอร์ยังไม่ได้รับสิทธิ์เข้าถึง GPS ท่านสามารถกดปุ่มเปิดแชร์พิกัดอีกครั้ง หรือกดเข้าสู่ระบบได้ทันที
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={performAutoCheckIn}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>ลองขอพิกัด GPS อีกครั้ง</span>
              </button>
            </div>
          )}

          {status === 'warning' && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#005A9C] shrink-0" />
                <span className="text-sm font-bold text-[#002855]">บันทึกการเข้าสู่ระบบเรียบร้อย</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {errorMessage || 'ระบบบันทึกเวลาการเข้าใช้งานของท่านเข้าสู่ฐานข้อมูลศูนย์ฝึกอบรม TCT แล้ว'}
              </p>
            </div>
          )}

          {/* Teijin Cord Official Coordinates Info */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>พิกัดศูนย์ฝึกอบรม TCT (โรจนะ พระนครศรีอยุธยา)</span>
            </div>
            <div className="font-mono text-slate-500">
              14.3380539, 100.6279692 (สวนอุตสาหกรรมโรจนะ 1/1 หมู่ 5 ต.คานหาม)
            </div>
          </div>

          {/* Action Button: 1-click clean entry */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleManualProceed}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#002855] via-[#003875] to-[#005A9C] hover:from-[#001D3D] hover:to-[#004070] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-98"
            >
              <span>เข้าสู่ระบบการเรียนรู้ทันที</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
