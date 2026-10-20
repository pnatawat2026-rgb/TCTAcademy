export interface SystemAccessConfig {
  isEnabled: boolean; // Manual Master Switch (ON / OFF)
  useDateRestriction: boolean; // Whether date window is enforced
  startDate: string; // e.g. "2026-08-24" (or any month day 24)
  endDate: string; // e.g. "2026-08-28" (or any month day 28)
  startDay: number; // 24
  endDay: number; // 28
  mode: 'date_window' | 'manual_override'; // control mode
  closedMessage: string;
}

const SYSTEM_CONFIG_KEY = 'tct_system_access_config_v1';

export const DEFAULT_SYSTEM_CONFIG: SystemAccessConfig = {
  isEnabled: true,
  useDateRestriction: false,
  startDate: '2026-08-24',
  endDate: '2026-08-28',
  startDay: 24,
  endDay: 28,
  mode: 'manual_override',
  closedMessage: 'ระบบฝึกอบรม TCT E-Training เปิดให้เข้าใช้งานเฉพาะช่วงวันที่ 24 ถึง 28 เท่านั้น หากต้องการใช้งานเพิ่มเติมกรุณาติดต่อผู้ดูแลระบบ TCT ACADEMY'
};

export const getSystemAccessConfig = (): SystemAccessConfig => {
  try {
    const saved = localStorage.getItem(SYSTEM_CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.debug('Error reading system access config', e);
  }
  return DEFAULT_SYSTEM_CONFIG;
};

export const saveSystemAccessConfig = (config: SystemAccessConfig): void => {
  try {
    localStorage.setItem(SYSTEM_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.debug('Error saving system access config', e);
  }
};

/**
 * Checks if trainee access is currently allowed.
 * Conditions:
 * 1. If isEnabled is false -> LOCKED
 * 2. If useDateRestriction is true:
 *    - Check if current day of month is between startDay (24) and endDay (28)
 *    - OR check if current Date string is between startDate and endDate
 */
export const checkTraineeAccessStatus = (config: SystemAccessConfig = getSystemAccessConfig()): {
  isAllowed: boolean;
  reason: 'active' | 'manually_disabled' | 'outside_date_window';
  details: string;
} => {
  if (!config.isEnabled) {
    return {
      isAllowed: false,
      reason: 'manually_disabled',
      details: 'ระบบถูกปิดการใช้งานชั่วคราวโดยผู้ดูแลระบบ (Admin Manual OFF)'
    };
  }

  if (config.useDateRestriction) {
    const now = new Date();
    const currentDay = now.getDate(); // 1 - 31
    const currentDateStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Check by day of month (24 to 28) or explicit date range
    const isWithinDayRange = currentDay >= config.startDay && currentDay <= config.endDay;
    const isWithinDateRange = config.startDate && config.endDate 
      ? (currentDateStr >= config.startDate && currentDateStr <= config.endDate)
      : true;

    // Allowed if within either the designated day range (24-28) or specified date window
    if (!isWithinDayRange && !isWithinDateRange) {
      return {
        isAllowed: false,
        reason: 'outside_date_window',
        details: `ขณะนี้อยู่นอกช่วงเวลาเปิดรับการฝึกอบรม (เปิดใช้งานเฉพาะวันที่ ${config.startDay} - ${config.endDay})`
      };
    }
  }

  return {
    isAllowed: true,
    reason: 'active',
    details: 'ระบบเปิดให้เข้าใช้งานตามปกติ'
  };
};
