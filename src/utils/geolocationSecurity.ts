/**
 * Geolocation Security, Inspection & Geofencing System
 * Company: บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด (Teijin Cord Thailand Co., Ltd.)
 * Coordinates: 14.3380539, 100.6279692
 * Address: สวนอุตสาหกรรมโรจนะ 1/1 หมู่ 5 ต.คานหาม อ.อุทัย จ.พระนครศรีอยุธยา 13210
 * Google Maps Link: https://maps.app.goo.gl/LkRz5gMxeuRbMn2F6
 * Maximum allowed radius: 1.0 km (1,000 meters)
 */

import { EmployeeLocationCheckIn } from '../types';

export interface Coordinates {
  lat: number;
  lng: number;
}

export const TEIJIN_CORD_COORDS: Coordinates & {
  name: string;
  shortName: string;
  address: string;
  province: string;
  industrialPark: string;
  mapUrl: string;
  directionsUrl: string;
} = {
  lat: 14.3380539,
  lng: 100.6279692,
  name: 'บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด',
  shortName: 'Teijin Cord Thailand (TCT)',
  address: 'สวนอุตสาหกรรมโรจนะ 1/1 หมู่ 5 ต.คานหาม อ.อุทัย จ.พระนครศรีอยุธยา 13210',
  province: 'พระนครศรีอยุธยา',
  industrialPark: 'สวนอุตสาหกรรมโรจนะ (Rojana Industrial Park Phase 1)',
  mapUrl: 'https://maps.app.goo.gl/LkRz5gMxeuRbMn2F6',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=14.3380539,100.6279692'
};

export const MAX_ALLOWED_DISTANCE_KM = 1.0; // 1.0 กิโลเมตร (1,000 เมตร)
export const MAX_ALLOWED_DISTANCE_METERS = 1000;
const ADMIN_GEO_BYPASS_KEY = 'tct_admin_geo_bypass_v1';
const LOCAL_CHECKINS_STORAGE_KEY = 'tct_location_checkins_v1';

/**
 * Factory Key Locations for Testing & Simulation
 */
export interface PresetLocation {
  id: string;
  nameTh: string;
  nameEn: string;
  lat: number;
  lng: number;
  descriptionTh: string;
  isInsideGeofence: boolean;
}

export const FACTORY_PRESET_LOCATIONS: PresetLocation[] = [
  {
    id: 'tct-main-gate',
    nameTh: 'ป้อม รปภ. ประตูทางเข้าหลัก (Main Gate)',
    nameEn: 'TCT Main Security Gate',
    lat: 14.33812,
    lng: 100.62791,
    descriptionTh: 'จุดคัดกรองความปลอดภัยหน้าทางเข้าโรงงาน',
    isInsideGeofence: true
  },
  {
    id: 'tct-academy-room',
    nameTh: 'ห้องฝึกอบรม TCT Academy (ชั้น 2 อาคารบริหาร)',
    nameEn: 'TCT Academy Training Center',
    lat: 14.33805,
    lng: 100.62800,
    descriptionTh: 'ศูนย์ฝึกอบรมหลักสูตร e-Training และห้องประชุม',
    isInsideGeofence: true
  },
  {
    id: 'tct-prod-twisting',
    nameTh: 'สายการผลิต Tire Cord Fabric & SEC (ฝ่ายผลิต P)',
    nameEn: 'Production Line (Twisting & Weaving)',
    lat: 14.33785,
    lng: 100.62760,
    descriptionTh: 'อาคารผลิตเส้นด้ายเสริมแรงยางรถยนต์',
    isInsideGeofence: true
  },
  {
    id: 'tct-warehouse-fg',
    nameTh: 'คลังสินค้าสินค้าสำเร็จรูป (FG Warehouse)',
    nameEn: 'Finished Goods Warehouse',
    lat: 14.33920,
    lng: 100.62880,
    descriptionTh: 'จุดจัดเก็บและเตรียมส่งมอบผลิตภัณฑ์',
    isInsideGeofence: true
  },
  {
    id: 'tct-perimeter-buffer',
    nameTh: 'บริเวณสวนอุตสาหกรรมโรจนะ เฟส 1 (แนวรัศมี 500 ม.)',
    nameEn: 'Rojana Industrial Park Zone (Within 500m)',
    lat: 14.34150,
    lng: 100.63120,
    descriptionTh: 'ยังอยู่ในรัศมีปลอดภัย 1.0 กม. รอบโรงงาน',
    isInsideGeofence: true
  },
  {
    id: 'outside-uthai-crossroad',
    nameTh: 'ภายนอกพื้นที่: สี่แยกอุทัย-โรจนะ (~4.5 กม.)',
    nameEn: 'Outside Geofence: Uthai Intersection (~4.5km)',
    lat: 14.36800,
    lng: 100.66200,
    descriptionTh: 'อยู่นอกพื้นที่อนุญาต (ต้องขออนุมัติหรือเข้าสู่พื้นที่โรงงาน)',
    isInsideGeofence: false
  }
];

/**
 * Calculates Haversine distance between two coordinates in Kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number = TEIJIN_CORD_COORDS.lat,
  lon2: number = TEIJIN_CORD_COORDS.lng
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type GeoSecurityStatus =
  | 'idle'
  | 'checking'
  | 'within_allowed_radius'
  | 'outside_allowed_radius'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'unsupported'
  | 'bypassed_by_admin';

export interface GeoLocationResult {
  status: GeoSecurityStatus;
  userCoords: Coordinates | null;
  distanceKm: number | null;
  distanceMeters: number | null;
  accuracyMeters: number | null;
  altitudeMeters: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: string;
  errorMessage?: string;
  isAllowed: boolean;
  isSimulation?: boolean;
  presetName?: string;
}

export const ADMIN_GEO_BYPASS_CONFIG_KEY = 'tct_admin_geo_bypass_config_v2';

export interface AdminGeoBypassConfig {
  isSystemWideBypass: boolean; // ยกเลิกทั้งระบบ
  bypassedEmpIds: string[]; // ยกเลิกเป็นรายบุคคล (รหัสพนักงาน)
  bypassedCourseIds: string[]; // ยกเลิกตามหลักสูตร (รหัสหลักสูตร)
  lastUpdated?: string;
  updatedBy?: string;
  notes?: string;
}

/**
 * Retrieves the full admin geofence bypass configuration
 */
export function getAdminGeoBypassConfig(): AdminGeoBypassConfig {
  try {
    const raw = localStorage.getItem(ADMIN_GEO_BYPASS_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        isSystemWideBypass: Boolean(parsed.isSystemWideBypass),
        bypassedEmpIds: Array.isArray(parsed.bypassedEmpIds) ? parsed.bypassedEmpIds : [],
        bypassedCourseIds: Array.isArray(parsed.bypassedCourseIds) ? parsed.bypassedCourseIds : [],
        lastUpdated: parsed.lastUpdated,
        updatedBy: parsed.updatedBy,
        notes: parsed.notes
      };
    }
  } catch (e) {}

  // Also check legacy single-flag key as fallback
  const legacy = typeof localStorage !== 'undefined' && localStorage.getItem(ADMIN_GEO_BYPASS_KEY) === 'true';
  return {
    isSystemWideBypass: legacy,
    bypassedEmpIds: [],
    bypassedCourseIds: []
  };
}

/**
 * Saves the full admin geofence bypass configuration
 */
export function saveAdminGeoBypassConfig(config: AdminGeoBypassConfig): void {
  try {
    const updated = {
      ...config,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(ADMIN_GEO_BYPASS_CONFIG_KEY, JSON.stringify(updated));
    if (config.isSystemWideBypass) {
      localStorage.setItem(ADMIN_GEO_BYPASS_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_GEO_BYPASS_KEY);
    }
    window.dispatchEvent(new Event('tct_geo_bypass_updated'));
  } catch (e) {}
}

/**
 * Check if location restriction is bypassed for a specific employee and/or course
 */
export function isLocationBypassedFor(
  empId?: string,
  courseId?: string
): { isBypassed: boolean; bypassType?: 'system' | 'individual' | 'course'; reasonTh: string } {
  const config = getAdminGeoBypassConfig();

  // 1. System-wide bypass (ยกเลิกทั้งระบบ)
  if (config.isSystemWideBypass) {
    return {
      isBypassed: true,
      bypassType: 'system',
      reasonTh: 'ผู้ดูแลระบบยกเลิกการจำกัดพิกัดทั้งระบบ (System-wide Bypass)'
    };
  }

  // 2. Individual employee bypass (ยกเลิกเป็นรายบุคคล)
  if (empId) {
    const cleanId = empId.trim().toUpperCase();
    if (config.bypassedEmpIds.map(x => x.toUpperCase()).includes(cleanId)) {
      return {
        isBypassed: true,
        bypassType: 'individual',
        reasonTh: `ผู้ดูแลระบบอนุมัติการยกเว้นพิกัดเฉพาะรายบุคคล (รหัสพนักงาน: ${cleanId})`
      };
    }
  }

  // 3. Per-course bypass (ยกเลิกตามหลักสูตร)
  if (courseId) {
    if (config.bypassedCourseIds.includes(courseId)) {
      return {
        isBypassed: true,
        bypassType: 'course',
        reasonTh: `ผู้ดูแลระบบยกเลิกการจำกัดพิกัดสำหรับหลักสูตรนี้ (${courseId})`
      };
    }
  }

  return {
    isBypassed: false,
    reasonTh: 'ต้องอยู่ในรัศมี 1.0 กม. จากโรงงาน บจก. เทยิน คอร์ด (ประเทศไทย)'
  };
}

/**
 * Checks if admin bypass is currently active (legacy or system-wide)
 */
export function isAdminGeoBypassActive(empId?: string, courseId?: string): boolean {
  return isLocationBypassedFor(empId, courseId).isBypassed;
}

/**
 * Sets admin system-wide bypass
 */
export function setAdminGeoBypass(active: boolean): void {
  const cfg = getAdminGeoBypassConfig();
  cfg.isSystemWideBypass = active;
  saveAdminGeoBypassConfig(cfg);
}

/**
 * Helper to get clean human-readable area description
 */
export function getAreaDescription(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) {
    return 'ไม่สามารถระบุพื้นที่ได้';
  }
  if (distanceKm <= 0.1) {
    return 'ภายในอาคารโรงงาน/ศูนย์ TCT Academy (สวนอุตสาหกรรมโรจนะ)';
  }
  if (distanceKm <= 0.5) {
    return 'บริเวณโรงงานและพื้นที่การผลิต บจก. เทยิน คอร์ด';
  }
  if (distanceKm <= 1.0) {
    return 'ภายในเขตสวนอุตสาหกรรมโรจนะ เฟส 1 (แนวรัศมีปลอดภัย 1.0 กม.)';
  }
  return `ภายนอกพื้นที่โรงงาน (ห่างออกไป ${formatDistanceThai(distanceKm)})`;
}

/**
 * Perform a real-time high-accuracy check of user position with bypass checks
 */
export function checkUserLocationSecurity(
  simulatedPresetId?: string,
  empId?: string,
  courseId?: string
): Promise<GeoLocationResult> {
  return new Promise((resolve) => {
    // 1. Simulation override if requested
    if (simulatedPresetId) {
      const preset = FACTORY_PRESET_LOCATIONS.find((p) => p.id === simulatedPresetId);
      if (preset) {
        const distKm = calculateDistanceKm(preset.lat, preset.lng);
        const withinRadius = distKm <= MAX_ALLOWED_DISTANCE_KM;
        resolve({
          status: withinRadius ? 'within_allowed_radius' : 'outside_allowed_radius',
          userCoords: { lat: preset.lat, lng: preset.lng },
          distanceKm: distKm,
          distanceMeters: Math.round(distKm * 1000),
          accuracyMeters: 4.5,
          altitudeMeters: 12.0,
          speed: 0,
          heading: null,
          timestamp: new Date().toISOString(),
          isAllowed: withinRadius,
          isSimulation: true,
          presetName: preset.nameTh
        });
        return;
      }
    }

    // 2. Admin bypass check (system-wide, individual, or course-specific)
    const bypassCheck = isLocationBypassedFor(empId, courseId);
    if (bypassCheck.isBypassed) {
      resolve({
        status: 'bypassed_by_admin',
        userCoords: { lat: TEIJIN_CORD_COORDS.lat, lng: TEIJIN_CORD_COORDS.lng },
        distanceKm: 0,
        distanceMeters: 0,
        accuracyMeters: 1.0,
        altitudeMeters: 10.0,
        speed: 0,
        heading: null,
        timestamp: new Date().toISOString(),
        isAllowed: true,
        presetName: bypassCheck.reasonTh
      });
      return;
    }

    // 3. Browser Geolocation API
    if (!('geolocation' in navigator)) {
      resolve({
        status: 'unsupported',
        userCoords: null,
        distanceKm: null,
        distanceMeters: null,
        accuracyMeters: null,
        altitudeMeters: null,
        speed: null,
        heading: null,
        timestamp: new Date().toISOString(),
        errorMessage: 'เบราว์เซอร์ไม่รองรับการตรวจสอบตำแหน่งพิกัด GPS',
        isAllowed: false
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        const distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lng);
        const withinRadius = distanceKm <= MAX_ALLOWED_DISTANCE_KM;

        resolve({
          status: withinRadius ? 'within_allowed_radius' : 'outside_allowed_radius',
          userCoords,
          distanceKm,
          distanceMeters: Math.round(distanceKm * 1000),
          accuracyMeters: Math.round(position.coords.accuracy || 10),
          altitudeMeters: position.coords.altitude ? Math.round(position.coords.altitude) : null,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: new Date(position.timestamp || Date.now()).toISOString(),
          isAllowed: withinRadius
        });
      },
      (error) => {
        let status: GeoSecurityStatus = 'position_unavailable';
        let msg = 'ไม่สามารถดึงข้อมูลตำแหน่ง GPS ได้';

        if (error.code === error.PERMISSION_DENIED) {
          status = 'permission_denied';
          msg = 'กรุณาอนุญาตการเข้าถึงตำแหน่งที่ตั้ง (Location Permission) ในเบราว์เซอร์ เพื่อยืนยันว่าเข้าใช้งานภายในพื้นที่บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด';
        } else if (error.code === error.TIMEOUT) {
          status = 'timeout';
          msg = 'หมดเวลาการค้นหาตำแหน่ง GPS กรุณากดตรวจสอบอีกครั้ง';
        }

        resolve({
          status,
          userCoords: null,
          distanceKm: null,
          distanceMeters: null,
          accuracyMeters: null,
          altitudeMeters: null,
          speed: null,
          heading: null,
          timestamp: new Date().toISOString(),
          errorMessage: msg,
          isAllowed: false
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Format Distance nicely in Thai
 */
export function formatDistanceThai(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) {
    return 'ไม่ทราบระยะทาง';
  }
  const meters = distanceKm * 1000;
  if (meters < 1000) {
    return `${Math.round(meters)} เมตร`;
  }
  return `${distanceKm.toFixed(2)} กิโลเมตร`;
}

/**
 * Fetch Location Check-ins (from server with localStorage fallback)
 */
export async function fetchLocationCheckIns(): Promise<EmployeeLocationCheckIn[]> {
  try {
    const res = await fetch('/api/location-checkins');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.checkIns)) {
        // Cache locally as backup
        try {
          localStorage.setItem(LOCAL_CHECKINS_STORAGE_KEY, JSON.stringify(data.checkIns.slice(0, 50)));
        } catch (e) {}
        return data.checkIns;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch check-ins from server, reading local cache', e);
  }

  // Fallback to local storage
  try {
    const local = localStorage.getItem(LOCAL_CHECKINS_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  return getInitialMockCheckIns();
}

/**
 * Record an Employee Location Check-In
 */
export async function recordEmployeeLocationCheckIn(params: {
  empId: string;
  fullName: string;
  department: string;
  position?: string;
  courseId?: string;
  courseTitle?: string;
  coords: Coordinates;
  accuracyMeters?: number;
  notes?: string;
  isBypassApproved?: boolean;
}): Promise<EmployeeLocationCheckIn> {
  const distKm = calculateDistanceKm(params.coords.lat, params.coords.lng);
  const distM = Math.round(distKm * 1000);
  const isWithin = distKm <= MAX_ALLOWED_DISTANCE_KM;

  const status: 'verified_onsite' | 'outside_geofence' | 'manual_override' =
    isWithin ? 'verified_onsite' : (params.isBypassApproved ? 'manual_override' : 'outside_geofence');

  const statusLabelTh =
    status === 'verified_onsite'
      ? 'ยืนยันพิกัดในโรงงาน (< 1.0 กม.)'
      : status === 'manual_override'
      ? 'อนุมัติกรณีพิเศษ (HR/Supervisor)'
      : 'อยู่นอกพื้นที่โรงงาน (> 1.0 กม.)';

  const checkInItem: EmployeeLocationCheckIn = {
    id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    displayTime: new Date().toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    empId: params.empId.trim().toUpperCase(),
    fullName: params.fullName,
    department: params.department || 'P',
    position: params.position || 'OPERATOR',
    courseId: params.courseId,
    courseTitle: params.courseTitle,
    lat: Number(params.coords.lat.toFixed(7)),
    lng: Number(params.coords.lng.toFixed(7)),
    accuracyMeters: params.accuracyMeters || 5,
    distanceKm: Number(distKm.toFixed(3)),
    distanceMeters: distM,
    isWithinGeofence: isWithin,
    status,
    statusLabelTh,
    deviceInfo: typeof navigator !== 'undefined' ? `${navigator.platform || ''} • ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}` : 'Web App',
    notes: params.notes,
    qrHash: `TCT-${params.empId.trim().toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  };

  // Save to server
  try {
    const res = await fetch('/api/location-checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkInItem)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.checkIn) {
        return data.checkIn;
      }
    }
  } catch (e) {
    console.warn('Server offline, saving check-in locally', e);
  }

  // Backup to localStorage
  try {
    const existing = await fetchLocationCheckIns();
    const updated = [checkInItem, ...existing.filter((x) => x.id !== checkInItem.id)].slice(0, 100);
    localStorage.setItem(LOCAL_CHECKINS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}

  return checkInItem;
}

/**
 * Initial Seed of Employee Check-ins (Realistic authentic records)
 */
export function getInitialMockCheckIns(): EmployeeLocationCheckIn[] {
  return [
    {
      id: 'chk-init-01',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      displayTime: new Date(Date.now() - 1000 * 60 * 15).toLocaleString('th-TH'),
      empId: '003290',
      fullName: 'นาย กิตติศักดิ์ ชัยชนะ',
      department: 'P',
      position: 'OPERATOR',
      courseId: 'good-employee-skills',
      courseTitle: 'ทักษะการเป็นพนักงานที่ดี',
      lat: 14.338112,
      lng: 100.627932,
      accuracyMeters: 3,
      distanceKm: 0.012,
      distanceMeters: 12,
      isWithinGeofence: true,
      status: 'verified_onsite',
      statusLabelTh: 'ยืนยันพิกัดในโรงงาน (< 1.0 กม.)',
      deviceInfo: 'Android Mobile • Chrome',
      notes: 'เช็คอินเข้าอบรม กะเช้า (Morning Shift)',
      qrHash: 'TCT-003290-SHIFT-M'
    },
    {
      id: 'chk-init-02',
      timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      displayTime: new Date(Date.now() - 1000 * 60 * 42).toLocaleString('th-TH'),
      empId: '002845',
      fullName: 'น.ส. สุภาพร รัตนศิลป์',
      department: 'PS',
      position: 'OFFICER',
      courseId: 'applied-psychology',
      courseTitle: 'จิตวิทยาประยุกต์ในการทำงาน',
      lat: 14.338045,
      lng: 100.628012,
      accuracyMeters: 4,
      distanceKm: 0.018,
      distanceMeters: 18,
      isWithinGeofence: true,
      status: 'verified_onsite',
      statusLabelTh: 'ยืนยันพิกัดในโรงงาน (< 1.0 กม.)',
      deviceInfo: 'Windows Desktop • Chrome',
      notes: 'ห้องอบรม TCT Academy อาคารบริหาร',
      qrHash: 'TCT-002845-OFFICE'
    },
    {
      id: 'chk-init-03',
      timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      displayTime: new Date(Date.now() - 1000 * 60 * 95).toLocaleString('th-TH'),
      empId: '001923',
      fullName: 'นาย ธนากร จันทร์สุข',
      department: 'P',
      position: 'LEADER',
      courseId: 'kyt-safety',
      courseTitle: 'KYT การหยั่งรู้ระวังภัย 4 ขั้นตอน',
      lat: 14.337890,
      lng: 100.627620,
      accuracyMeters: 5,
      distanceKm: 0.042,
      distanceMeters: 42,
      isWithinGeofence: true,
      status: 'verified_onsite',
      statusLabelTh: 'ยืนยันพิกัดในโรงงาน (< 1.0 กม.)',
      deviceInfo: 'iOS iPhone • Safari',
      notes: 'หน้างานไลน์ทอผ้า SEC',
      qrHash: 'TCT-001923-SEC'
    },
    {
      id: 'chk-init-04',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      displayTime: new Date(Date.now() - 1000 * 60 * 180).toLocaleString('th-TH'),
      empId: '004102',
      fullName: 'นาย สมนึก ใจดี',
      department: 'ESH',
      position: 'SAFETY OFFICER',
      courseId: 'advanced-preventive-maintenance',
      courseTitle: 'การบำรุงรักษาเชิงป้องกันชั้นสูง',
      lat: 14.338520,
      lng: 100.628210,
      accuracyMeters: 4,
      distanceKm: 0.060,
      distanceMeters: 60,
      isWithinGeofence: true,
      status: 'verified_onsite',
      statusLabelTh: 'ยืนยันพิกัดในโรงงาน (< 1.0 กม.)',
      deviceInfo: 'Android Mobile • Chrome',
      notes: 'ตรวจสอบความปลอดภัยประจำวัน',
      qrHash: 'TCT-004102-ESH'
    }
  ];
}
