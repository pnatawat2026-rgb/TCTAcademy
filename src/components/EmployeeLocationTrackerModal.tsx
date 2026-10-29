import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Navigation,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Search,
  Filter,
  Download,
  QrCode,
  Compass,
  Radio,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
  Lock,
  X,
  Smartphone,
  ChevronRight,
  Printer
} from 'lucide-react';
import {
  TEIJIN_CORD_COORDS,
  MAX_ALLOWED_DISTANCE_KM,
  MAX_ALLOWED_DISTANCE_METERS,
  FACTORY_PRESET_LOCATIONS,
  checkUserLocationSecurity,
  formatDistanceThai,
  fetchLocationCheckIns,
  recordEmployeeLocationCheckIn,
  GeoLocationResult,
  Coordinates,
  calculateDistanceKm
} from '../utils/geolocationSecurity';
import { EmployeeLocationCheckIn, UserProfile } from '../types';
import { MASTER_EMPLOYEE_ROSTER_230 } from '../data/employeeDatabase';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';

interface EmployeeLocationTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onCheckInSuccess?: (checkIn: EmployeeLocationCheckIn) => void;
}

export const EmployeeLocationTrackerModal: React.FC<EmployeeLocationTrackerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCheckInSuccess
}) => {
  // Navigation tabs inside modal: 'live_checkin' | 'inspection_log' | 'radar_map'
  const [activeTab, setActiveTab] = useState<'live_checkin' | 'inspection_log' | 'radar_map'>('live_checkin');

  // GPS state
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [geoResult, setGeoResult] = useState<GeoLocationResult | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(''); // empty string = real device GPS

  // Check-in Form States
  const [empIdInput, setEmpIdInput] = useState<string>(currentUser?.empId || '');
  const [empFullName, setEmpFullName] = useState<string>(currentUser?.fullName || '');
  const [empDept, setEmpDept] = useState<string>(currentUser?.department || 'P');
  const [empPosition, setEmpPosition] = useState<string>(currentUser?.position || 'OPERATOR');
  const [selectedCourse, setSelectedCourse] = useState<string>('ทักษะการเป็นพนักงานที่ดี (Good Employee Skills)');
  const [notesInput, setNotesInput] = useState<string>('เช็คอินเข้าอบรมและปฏิบัติงานประจำวัน');

  // Check-in action states
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState<boolean>(false);
  const [latestCheckIn, setLatestCheckIn] = useState<EmployeeLocationCheckIn | null>(null);
  const [showSuccessSlip, setShowSuccessSlip] = useState<boolean>(false);

  // Inspection Logs Table states
  const [checkInLogs, setCheckInLogs] = useState<EmployeeLocationCheckIn[]>([]);
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [logFilterDept, setLogFilterDept] = useState<string>('all');
  const [logFilterStatus, setLogFilterStatus] = useState<string>('all');

  // Auto-detect employee name from roster when ID changes
  useEffect(() => {
    if (empIdInput.trim()) {
      const clean = empIdInput.trim().toUpperCase();
      const match = MASTER_EMPLOYEE_ROSTER_230.find(
        (e) => e.empId.trim().toUpperCase() === clean
      );
      if (match) {
        setEmpFullName(match.fullName);
        setEmpDept(match.department);
        setEmpPosition(match.position);
      }
    }
  }, [empIdInput]);

  // Sync with currentUser
  useEffect(() => {
    if (currentUser) {
      setEmpIdInput(currentUser.empId || '');
      setEmpFullName(currentUser.fullName || '');
      setEmpDept(currentUser.department || 'P');
      setEmpPosition(currentUser.position || 'OPERATOR');
    }
  }, [currentUser]);

  // Initial GPS location fetch on open
  useEffect(() => {
    if (isOpen) {
      handleRefreshLocation();
      loadCheckInLogs();
    }
  }, [isOpen]);

  const loadCheckInLogs = async () => {
    try {
      const logs = await fetchLocationCheckIns();
      setCheckInLogs(logs);
    } catch (e) {
      console.error('Error fetching logs', e);
    }
  };

  const handleRefreshLocation = async (presetId?: string) => {
    setIsLocating(true);
    playCyberClick();
    try {
      const res = await checkUserLocationSecurity(presetId || selectedPresetId || undefined);
      setGeoResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLocating(false);
    }
  };

  const handlePresetSelect = (id: string) => {
    setSelectedPresetId(id);
    handleRefreshLocation(id);
  };

  const handleUseRealDeviceGps = () => {
    setSelectedPresetId('');
    handleRefreshLocation('');
  };

  // Perform Location Check-in
  const handlePerformCheckIn = async () => {
    if (!empIdInput.trim()) {
      playErrorBuzz();
      alert('กรุณาระบุรหัสพนักงาน');
      return;
    }

    const currentCoords: Coordinates = geoResult?.userCoords || {
      lat: TEIJIN_CORD_COORDS.lat,
      lng: TEIJIN_CORD_COORDS.lng
    };

    setIsSubmittingCheckIn(true);
    playCyberClick();

    try {
      const recorded = await recordEmployeeLocationCheckIn({
        empId: empIdInput.trim().toUpperCase(),
        fullName: empFullName || empIdInput.trim().toUpperCase(),
        department: empDept,
        position: empPosition,
        courseTitle: selectedCourse,
        coords: currentCoords,
        accuracyMeters: geoResult?.accuracyMeters || 5,
        notes: notesInput
      });

      playSuccessChime();
      setLatestCheckIn(recorded);
      setShowSuccessSlip(true);
      onCheckInSuccess?.(recorded);

      // Refresh log table
      await loadCheckInLogs();
    } catch (e) {
      playErrorBuzz();
      console.error('Check-in failed', e);
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  // Filtered check-in logs
  const filteredLogs = useMemo(() => {
    return checkInLogs.filter((log) => {
      const q = logSearchQuery.trim().toLowerCase();
      const matchQ =
        !q ||
        log.empId.toLowerCase().includes(q) ||
        log.fullName.toLowerCase().includes(q) ||
        (log.courseTitle && log.courseTitle.toLowerCase().includes(q)) ||
        (log.notes && log.notes.toLowerCase().includes(q));

      const matchDept = logFilterDept === 'all' || log.department === logFilterDept;
      const matchStatus = logFilterStatus === 'all' || log.status === logFilterStatus;

      return matchQ && matchDept && matchStatus;
    });
  }, [checkInLogs, logSearchQuery, logFilterDept, logFilterStatus]);

  // Export CSV
  const handleExportCsv = () => {
    playCyberClick();
    if (filteredLogs.length === 0) return;

    const headers = ['ลำดับ', 'เวลาเช็คอิน', 'รหัสพนักงาน', 'ชื่อ-นามสกุล', 'แผนก', 'ตำแหน่ง', 'หลักสูตร', 'ละติจูด (Lat)', 'ลองจิจูด (Lng)', 'ระยะห่างโรงงาน (ม.)', 'สถานะความปลอดภัย', 'รหัสตรวจสอบ QR'];
    const rows = filteredLogs.map((item, idx) => [
      idx + 1,
      `"${item.displayTime}"`,
      `"${item.empId}"`,
      `"${item.fullName}"`,
      `"${item.department}"`,
      `"${item.position || ''}"`,
      `"${item.courseTitle || ''}"`,
      item.lat,
      item.lng,
      item.distanceMeters,
      `"${item.statusLabelTh}"`,
      `"${item.qrHash || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TCT_Employee_Location_CheckIns_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const currentDistM = geoResult?.distanceMeters ?? 0;
  const isInsideAllowed = geoResult?.isAllowed ?? (currentDistM <= MAX_ALLOWED_DISTANCE_METERS);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sarabun text-slate-800">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0 shadow-inner">
              <MapPin className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  GPS GEOFENCING SECURITY • 1.0 KM
                </span>
                <span className="text-[10px] text-slate-400">
                  สวนอุตสาหกรรมโรจนะ พระนครศรีอยุธยา
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>ระบบตรวจสอบโลเคชั่นพนักงาน</span>
                <span className="text-xs font-normal text-slate-300 hidden sm:inline">
                  (Employee Location Attendance & Verification)
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={TEIJIN_CORD_COORDS.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="เปิดพิกัดบริษัทบน Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Maps</span>
            </a>
            <button
              onClick={() => { playCyberClick(); onClose(); }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector Ribbon */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => { playCyberClick(); setActiveTab('live_checkin'); }}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'live_checkin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>เช็คอินตำแหน่ง & พิกัดเรียลไทม์</span>
            </button>

            <button
              type="button"
              onClick={() => { playCyberClick(); setActiveTab('radar_map'); }}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'radar_map'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>แผนผังเรดาร์ & รัศมีโรงงาน (1 กม.)</span>
            </button>

            <button
              type="button"
              onClick={() => { playCyberClick(); setActiveTab('inspection_log'); }}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'inspection_log'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-500" />
              <span>ประวัติการตรวจสอบ ({checkInLogs.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleRefreshLocation()}
              disabled={isLocating}
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">รีเฟรช GPS</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: Live Check-in & GPS Status */}
          {activeTab === 'live_checkin' && (
            <div className="space-y-6">

              {/* Status Alert Banner */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isInsideAllowed
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isInsideAllowed
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-sm'
                        : 'bg-rose-100 border-rose-300 text-rose-700 shadow-sm animate-pulse'
                    }`}>
                      {isInsideAllowed ? (
                        <CheckCircle2 className="w-7 h-7" />
                      ) : (
                        <ShieldAlert className="w-7 h-7" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isInsideAllowed
                            ? 'bg-emerald-200/80 border-emerald-400 text-emerald-900'
                            : 'bg-rose-200/80 border-rose-400 text-rose-900'
                        }`}>
                          {isInsideAllowed ? '✓ อยู่ในรัศมีที่อนุญาต (< 1.0 กม.)' : '✕ อยู่นอกพื้นที่โรงงาน (> 1.0 กม.)'}
                        </span>
                        {geoResult?.isSimulation && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-100 border border-cyan-300 text-cyan-800">
                            จำลอง: {geoResult.presetName}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {isInsideAllowed
                          ? 'พิกัด GPS ถูกต้อง • ผ่านการตรวจสอบตามมาตรฐานความปลอดภัย'
                          : 'ตรวจพบพิกัดอยู่นอกพื้นที่โรงงาน เทยิน คอร์ด (ประเทศไทย) จำกัด'}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {isInsideAllowed
                          ? `ระยะห่างจากศูนย์กลางโรงงาน: ${formatDistanceThai(geoResult?.distanceKm)} (เกณฑ์กำหนดไม่เกิน 1,000 เมตร) สามารถบันทึกเวลาเรียนได้`
                          : `ระยะห่างปัจจุบัน: ${formatDistanceThai(geoResult?.distanceKm)} (เกินกำหนด ${Math.max(0, currentDistM - 1000)} เมตร) กรุณาเชื่อมต่อในพื้นที่บริษัท`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <a
                      href={TEIJIN_CORD_COORDS.directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      <span>นำทาง Google Maps</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* 3-Column GPS Telemetry Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Coordinates */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-600" />
                    <span>พิกัดละติจูด / ลองจิจูด</span>
                  </div>
                  <div className="text-base font-black font-mono text-slate-900">
                    {geoResult?.userCoords
                      ? `${geoResult.userCoords.lat.toFixed(6)}, ${geoResult.userCoords.lng.toFixed(6)}`
                      : '14.338054, 100.627969'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    จุดอ้างอิง: สวนอุตสาหกรรมโรจนะ เฟส 1
                  </div>
                </div>

                {/* 2. Distance */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ระยะห่างจากศูนย์กลางโรงงาน</span>
                  </div>
                  <div className="text-base font-black font-mono text-slate-900">
                    {formatDistanceThai(geoResult?.distanceKm)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    รัศมีเกณฑ์ปลอดภัย: ไม่เกิน 1.0 กม.
                  </div>
                </div>

                {/* 3. Accuracy & Time */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>ความแม่นยำ & เวลาตรวจสอบ</span>
                  </div>
                  <div className="text-base font-black font-mono text-slate-900">
                    ± {geoResult?.accuracyMeters || 4} เมตร
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {new Date().toLocaleTimeString('th-TH')} น.
                  </div>
                </div>
              </div>

              {/* Simulation Location Presets for Testing */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">
                      สลับโหมดพิกัด: ตรวจจากเซ็นเซอร์จริง หรือ จำลองจุดตรวจในโรงงาน
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseRealDeviceGps}
                    className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedPresetId === ''
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    📡 ใช้ GPS จริงจากอุปกรณ์
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FACTORY_PRESET_LOCATIONS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedPresetId === preset.id
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-950 ring-2 ring-indigo-400/30'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold truncate">{preset.nameTh}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          preset.isInsideGeofence
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {preset.isInsideGeofence ? '< 1 กม.' : '> 1 กม.'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {preset.descriptionTh}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Check-in Action Form */}
              <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        บันทึกการเช็คอินตำแหน่งพนักงาน (Employee Attendance & GPS Verification)
                      </h4>
                      <p className="text-xs text-slate-500">
                        ข้อมูลพิกัดจะถูกผูกกับรหัสพนักงานและประวัติการฝึกอบรมในฐานข้อมูลส่วนกลาง
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Emp ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      รหัสพนักงาน (Emp ID) *
                    </label>
                    <input
                      type="text"
                      value={empIdInput}
                      onChange={(e) => setEmpIdInput(e.target.value.toUpperCase())}
                      placeholder="เช่น 003290"
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อ-นามสกุลพนักงาน
                    </label>
                    <input
                      type="text"
                      value={empFullName}
                      onChange={(e) => setEmpFullName(e.target.value)}
                      placeholder="นาย/น.ส. ชื่อ สกุล"
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Dept */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      แผนก (Department)
                    </label>
                    <select
                      value={empDept}
                      onChange={(e) => setEmpDept(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    >
                      <option value="P">P - ฝ่ายผลิต (Production)</option>
                      <option value="PS">PS - แผนกบุคคลและธุรการ (Personnel)</option>
                      <option value="ESH">ESH - ความปลอดภัยและสิ่งแวดล้อม (Safety)</option>
                      <option value="PU">PU - แผนกจัดซื้อและคลังสินค้า (Purchasing)</option>
                      <option value="ENG">ENG - วิศวกรรมและซ่อมบำรุง (Engineering)</option>
                      <option value="QC">QC - ควบคุมคุณภาพ (Quality Control)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Course */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      หลักสูตรฝึกอบรมที่เข้าเรียน
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    >
                      <option value="ทักษะการเป็นพนักงานที่ดี (Good Employee Skills: TCT-GES-01)">
                        ทักษะการเป็นพนักงานที่ดี (Good Employee Skills: TCT-GES-01)
                      </option>
                      <option value="จิตวิทยาประยุกต์ในการทำงาน (Applied Psychology: TCT-PSY-01)">
                        จิตวิทยาประยุกต์ในการทำงาน (Applied Psychology: TCT-PSY-01)
                      </option>
                      <option value="การบำรุงรักษาเชิงป้องกันชั้นสูง (Preventive Maintenance: TCT-PM-01)">
                        การบำรุงรักษาเชิงป้องกันชั้นสูง (Preventive Maintenance: TCT-PM-01)
                      </option>
                      <option value="KYT การหยั่งรู้ระวังภัย 4 ขั้นตอน (KYT Safety: TCT-KYT-01)">
                        KYT การหยั่งรู้ระวังภัย 4 ขั้นตอน (KYT Safety: TCT-KYT-01)
                      </option>
                      <option value="ปฐมนิเทศพนักงานใหม่ & กฎระเบียบความปลอดภัย">
                        ปฐมนิเทศพนักงานใหม่ & กฎระเบียบความปลอดภัย
                      </option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      หมายเหตุการเช็คอิน
                    </label>
                    <input
                      type="text"
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="เช่น อบรมรอบเช้า, เข้ากะ M, ห้องฝึกอบรม"
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Submit Checkin Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ระบบบันทึกเวลา พิกัด และออกรหัส Digital Check-in Pass ทันที</span>
                  </div>

                  <button
                    type="button"
                    onClick={handlePerformCheckIn}
                    disabled={isSubmittingCheckIn}
                    className="w-full sm:w-auto h-11 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    {isSubmittingCheckIn ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    <span>ยืนยันบันทึกการเช็คอินตำแหน่งพนักงาน</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Digital Check-in Success Slip Card */}
              {showSuccessSlip && latestCheckIn && (
                <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border-2 border-emerald-500/40 shadow-xl space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/30 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                          OFFICIAL DIGITAL ATTENDANCE PASS
                        </div>
                        <h4 className="text-base font-bold text-white">
                          บัตรยืนยันการเช็คอินตำแหน่งสำเร็จ • TCT Academy
                        </h4>
                      </div>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold">
                      {latestCheckIn.qrHash}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400">ชื่อพนักงาน:</div>
                      <div className="font-bold text-white text-sm">{latestCheckIn.fullName}</div>
                      <div className="text-slate-400 font-mono">ID: {latestCheckIn.empId}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">แผนก / ตำแหน่ง:</div>
                      <div className="font-bold text-white">{latestCheckIn.department} - {latestCheckIn.position}</div>
                      <div className="text-emerald-300">{latestCheckIn.statusLabelTh}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">เวลาที่บันทึก:</div>
                      <div className="font-bold text-white">{latestCheckIn.displayTime}</div>
                      <div className="text-slate-400">ระยะห่าง: {latestCheckIn.distanceMeters} เมตร</div>
                    </div>
                    <div>
                      <div className="text-slate-400">พิกัด GPS ที่ตรวจสอบ:</div>
                      <div className="font-mono text-cyan-300">{latestCheckIn.lat}, {latestCheckIn.lng}</div>
                      <div className="text-slate-400">ความแม่นยำ: ±{latestCheckIn.accuracyMeters}m</div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[11px] text-slate-400">
                    <span>รับรองโดย ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
                    <button
                      type="button"
                      onClick={() => setShowSuccessSlip(false)}
                      className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
                    >
                      ปิดการแสดงบัตร
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Radar Map & Visual Geofence */}
          {activeTab === 'radar_map' && (
            <div className="space-y-5">
              <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 text-white space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                      VISUAL GEOFENCE RADAR SIMULATOR
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      แผนผังแสดงรัศมีปลอดภัย 1.0 กิโลเมตร รอบโรงงาน TCT
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={TEIJIN_CORD_COORDS.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-3 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-400/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>เปิดดูบน Google Maps จริง</span>
                    </a>
                  </div>
                </div>

                {/* SVG Radar Visualizer */}
                <div className="relative w-full aspect-video max-h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  
                  {/* Grid Lines */}
                  <svg className="w-full h-full absolute inset-0 opacity-40 pointer-events-none">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14, 165, 233, 0.2)" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {/* Concentric Geofence Rings */}
                  <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-cyan-500/30 flex items-center justify-center">
                    
                    {/* Outer Ring: 1.0 km Geofence (Allowed Boundary) */}
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-400/60 bg-emerald-950/10 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center">
                      <span className="absolute top-2 text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-400/40">
                        1,000 เมตร (1.0 km) ขอบเขตปลอดภัย Geofence
                      </span>
                    </div>

                    {/* Middle Ring: 500 meters */}
                    <div className="absolute w-44 h-44 rounded-full border border-cyan-400/40 flex items-center justify-center">
                      <span className="absolute top-1 text-[9px] font-mono text-cyan-400 bg-slate-950/80 px-1.5 py-0.2 rounded">
                        500 เมตร
                      </span>
                    </div>

                    {/* Inner Ring: 100 meters */}
                    <div className="absolute w-20 h-20 rounded-full border border-cyan-400/50" />

                    {/* Factory Center Target: Teijin Cord Thailand */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/30 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse">
                        <Building2 className="w-5 h-5 text-cyan-200" />
                      </div>
                      <span className="mt-1 text-[10px] font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-400/40 whitespace-nowrap">
                        บ. เทยิน คอร์ด (ประเทศไทย)
                      </span>
                    </div>

                    {/* Dynamic Employee Pin Position */}
                    {geoResult && (
                      <div 
                        className="absolute z-20 transition-all duration-700 flex flex-col items-center"
                        style={{
                          transform: isInsideAllowed 
                            ? 'translate(60px, -50px)' 
                            : 'translate(130px, -120px)'
                        }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg animate-bounce ${
                          isInsideAllowed 
                            ? 'bg-emerald-500 text-white border-white' 
                            : 'bg-rose-600 text-white border-white'
                        }`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow border whitespace-nowrap ${
                          isInsideAllowed
                            ? 'bg-emerald-950 text-emerald-200 border-emerald-400'
                            : 'bg-rose-950 text-rose-200 border-rose-400'
                        }`}>
                          คุณอยู่ที่นี่ ({formatDistanceThai(geoResult.distanceKm)})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Top-Left Info Tag */}
                  <div className="absolute top-3 left-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 text-xs space-y-0.5 backdrop-blur-sm">
                    <div className="text-[10px] font-mono text-slate-400">พิกัดศูนย์กลางโรงงาน TCT</div>
                    <div className="font-bold text-cyan-300 font-mono">14.3380539, 100.6279692</div>
                    <div className="text-[10px] text-slate-300">สวนอุตสาหกรรมโรจนะ จ.อยุธยา</div>
                  </div>

                  {/* Bottom-Right Compass Widget */}
                  <div className="absolute bottom-3 right-3 bg-slate-900/90 p-2 rounded-xl border border-slate-700 text-center">
                    <Compass className="w-6 h-6 text-cyan-400 mx-auto animate-spin" style={{ animationDuration: '20s' }} />
                    <span className="text-[9px] font-mono text-slate-400">N 0°</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <strong className="text-white block mb-0.5">📌 ทำไมต้องกำหนดพิกัด 1.0 กิโลเมตร?</strong>
                    <span>เพื่อรักษามาตรฐานความปลอดภัยและมั่นใจว่าผู้เข้ารับการอบรมอยู่ในพื้นที่โรงงาน เทยิน คอร์ด (ประเทศไทย) จำกัด ตามข้อกำหนดของแผนกบุคคลและธุรการ (PS)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <strong className="text-white block mb-0.5">🔒 มาตรการด้านความปลอดภัยของข้อมูล</strong>
                    <span>ระบบจะดึงพิกัดเฉพาะช่วงเวลาที่กดเช็คอินเข้าฝึกอบรมเท่านั้น ไม่มีการติดตามพิกัดส่วนตัวภายนอกเวลาอบรมตามนโยบาย PDPA</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Inspection Log Table */}
          {activeTab === 'inspection_log' && (
            <div className="space-y-4">
              
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    placeholder="ค้นหาด้วยรหัสพนักงาน, ชื่อ, หรือหลักสูตร..."
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={logFilterDept}
                    onChange={(e) => setLogFilterDept(e.target.value)}
                    className="h-9 px-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  >
                    <option value="all">ทุกแผนก (All Depts)</option>
                    <option value="P">แผนก P (ฝ่ายผลิต)</option>
                    <option value="PS">แผนก PS (บุคคล)</option>
                    <option value="ESH">แผนก ESH (ความปลอดภัย)</option>
                    <option value="PU">แผนก PU (จัดซื้อ)</option>
                    <option value="ENG">แผนก ENG (วิศวกรรม)</option>
                    <option value="QC">แผนก QC (คุมคุณภาพ)</option>
                  </select>

                  <select
                    value={logFilterStatus}
                    onChange={(e) => setLogFilterStatus(e.target.value)}
                    className="h-9 px-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  >
                    <option value="all">ทุกสถานะ</option>
                    <option value="verified_onsite">ในโรงงาน (&lt; 1 กม.)</option>
                    <option value="outside_geofence">นอกพื้นที่ (&gt; 1 กม.)</option>
                    <option value="manual_override">อนุมัติพิเศษ</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Check-ins Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3">เวลาเช็คอิน</th>
                        <th className="py-2.5 px-3">รหัสพนักงาน</th>
                        <th className="py-2.5 px-3">ชื่อ-นามสกุล</th>
                        <th className="py-2.5 px-3">แผนก</th>
                        <th className="py-2.5 px-3">หลักสูตร</th>
                        <th className="py-2.5 px-3">ระยะห่าง</th>
                        <th className="py-2.5 px-3">สถานะความปลอดภัย</th>
                        <th className="py-2.5 px-3 text-right">พิกัด GPS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            ไม่พบรายการเช็คอินตามเงื่อนไขที่ค้นหา
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                              {log.displayTime}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                              {log.empId}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                              {log.fullName}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                                {log.department}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={log.courseTitle}>
                              {log.courseTitle || 'การฝึกอบรมทั่วไป'}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                              {log.distanceMeters} เมตร
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                log.status === 'verified_onsite'
                                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                  : log.status === 'manual_override'
                                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                                  : 'bg-rose-100 border-rose-300 text-rose-800'
                              }`}>
                                {log.status === 'verified_onsite' ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                )}
                                <span>{log.statusLabelTh}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${log.lat},${log.lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 underline font-mono"
                                title="เปิดดูจุดพิกัดนี้บนแผนที่"
                              >
                                <span>{log.lat.toFixed(4)}, {log.lng.toFixed(4)}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                  <span>แสดงผลทั้งหมด {filteredLogs.length} รายการ</span>
                  <span>บันทึกลงในระบบส่วนกลาง (Server Database & Audit Log)</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Bar */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            <span>
              <strong>บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</strong> • สวนอุตสาหกรรมโรจนะ พระนครศรีอยุธยา (14.3380539, 100.6279692)
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => { playCyberClick(); onClose(); }}
              className="h-9 px-5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              เสร็จสิ้น / ปิดหน้าต่าง
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
