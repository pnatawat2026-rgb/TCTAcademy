export interface CourseProgressRecord {
  preTestScore: number | null;
  postTestScore: number | null;
  postTestAttempts: number;
  miniGameScore: number;
  completedModules: number[];
  evaluationSubmitted: boolean;
  evaluationAnswers?: {
    contentQuality?: number;
    understanding?: number;
    platformEase?: number;
    practicalUsage?: number;
    overallSatisfaction?: number;
    feedback?: string;
    // Standard Kirkpatrick 4-Level Evaluation fields
    trainerScore?: number;
    mediaScore?: number;
    durationScore?: number;
    knowledgeGainScore?: number;
    practicalSkillScore?: number;
    confidenceScore?: number;
    applicationPlanText?: string;
    expectedBehaviorChange?: string;
    expectedImpactText?: string;
    isExternalCourse?: boolean;
    externalProvider?: string;
    externalTrainer?: string;
    externalDate?: string;
    externalHours?: string;
    externalObjectives?: string;
    evaluationDate?: string;
    // 30-Day Follow-Up
    followUp30DaysSubmitted?: boolean;
    followUp30DaysDate?: string;
    followUp30DaysApplicationCase?: string;
    followUp30DaysResults?: string;
    followUp30DaysObstacles?: string;
    followUp30DaysEffectivenessScore?: number;
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

export interface StandardEvaluationRecord {
  id?: string;
  courseId: string;
  courseTitle: string;
  empId: string;
  employeeName: string;
  department: string;
  isExternalCourse?: boolean;
  externalProvider?: string;
  externalTrainer?: string;
  externalDate?: string;
  externalHours?: string;
  externalObjectives?: string;
  evaluationDate: string;
  
  // Level 1: Reaction & Satisfaction (1-5)
  trainerScore: number;
  contentScore: number;
  mediaScore: number;
  environmentScore: number;
  durationScore: number;
  overallSatisfaction: number;
  
  // Level 2: Learning & Understanding (1-5)
  knowledgeGainScore: number;
  practicalSkillScore: number;
  confidenceScore: number;
  
  // Level 3: Behavior & Workplace Application
  applicationPlanText: string;
  expectedBehaviorChange: string;
  applicationFrequency: 'daily' | 'weekly' | 'project_based';
  
  // Level 4: Organizational Results & Impact
  expectedImpactText: string;
  feedbackSuggestions: string;

  // 30-Day Follow-Up Tracking
  followUp30DaysSubmitted?: boolean;
  followUp30DaysDate?: string;
  followUp30DaysApplicationCase?: string;
  followUp30DaysResults?: string;
  followUp30DaysObstacles?: string;
  followUp30DaysEffectivenessScore?: number;
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
  yearsOfService?: string;
  tenure?: string;
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
    contentQuality?: number;
    understanding?: number;
    platformEase?: number;
    practicalUsage?: number;
    overallSatisfaction?: number;
    feedback?: string;
    trainerScore?: number;
    mediaScore?: number;
    durationScore?: number;
    knowledgeGainScore?: number;
    practicalSkillScore?: number;
    confidenceScore?: number;
    applicationPlanText?: string;
    expectedBehaviorChange?: string;
    expectedImpactText?: string;
    isExternalCourse?: boolean;
    externalProvider?: string;
    externalTrainer?: string;
    externalDate?: string;
    externalHours?: string;
    externalObjectives?: string;
    evaluationDate?: string;
    followUp30DaysSubmitted?: boolean;
    followUp30DaysDate?: string;
    followUp30DaysApplicationCase?: string;
    followUp30DaysResults?: string;
    followUp30DaysObstacles?: string;
    followUp30DaysEffectivenessScore?: number;
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

export type CourseFormatType = 
  | 'active_vdo_learning' // Active VDO Learning Machine
  | 'adult_learning'       // Adult Learning (Andragogy)
  | 'standard_elearning'   // Course E-Learning
  | 'sop_teachme_biz';     // SOP Teachme biz Training

export interface CourseAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface SopStep {
  id: number;
  stepNumber: number;
  title: string;
  actionDetails: string;
  keySafetyPoint?: string;
  qualityStandard?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface AdultLearningPlan {
  caseStudyTitle: string;
  scenarioDescription: string;
  problemPrompt: string;
  reflectionQuestions: string[];
  actionPlan30DaysGuidelines: string;
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
  imageUrl?: string;
  imageAlt?: string;
  isConfidential?: boolean; // ข้อมูลความลับองค์กร: ต้องตรวจสอบพิกัด GPS เฉพาะในพื้นที่บริษัท
  confidentialLevel?: 'strict' | 'standard';
  courseFormat?: CourseFormatType;
  videoUrl?: string;
  videoFilename?: string;
  attachments?: CourseAttachment[];
  sopSteps?: SopStep[];
  adultLearningPlan?: AdultLearningPlan;
}

export interface CourseModule {
  id: number;
  courseId?: string;
  title: string;
  thaiTitle: string;
  titleEn?: string;
  description?: string;
  duration?: string;
  durationMinutes?: number;
  badge?: string;
  color?: string;
  summaryPoints?: string[];
  sections: LessonSection[];
  quizQuestionIds?: number[];
  youtubeUrl?: string;
  videoTitle?: string;
  videoDurationSec?: number;
  keyTakeaway?: string;
}

export interface MiniGameScenario {
  id: number;
  title?: string;
  description?: string;
  scenario?: string;
  category?: 'Safety' | 'Quality' | 'Process' | 'Culture';
  isCorrectBehavior?: boolean;
  options?: { id: string; text: string; isCorrect: boolean }[];
  feedback?: string;
  explanation?: string;
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
  yearsOfService?: string;
  tenure?: string;
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
  firstName?: string;
  lastName?: string;
  fullName: string;
  department: string;
  position: string;
  division?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  fullNameEn?: string;
  yearsOfService?: string;
  tenure?: string;
  isMasterRecord?: boolean;
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

export interface EmployeeLocationCheckIn {
  id: string;
  timestamp: string;
  displayTime: string;
  empId: string;
  fullName: string;
  department: string;
  position?: string;
  courseId?: string;
  courseTitle?: string;
  lat: number;
  lng: number;
  accuracyMeters: number;
  distanceKm: number;
  distanceMeters: number;
  isWithinGeofence: boolean;
  status: string;
  statusLabelTh: string;
  deviceInfo?: string;
  notes?: string;
  qrHash?: string;
}

export interface KirkpatrickEvaluationItem {
  id: string;
  level: 1 | 2 | 3 | 4;
  levelNameTh: string;
  levelNameEn: string;
  topic: string;
  descriptionTh: string;
  score: number;
}

export interface KirkpatrickEvaluation {
  id: string;
  empId: string;
  fullName: string;
  department: string;
  position?: string;
  courseId: string;
  courseTitle: string;
  evaluationCode: string;
  submittedAt?: string;
  reactionScore: number;
  learningScore: number;
  behaviorScore: number;
  resultsScore: number;
  overallScore: number;
  gradeLabelTh: string;
  gradeLabelEn?: string;
  gradeBadgeColor?: string;
  isExternalOrOtherCourse?: boolean;
  externalCourseName?: string;
  items: KirkpatrickEvaluationItem[];
  strengths?: string;
  applicationPlan?: string;
  suggestions?: string;
  trainerScore?: number;
  contentScore?: number;
  overallPercentage?: number;
  recommendsCourse?: boolean;
  timestamp?: string;
  displayTime?: string;
  externalOrganizer?: string;
  externalDate?: string;
  externalLocation?: string;
  externalHours?: string;
}



