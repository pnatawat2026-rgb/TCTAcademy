import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  PredefinedEmployee, 
  getMasterEmployeeRoster, 
  saveMasterEmployeeRecord, 
  MASTER_EMPLOYEE_ROSTER_224, 
  MASTER_EMPLOYEE_STORAGE_KEY 
} from '../data/employeeDatabase';
import { hasEmployeeRegisteredPin, setEmployeePin } from '../data/traineeData';
import { getAllAvailableCourses } from '../utils/courseManager';
import { enrollEmployeesInCourse } from '../utils/courseTraineeHelper';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  UserPlus, 
  Edit3, 
  KeyRound, 
  GraduationCap, 
  ShieldCheck, 
  Building2, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RotateCcw, 
  Check, 
  ChevronDown, 
  Layers, 
  Clock, 
  FileSpreadsheet, 
  Eye, 
  Info,
  Lock,
  Unlock,
  CheckCircle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

interface MasterEmployeeDatabaseViewProps {
  onBackToRoster?: () => void;
  onEnrollToCourse?: (empId: string, courseId: string) => void;
}

// Division mapping with full Thai and English names
export const DIVISION_INFO: Record<string, { nameTh: string; nameEn: string; color: string; badgeBg: string }> = {
  'P': { nameTh: 'ฝ่ายผลิต (Production)', nameEn: 'Production', color: 'text-blue-700', badgeBg: 'bg-blue-50 text-blue-800 border-blue-200' },
  'TC': { nameTh: 'ฝ่ายเทคนิค (Technical)', nameEn: 'Technical', color: 'text-cyan-700', badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  'PP': { nameTh: 'ฝ่ายวางแผนการผลิต (Production Planning)', nameEn: 'Production Planning', color: 'text-indigo-700', badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  'MN': { nameTh: 'ฝ่ายซ่อมบำรุง (Maintenance)', nameEn: 'Maintenance', color: 'text-amber-700', badgeBg: 'bg-amber-50 text-amber-800 border-amber-200' },
  'PS': { nameTh: 'ฝ่ายบุคคลและธุรการ (Personnel & Admin)', nameEn: 'Personnel & Admin', color: 'text-emerald-700', badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  'QA': { nameTh: 'ฝ่ายประกันคุณภาพ (Quality Assurance)', nameEn: 'Quality Assurance', color: 'text-purple-700', badgeBg: 'bg-purple-50 text-purple-800 border-purple-200' },
  'ESH': { nameTh: 'ฝ่ายความปลอดภัยและสิ่งแวดล้อม (ESH)', nameEn: 'Environmental Safety & Health', color: 'text-teal-700', badgeBg: 'bg-teal-50 text-teal-800 border-teal-200' },
  'CO': { nameTh: 'ฝ่ายบริหาร (Corporate Office)', nameEn: 'Corporate Office', color: 'text-slate-700', badgeBg: 'bg-slate-100 text-slate-800 border-slate-300' }
};

// Department mapping
export const DEPARTMENT_INFO: Record<string, string> = {
  'TR': 'Test Room (ห้องแล็บทดสอบแรงดึง)',
  'AD1': 'Admin 1 / งานธุรการฝ่ายผลิต',
  'AD2': 'Admin 2 / งานสนับสนุนปฏิบัติการ',
  'PP': 'Production Planning (วางแผนการผลิต)',
  'ST': 'Setter (จัดเรียงเส้นด้ายและกระสวย)',
  'TW': 'Twisting (ปั่นเกลียวเส้นด้ายคอร์ด)',
  'MN': 'Maintenance (ซ่อมบำรุงวิศวกรรม)',
  'PS': 'Personnel (ฝ่ายบุคคลและธุรการ)',
  'SEC': 'Single End Cord (เส้นคอร์ดเดี่ยว)',
  'FI': 'Final Inspection (ตรวจสอบคุณภาพขั้นสุดท้าย)',
  'ESH': 'Environmental Safety & Health (ความปลอดภัยและสิ่งแวดล้อม)',
  'RW': 'Rewind (กรอเส้นด้าย / รีไวนด์)',
  'QA': 'Quality Assurance (ประกันคุณภาพ)',
  'P': 'Production (ฝ่ายผลิตหลัก)',
  'TC': 'Technical (เทคนิควิศวกรรม)',
  'CO': 'Corporate Office (ฝ่ายบริหาร)'
};

export const MasterEmployeeDatabaseView: React.FC<MasterEmployeeDatabaseViewProps> = ({
  onBackToRoster,
  onEnrollToCourse
}) => {
  const [employees, setEmployees] = useState<PredefinedEmployee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [selectedPinStatus, setSelectedPinStatus] = useState<'all' | 'set' | 'unset'>('all');

  // Edit Employee Modal
  const [editingEmployee, setEditingEmployee] = useState<PredefinedEmployee | null>(null);
  const [editFormData, setEditFormData] = useState({
    empId: '',
    prefix: 'นาย',
    firstName: '',
    lastName: '',
    firstNameEn: '',
    lastNameEn: '',
    department: 'P',
    division: 'P',
    position: 'WORKER',
    yearsOfService: '1 ปี'
  });

  // Add Employee Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    empId: '',
    prefix: 'นาย',
    firstName: '',
    lastName: '',
    firstNameEn: '',
    lastNameEn: '',
    department: 'P',
    division: 'P',
    position: 'WORKER',
    yearsOfService: '1 ปี',
    password: ''
  });

  // Enroll Modal
  const [enrollingEmployee, setEnrollingEmployee] = useState<PredefinedEmployee | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState('applied-psychology');

  // Quick Reset PIN Modal
  const [resetPinEmployee, setResetPinEmployee] = useState<PredefinedEmployee | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Master Employees
  const reloadEmployees = () => {
    const list = getMasterEmployeeRoster();
    setEmployees(list);
  };

  useEffect(() => {
    reloadEmployees();
  }, []);

  // Filtered List
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // 1. Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cleanEmpId = emp.empId.toLowerCase();
        const fullNameTh = (emp.fullName || `${emp.prefix || ''} ${emp.firstName || ''} ${emp.lastName || ''}`).toLowerCase();
        const fullNameEn = (emp.fullNameEn || `${emp.firstNameEn || ''} ${emp.lastNameEn || ''}`).toLowerCase();
        const dept = (emp.department || '').toLowerCase();
        const pos = (emp.position || '').toLowerCase();
        const div = (emp.division || '').toLowerCase();

        const match = cleanEmpId.includes(q) ||
          fullNameTh.includes(q) ||
          fullNameEn.includes(q) ||
          dept.includes(q) ||
          pos.includes(q) ||
          div.includes(q);

        if (!match) return false;
      }

      // 2. Division filter
      if (selectedDivision !== 'all' && emp.division !== selectedDivision) {
        return false;
      }

      // 3. Department filter
      if (selectedDepartment !== 'all' && emp.department !== selectedDepartment) {
        return false;
      }

      // 4. Position filter
      if (selectedPosition !== 'all' && (emp.position || '').toUpperCase() !== selectedPosition.toUpperCase()) {
        return false;
      }

      // 5. PIN/Password status filter
      if (selectedPinStatus !== 'all') {
        const hasPin = hasEmployeeRegisteredPin(emp.empId);
        if (selectedPinStatus === 'set' && !hasPin) return false;
        if (selectedPinStatus === 'unset' && hasPin) return false;
      }

      return true;
    });
  }, [employees, searchQuery, selectedDivision, selectedDepartment, selectedPosition, selectedPinStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = employees.length;
    let pinSetCount = 0;
    const divisionCounts: Record<string, number> = {};
    const positionCounts: Record<string, number> = {};

    employees.forEach(emp => {
      if (hasEmployeeRegisteredPin(emp.empId)) {
        pinSetCount++;
      }
      const div = emp.division || 'P';
      divisionCounts[div] = (divisionCounts[div] || 0) + 1;

      const pos = (emp.position || 'WORKER').toUpperCase();
      positionCounts[pos] = (positionCounts[pos] || 0) + 1;
    });

    return {
      total,
      pinSetCount,
      pinUnsetCount: total - pinSetCount,
      divisionCounts,
      positionCounts
    };
  }, [employees]);

  // Divisions and Departments List for dropdowns
  const availableDivisions = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => { if (e.division) set.add(e.division); });
    return Array.from(set).sort();
  }, [employees]);

  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => { if (e.department) set.add(e.department); });
    return Array.from(set).sort();
  }, [employees]);

  const availablePositions = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => { if (e.position) set.add(e.position.toUpperCase()); });
    return Array.from(set).sort();
  }, [employees]);

  // Handle Export to Excel
  const handleExportToExcel = () => {
    playCyberClick();
    try {
      const exportData = filteredEmployees.map((emp, index) => {
        const hasPin = hasEmployeeRegisteredPin(emp.empId);
        const divInfo = DIVISION_INFO[emp.division || ''] || { nameTh: emp.division || '-', nameEn: emp.division || '-' };
        const deptDesc = DEPARTMENT_INFO[emp.department || ''] || emp.department || '-';

        return {
          'ลำดับ': index + 1,
          'รหัสพนักงาน': emp.empId,
          'คำนำหน้า': emp.prefix || 'นาย',
          'ชื่อ (ภาษาไทย)': emp.firstName || '',
          'นามสกุล (ภาษาไทย)': emp.lastName || '',
          'ชื่อ-นามสกุลเต็ม': emp.fullName || `${emp.prefix || 'นาย'} ${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
          'First Name (EN)': emp.firstNameEn || '',
          'Last Name (EN)': emp.lastNameEn || '',
          'รหัสฝ่าย': emp.division || '',
          'ชื่อฝ่าย': divInfo.nameTh,
          'รหัสแผนก': emp.department || '',
          'ชื่อแผนก': deptDesc,
          'ตำแหน่ง': emp.position || 'WORKER',
          'อายุงาน': emp.yearsOfService || emp.tenure || '1 ปี',
          'สถานะรหัสผ่าน': hasPin ? 'ตั้งรหัสผ่านแล้ว' : 'ยังไม่ตั้งรหัสผ่าน',
          'สถานะฐานข้อมูล': 'ฐานข้อมูลแม่บทถาวร (Master Registry)'
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Auto-fit column widths
      const colWidths = [
        { wch: 8 },  // ลำดับ
        { wch: 14 }, // รหัสพนักงาน
        { wch: 10 }, // คำนำหน้า
        { wch: 16 }, // ชื่อ
        { wch: 18 }, // นามสกุล
        { wch: 28 }, // ชื่อ-นามสกุลเต็ม
        { wch: 16 }, // First Name
        { wch: 18 }, // Last Name
        { wch: 10 }, // รหัสฝ่าย
        { wch: 35 }, // ชื่อฝ่าย
        { wch: 12 }, // รหัสแผนก
        { wch: 32 }, // ชื่อแผนก
        { wch: 18 }, // ตำแหน่ง
        { wch: 14 }, // อายุงาน
        { wch: 18 }, // สถานะรหัสผ่าน
        { wch: 30 }  // สถานะฐานข้อมูล
      ];
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Master_Employees_224');

      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `TCT_Master_Employee_Database_${dateStr}.xlsx`);

      playSuccessChime();
      showToast('📥 ส่งออกไฟล์ Excel สำเร็จเรียบร้อยแล้ว!');
    } catch (e) {
      console.error('Export error', e);
      playErrorBuzz();
      showToast('❌ เกิดข้อผิดพลาดในการส่งออกไฟล์ Excel');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (emp: PredefinedEmployee) => {
    playCyberClick();
    setEditingEmployee(emp);
    setEditFormData({
      empId: emp.empId,
      prefix: emp.prefix || 'นาย',
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      firstNameEn: emp.firstNameEn || '',
      lastNameEn: emp.lastNameEn || '',
      department: emp.department || 'P',
      division: emp.division || 'P',
      position: emp.position || 'WORKER',
      yearsOfService: emp.yearsOfService || emp.tenure || '1 ปี'
    });
  };

  // Submit Edit
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const updated: PredefinedEmployee = {
      ...editingEmployee,
      empId: editFormData.empId.trim().toUpperCase(),
      prefix: editFormData.prefix.trim(),
      firstName: editFormData.firstName.trim(),
      lastName: editFormData.lastName.trim(),
      fullName: `${editFormData.prefix.trim()} ${editFormData.firstName.trim()} ${editFormData.lastName.trim()}`.trim(),
      firstNameEn: editFormData.firstNameEn.trim(),
      lastNameEn: editFormData.lastNameEn.trim(),
      fullNameEn: `${editFormData.firstNameEn.trim()} ${editFormData.lastNameEn.trim()}`.trim(),
      department: editFormData.department.trim(),
      division: editFormData.division.trim(),
      position: editFormData.position.trim(),
      yearsOfService: editFormData.yearsOfService.trim(),
      tenure: editFormData.yearsOfService.trim(),
      isMasterRecord: true
    };

    saveMasterEmployeeRecord(updated);
    reloadEmployees();
    setEditingEmployee(null);
    playSuccessChime();
    showToast(`✅ อัปเดตข้อมูลพนักงาน "${updated.empId} - ${updated.fullName}" สำเร็จ`);
  };

  // Submit Add
  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = addFormData.empId.trim().toUpperCase();
    if (!cleanId) {
      playErrorBuzz();
      alert('กรุณากรอกรหัสพนักงาน');
      return;
    }

    const newEmp: PredefinedEmployee = {
      empId: cleanId,
      prefix: addFormData.prefix.trim(),
      firstName: addFormData.firstName.trim(),
      lastName: addFormData.lastName.trim(),
      fullName: `${addFormData.prefix.trim()} ${addFormData.firstName.trim()} ${addFormData.lastName.trim()}`.trim(),
      firstNameEn: addFormData.firstNameEn.trim(),
      lastNameEn: addFormData.lastNameEn.trim(),
      fullNameEn: `${addFormData.firstNameEn.trim()} ${addFormData.lastNameEn.trim()}`.trim(),
      department: addFormData.department.trim(),
      division: addFormData.division.trim(),
      position: addFormData.position.trim(),
      yearsOfService: addFormData.yearsOfService.trim(),
      tenure: addFormData.yearsOfService.trim(),
      isMasterRecord: true
    };

    saveMasterEmployeeRecord(newEmp);

    if (addFormData.password.trim()) {
      setEmployeePin(cleanId, addFormData.password.trim());
    }

    reloadEmployees();
    setIsAddModalOpen(false);
    setAddFormData({
      empId: '',
      prefix: 'นาย',
      firstName: '',
      lastName: '',
      firstNameEn: '',
      lastNameEn: '',
      department: 'P',
      division: 'P',
      position: 'WORKER',
      yearsOfService: '1 ปี',
      password: ''
    });

    playSuccessChime();
    showToast(`✅ เพิ่มพนักงานใหม่ "${newEmp.empId} - ${newEmp.fullName}" เข้าสู่ฐานข้อมูลแม่บทสำเร็จ`);
  };

  // Submit Password Reset from Admin
  const handleSubmitResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPinEmployee) return;

    const cleanPass = newPasswordVal.trim();
    if (cleanPass.length < 4) {
      playErrorBuzz();
      alert('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setEmployeePin(resetPinEmployee.empId, cleanPass);
    reloadEmployees();
    setResetPinEmployee(null);
    setNewPasswordVal('');
    playSuccessChime();
    showToast(`🔑 รีเซ็ตรหัสผ่านพนักงาน ${resetPinEmployee.empId} สำเร็จ`);
  };

  // Restore Official 224 Baseline
  const handleRestoreOfficialBaseline = () => {
    if (window.confirm('ท่านต้องการคืนค่าฐานข้อมูลพนักงานแม่บทให้ตรงกับเอกสารทางการ 224 ท่าน 100% หรือไม่? ข้อมูลการแก้ไขส่วนบุคคลจะถูกรีเซ็ตกลับสู่มาตรฐาน')) {
      playCyberClick();
      try {
        localStorage.setItem(MASTER_EMPLOYEE_STORAGE_KEY, JSON.stringify(MASTER_EMPLOYEE_ROSTER_224));
        reloadEmployees();
        playSuccessChime();
        showToast('🔄 คืนค่าฐานข้อมูลพนักงานทางการ 224 ท่านสำเร็จ');
      } catch (e) {
        playErrorBuzz();
      }
    }
  };

  // Enroll single employee to course
  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollingEmployee) return;

    enrollEmployeesInCourse(selectedCourseId, [enrollingEmployee.empId]);
    playSuccessChime();
    showToast(`🎓 ลงทะเบียน ${enrollingEmployee.fullName} เข้าสู่หลักสูตรเรียบร้อยแล้ว`);
    setEnrollingEmployee(null);

    if (onEnrollToCourse) {
      onEnrollToCourse(enrollingEmployee.empId, selectedCourseId);
    }
  };

  const allCourses = getAllAvailableCourses();

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 border border-blue-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#001D3D] via-[#002D62] to-[#0A192F] text-white p-6 rounded-3xl border border-blue-900/50 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ฐานข้อมูลแม่บทถาวร (Permanent Protected Database)</span>
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                เอกสารทางการ 224 ท่าน
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              ทะเบียนพนักงานแม่บท (Master Employee Database)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • ศูนย์ฝึกอบรม TCT Academy<br />
              <span className="text-slate-400">
                ข้อมูลสำคัญระดับองค์กรสำหรับยืนยันตัวตน, ตั้งรหัสผ่านครั้งแรก, ดึงรายชื่อขออนุมัติหลักสูตร และทำรายงานผลการฝึกอบรม โดยไม่ถูกลบเมื่อล้างรอบฝึกอบรม
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                playCyberClick();
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>เพิ่มพนักงานใหม่</span>
            </button>

            <button
              onClick={handleExportToExcel}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ส่งออก Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleRestoreOfficialBaseline}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="คืนค่าฐานข้อมูลมาตรฐาน 224 ท่าน"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่า 224 ท่าน</span>
            </button>

            {onBackToRoster && (
              <button
                onClick={() => {
                  playCyberClick();
                  onBackToRoster();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>กลับสู่ Roster</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative Grid Graphic */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">พนักงานในทะเบียนแม่บท</div>
            <div className="text-2xl font-black text-slate-900">{stats.total} <span className="text-xs font-bold text-slate-400">ท่าน</span></div>
            <div className="text-[10px] text-emerald-600 font-bold">● ครบถ้วน 100% ตามเอกสาร</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">ตั้งรหัสผ่าน / มี PIN แล้ว</div>
            <div className="text-2xl font-black text-emerald-700">{stats.pinSetCount} <span className="text-xs font-bold text-slate-400">ท่าน</span></div>
            <div className="text-[10px] text-slate-400">เข้าใช้งานระบบได้ทันที</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">ยังไม่ตั้งรหัสผ่าน</div>
            <div className="text-2xl font-black text-amber-700">{stats.pinUnsetCount} <span className="text-xs font-bold text-slate-400">ท่าน</span></div>
            <div className="text-[10px] text-slate-400">ระบบจะให้ตั้งรหัสเมื่อเข้าครั้งแรก</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">โครงสร้างองค์กร</div>
            <div className="text-2xl font-black text-purple-900">8 <span className="text-xs font-bold text-slate-500">ฝ่าย</span> / 13 <span className="text-xs font-bold text-slate-500">แผนก</span></div>
            <div className="text-[10px] text-slate-400">โรงงานเทยิน คอร์ด (ประเทศไทย)</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหารหัสพนักงาน (5 หลัก เช่น 00021, 25056), ชื่อ-นามสกุล, ชื่อภาษาอังกฤษ, แผนก, ตำแหน่ง..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Division Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-semibold">ฝ่าย:</span>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">ทั้งหมด (8 ฝ่าย)</option>
                {availableDivisions.map(div => (
                  <option key={div} value={div}>
                    {div} - {DIVISION_INFO[div]?.nameEn || div}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-semibold">แผนก:</span>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">ทั้งหมด</option>
                {availableDepartments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept} ({DEPARTMENT_INFO[dept] ? DEPARTMENT_INFO[dept].split('(')[0].trim() : dept})
                  </option>
                ))}
              </select>
            </div>

            {/* Position Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-semibold">ตำแหน่ง:</span>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">ทุกตำแหน่ง</option>
                {availablePositions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            {/* PIN Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-semibold">สถานะรหัส:</span>
              <select
                value={selectedPinStatus}
                onChange={(e) => setSelectedPinStatus(e.target.value as any)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">ทั้งหมด</option>
                <option value="set">ตั้งรหัสผ่านแล้ว</option>
                <option value="unset">ยังไม่ตั้งรหัส</option>
              </select>
            </div>
          </div>
        </div>

        {/* Division Quick Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium text-[11px] mr-1">ฝ่ายหลัก:</span>
          <button
            onClick={() => setSelectedDivision('all')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              selectedDivision === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({employees.length})
          </button>
          {Object.entries(DIVISION_INFO).map(([key, info]) => {
            const count = stats.divisionCounts[key] || 0;
            const isSelected = selectedDivision === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedDivision(key)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{key}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <span>ผลการค้นหา: แสดง {filteredEmployees.length} จากทั้งหมด {employees.length} ท่าน</span>
            {selectedDivision !== 'all' && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px]">
                ฝ่าย {selectedDivision}
              </span>
            )}
          </div>
          <span className="text-slate-400 text-[11px]">
            * รหัสพนักงาน 5 หลัก สามารถใช้เข้าสู่ระบบและดึงรายชื่อได้ทุกระบบ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 text-center w-12">ลำดับ</th>
                <th className="py-3 px-3.5 w-24">รหัสพนักงาน</th>
                <th className="py-3 px-3.5">ชื่อ-นามสกุล (ภาษาไทย)</th>
                <th className="py-3 px-3.5">Name - Surname (EN)</th>
                <th className="py-3 px-3.5 text-center w-20">ฝ่าย</th>
                <th className="py-3 px-3.5 text-center w-20">แผนก</th>
                <th className="py-3 px-3.5">ตำแหน่ง</th>
                <th className="py-3 px-3.5 text-center w-24">อายุงาน</th>
                <th className="py-3 px-3.5 text-center w-28">สถานะรหัสผ่าน</th>
                <th className="py-3 px-3.5 text-center w-36">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sarabun">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="font-bold text-sm">ไม่พบข้อมูลพนักงานที่ตรงกับเงื่อนไข</div>
                    <div className="text-xs">กรุณาลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรอง</div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => {
                  const hasPin = hasEmployeeRegisteredPin(emp.empId);
                  const divInfo = DIVISION_INFO[emp.division || ''] || { nameTh: emp.division || '-', nameEn: emp.division || '-', badgeBg: 'bg-slate-100 text-slate-800 border-slate-200' };

                  return (
                    <tr 
                      key={emp.empId} 
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#005A9C] border border-blue-200 font-black">
                          {emp.empId}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 font-normal">{emp.prefix}</span>
                          <span>{emp.firstName} {emp.lastName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-slate-600 font-medium">
                        {emp.firstNameEn || emp.lastNameEn ? (
                          <span>{emp.firstNameEn} {emp.lastNameEn}</span>
                        ) : (
                          <span className="text-slate-300 italic">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        <span 
                          className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] border ${divInfo.badgeBg}`}
                          title={divInfo.nameTh}
                        >
                          {emp.division || '-'}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        <span 
                          className="inline-block px-2 py-0.5 rounded-md font-mono font-bold text-[11px] bg-slate-100 text-slate-700 border border-slate-200"
                          title={DEPARTMENT_INFO[emp.department || ''] || emp.department}
                        >
                          {emp.department || '-'}
                        </span>
                      </td>

                      <td className="py-3 px-3.5">
                        <span className="inline-block px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                          {emp.position || 'WORKER'}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center text-slate-600 font-medium text-[11px]">
                        {emp.yearsOfService || emp.tenure || '1 ปี'}
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        {hasPin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ตั้งแล้ว</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>ยังไม่ตั้ง</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
                            title="แก้ไขข้อมูลพนักงาน"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset PIN Button */}
                          <button
                            onClick={() => {
                              playCyberClick();
                              setResetPinEmployee(emp);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition-colors cursor-pointer"
                            title="ตั้ง/รีเซ็ตรหัสผ่านพนักงาน"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Enroll to Course Button */}
                          <button
                            onClick={() => {
                              playCyberClick();
                              setEnrollingEmployee(emp);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="ลงทะเบียนเข้าหลักสูตร"
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-300" />
                <h3 className="font-bold text-base">แก้ไขข้อมูลพนักงานแม่บท</h3>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">รหัสพนักงาน</label>
                  <input
                    type="text"
                    value={editFormData.empId}
                    onChange={(e) => setEditFormData({ ...editFormData, empId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-mono font-bold text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">คำนำหน้า</label>
                  <select
                    value={editFormData.prefix}
                    onChange={(e) => setEditFormData({ ...editFormData, prefix: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="น.ส.">น.ส.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ตำแหน่ง</label>
                  <input
                    type="text"
                    value={editFormData.position}
                    onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ (ภาษาไทย)</label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">นามสกุล (ภาษาไทย)</label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">First Name (EN)</label>
                  <input
                    type="text"
                    value={editFormData.firstNameEn}
                    onChange={(e) => setEditFormData({ ...editFormData, firstNameEn: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Last Name (EN)</label>
                  <input
                    type="text"
                    value={editFormData.lastNameEn}
                    onChange={(e) => setEditFormData({ ...editFormData, lastNameEn: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ฝ่าย (Division)</label>
                  <input
                    type="text"
                    value={editFormData.division}
                    onChange={(e) => setEditFormData({ ...editFormData, division: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">แผนก (Dept)</label>
                  <input
                    type="text"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">อายุงาน</label>
                  <input
                    type="text"
                    value={editFormData.yearsOfService}
                    onChange={(e) => setEditFormData({ ...editFormData, yearsOfService: e.target.value })}
                    placeholder="เช่น 3 ปี 4 เดือน"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-300" />
                <h3 className="font-bold text-base">เพิ่มพนักงานใหม่เข้าสู่ฐานข้อมูลแม่บท</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">รหัสพนักงาน (5 หลัก)</label>
                  <input
                    type="text"
                    value={addFormData.empId}
                    onChange={(e) => setAddFormData({ ...addFormData, empId: e.target.value })}
                    placeholder="เช่น 26050"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">คำนำหน้า</label>
                  <select
                    value={addFormData.prefix}
                    onChange={(e) => setAddFormData({ ...addFormData, prefix: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="น.ส.">น.ส.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ตำแหน่ง</label>
                  <input
                    type="text"
                    value={addFormData.position}
                    onChange={(e) => setAddFormData({ ...addFormData, position: e.target.value })}
                    placeholder="WORKER"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ (ภาษาไทย)</label>
                  <input
                    type="text"
                    value={addFormData.firstName}
                    onChange={(e) => setAddFormData({ ...addFormData, firstName: e.target.value })}
                    placeholder="ชื่อจริง"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">นามสกุล (ภาษาไทย)</label>
                  <input
                    type="text"
                    value={addFormData.lastName}
                    onChange={(e) => setAddFormData({ ...addFormData, lastName: e.target.value })}
                    placeholder="นามสกุล"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">First Name (EN)</label>
                  <input
                    type="text"
                    value={addFormData.firstNameEn}
                    onChange={(e) => setAddFormData({ ...addFormData, firstNameEn: e.target.value })}
                    placeholder="First Name"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Last Name (EN)</label>
                  <input
                    type="text"
                    value={addFormData.lastNameEn}
                    onChange={(e) => setAddFormData({ ...addFormData, lastNameEn: e.target.value })}
                    placeholder="Last Name"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ฝ่าย (Division)</label>
                  <select
                    value={addFormData.division}
                    onChange={(e) => setAddFormData({ ...addFormData, division: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    {Object.keys(DIVISION_INFO).map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">แผนก (Dept)</label>
                  <select
                    value={addFormData.department}
                    onChange={(e) => setAddFormData({ ...addFormData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    {Object.keys(DEPARTMENT_INFO).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">อายุงาน</label>
                  <input
                    type="text"
                    value={addFormData.yearsOfService}
                    onChange={(e) => setAddFormData({ ...addFormData, yearsOfService: e.target.value })}
                    placeholder="เช่น 1 ปี"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รหัสผ่านเริ่มต้น (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={addFormData.password}
                  onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                  placeholder="หากเว้นว่าง พนักงานจะถูกให้ตั้งรหัสเมื่อเข้าสู่ระบบครั้งแรก"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  เพิ่มพนักงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset PIN Modal */}
      {resetPinEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-bold text-base">ตั้ง/รีเซ็ตรหัสผ่าน</h3>
              </div>
              <button
                onClick={() => setResetPinEmployee(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitResetPin} className="p-5 space-y-4">
              <div className="text-xs text-slate-600">
                พนักงาน: <strong className="text-slate-900">{resetPinEmployee.fullName}</strong> ({resetPinEmployee.empId})<br />
                แผนก: {resetPinEmployee.department}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)</label>
                <input
                  type="text"
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านใหม่..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPinEmployee(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md"
                >
                  บันทึกรหัสผ่าน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Course Modal */}
      {enrollingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <h3 className="font-bold text-base">ลงทะเบียนเข้าหลักสูตร</h3>
              </div>
              <button
                onClick={() => setEnrollingEmployee(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="p-5 space-y-4">
              <div className="text-xs text-slate-600">
                พนักงาน: <strong className="text-slate-900">{enrollingEmployee.fullName}</strong> ({enrollingEmployee.empId})<br />
                ตำแหน่ง: {enrollingEmployee.position} • แผนก: {enrollingEmployee.department}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เลือกหลักสูตรที่ต้องการลงทะเบียน</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {allCourses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code || c.id} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEnrollingEmployee(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  ยืนยันลงทะเบียน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
