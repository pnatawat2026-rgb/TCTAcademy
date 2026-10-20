export interface CourseProgressRecord {
  preTestScore: number | null;
  postTestScore: number | null;
  postTestAttempts: number;
  miniGameScore: number;
  completedModules: number[];
  evaluationSubmitted: boolean;
  evaluationAnswers?: {
    contentQuality: number;
    understanding: number;
    platformEase: number;
    practicalUsage: number;
    overallSatisfaction: number;
    feedback: string;
  };
  certificateId?: string;
  certificateDate?: string;
  videoWatchSeconds?: Record<number, number>;
  aiReadinessScore?: {
    partA: number;
    partB: number;
    total: number;
    level: string;
    completedAt: string;
  };
  lastActiveView?: ViewState;
  lastActiveStep?: string;
  lastActiveModuleId?: number;
  lastActiveTimestamp?: string;
}

export interface UserProfile {
  empId: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  prefix?: string;
  position?: string;
  department: string;
  division?: string;
  role?: string;
  enrolledAt: string;
  preTestScore: number | null;
  preTestTotal: number;
  postTestScore: number | null;
  postTestTotal: number;
  postTestAttempts: number;
  miniGameScore: number;
  completedModules: number[]; // e.g. [1, 2, 3, 4, 5, 6]
  evaluationSubmitted: boolean;
  evaluationAnswers?: {
    contentQuality: number;
    understanding: number;
    platformEase: number;
    practicalUsage: number;
    overallSatisfaction: number;
    feedback: string;
  };
  certificateId?: string;
  certificateDate?: string;
  selectedCourseId?: string; // 'risk-management' | 'advanced-preventive-maintenance' | 'conflict-management' | 'ai-for-tct' | 'personality-psychology'
  enrolledCourses?: string[];
  coursesProgress?: Record<string, CourseProgressRecord>;
  aiReadinessScore?: {
    partA: number;
    partB: number;
    total: number;
    level: string;
    completedAt: string;
  };
  lastActiveView?: ViewState;
  lastActiveStep?: string;
  lastActiveModuleId?: number;
  lastActiveTimestamp?: string;
}

export interface Choice {
  id: string; // 'a' | 'b' | 'c' | 'd'
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  moduleId: number;
  questionText: string;
  choices: Choice[];
  explanation: string;
}

export interface ShuffledQuestion {
  id: number;
  moduleId: number;
  questionText: string;
  shuffledChoices: Choice[];
  explanation: string;
}

export interface LessonSection {
  id: string;
  title: string;
  content: string[];
  bulletPoints?: string[];
  keyHighlight?: string;
  interactiveType?: 
    | 'risk_matrix' 
    | 'hierarchy_controls' 
    | '5_whys' 
    | 'rca_whys' 
    | 'near_miss_chart' 
    | 'roi_calc'
    | 'vibration_threshold'
    | 'pf_curve_sim'
    | 'rcm_fmea_matrix'
    | 'conflict_iceberg'
    | 'tki_matrix'
    | 'nvc_practice'
    | 'winwin_negotiation'
    | 'ai_tool_matcher'
    | 'ai_privacy_guard'
    | 'th_ai_passport_flow'
    | 'prompt_ctft_builder'
    | 'ai_action_plan_30_60_90'
    | 'ai_scenario_sim'
    | 'th_ai_passport_portal_action';
}

export interface Course {
  id: string;
  title: string;
  thaiTitle?: string;
  titleEn?: string;
  description: string;
  moduleCount?: number;
  badge?: string;
  url?: string;
  color?: string;
  code?: string;
  duration?: string;
  estimatedHours?: number;
  passingScore?: number;
  passingCriteria?: string;
}

export interface CourseModule {
  id: number;
  courseId: string; // Add this
  title: string;
  thaiTitle: string;
  titleEn?: string;
  description?: string;
  durationMinutes: number;
  badge: string;
  color: string;
  summaryPoints: string[];
  sections: LessonSection[];
  quizQuestionIds: number[];
  youtubeUrl?: string;
  videoTitle?: string;
  videoDurationSec?: number;
}

export interface MiniGameScenario {
  id: number;
  scenario: string;
  category: 'Safety' | 'Quality' | 'Process' | 'Culture';
  isCorrectBehavior: boolean;
  explanation: string;
}

export type ViewState = 
  | 'welcome'
  | 'login'
  | 'courses'
  | 'guidance'
  | 'dashboard'
  | 'ai-readiness'
  | 'pretest'
  | 'module1'
  | 'module2'
  | 'module3'
  | 'module4'
  | 'module5'
  | 'module6'
  | 'module7'
  | 'game'
  | 'posttest'
  | 'evaluation'
  | 'certificate'
  | 'report'
  | 'followup30'
  | 'admin'
  | 'approver'
  | 'executive';

export interface AttemptHistoryItem {
  attemptNumber: number;
  type: string;
  score?: number;
  passed?: boolean;
  timestamp: string;
  detail?: string;
}

export interface ActivityNotification {
  id: string;
  timestamp: string;
  empId: string;
  fullName: string;
  department: string;
  action: string;
  detail: string;
  score?: number;
}

export interface TraineeRecord {
  id: string;
  empId: string;
  fullName: string;
  prefix?: string;
  department: string;
  position?: string;
  division?: string;
  notes?: string;
  enrolledAt: string;
  completedAt?: string;
  status: 'passed' | 'in_progress' | 'not_started';
  preTestScore: number | null;
  postTestScore: number | null;
  postTestAttempts: number;
  miniGameScore: number;
  completedModules: number[];
  evaluationSubmitted: boolean;
  satisfactionScore?: number;
  certificateId?: string;
  certificateDate?: string;
  selectedCourseId?: string;
  enrolledCourses?: string[];
  coursesProgress?: Record<string, CourseProgressRecord>;
  lastActiveView?: ViewState;
  lastActiveStep?: string;
  lastActiveModuleId?: number;
  lastActivityAt?: string;
  currentStep?: string;
  examRank?: number;
  attemptsHistory?: AttemptHistoryItem[];
}

export interface CapaItem {
  id: string;
  code: string;
  title: string;
  category: 'Safety' | 'Quality' | 'Curriculum' | 'Exam' | 'Platform';
  problemStatement: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  responsiblePerson: string;
  department: string;
  targetDate: string;
  status: 'open' | 'in_progress' | 'completed';
  effectivenessResult?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  empId: string;
  action: 'pre_test_submitted' | 'module_completed' | 'post_test_passed' | 'post_test_failed' | 'cert_issued' | 'profile_updated' | 'admin_imported' | 'data_cleared';
  detail: string;
  ipAddress?: string;
}

export interface PredefinedEmployee {
  empId: string;
  prefix: string;
  firstName: string;
  lastName: string;
  fullName: string;
  department: string;
  position: string;
  division?: string;
}

export type TrainingActionType =
  | 'login'
  | 'auto_logout'
  | 'manual_logout'
  | 'session_timeout'
  | 'course_selected'
  | 'pretest_start'
  | 'pretest_submit'
  | 'module_start'
  | 'module_complete'
  | 'video_watch'
  | 'game_complete'
  | 'posttest_start'
  | 'posttest_submit'
  | 'evaluation_submit'
  | 'certificate_issued'
  | 'profile_update';

export interface TrainingLogEntry {
  id: string;
  timestamp: string; // ISO 8601 string
  displayTime: string; // Thai readable string
  empId: string;
  fullName: string;
  department: string;
  position?: string;
  courseId: string;
  courseName?: string;
  action: TrainingActionType;
  detail: string;
  score?: number | null;
  maxScore?: number | null;
  durationSeconds?: number;
  deviceInfo?: string;
  isAutoLogout?: boolean;
}

export interface TrainingTrackingSummary {
  totalTrainees: number;
  activeTrainees: number;
  passedTrainees: number;
  inProgressTrainees: number;
  notStartedTrainees: number;
  totalLogsCount: number;
  autoLogoutsCount: number;
  averagePostTestScore: number;
  lastActivityTime?: string;
}



