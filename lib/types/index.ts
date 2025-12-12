export type UserRole =
  | "student"
  | "instructor"
  | "support_admin"
  | "system_admin";
export type UserStatus = "active" | "inactive" | "pending" | "locked";
export type ApprovalStatus =
  | "pending"
  | "interviewing"
  | "approved"
  | "rejected";
export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "archived";
export type EnrollmentStatus = "active" | "completed" | "dropped";
export type LessonType = "video" | "document" | "quiz" | "assignment";
export type ProgressStatus = "not_started" | "in_progress" | "completed";
export type QuestionType = "multiple_choice" | "true_false" | "fill_blank";
export type PaymentMethod = "bank_card" | "e_wallet" | "bank_transfer";
export type TransactionStatus = "pending" | "completed" | "failed" | "refunded";
export type NotificationType = "course" | "payment" | "message" | "system";
export type SupportCategory = "technical" | "payment" | "content" | "other";
export type SupportPriority = "low" | "medium" | "high" | "urgent";
export type SupportStatus = "open" | "in_progress" | "resolved" | "closed";

export interface User {
  user_id: number;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login?: string | null;
}

export interface InstructorProfile {
  profile_id: number;
  user_id: number;
  bio?: string | null;
  education?: string | null;
  experience?: string | null;
  certificates?: string | null;
  approval_status: ApprovalStatus;
  approved_by?: number | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  user?: AuthenticatedUser;

  cv_url?: string | null;
  cv_file_name?: string | null;
  cv_uploaded_at?: string | null;

  intro_video_url?: string | null;
  interview_date?: string | null;
  interview_notes?: string | null;

  certificate_files?: {
    url: string;
    file_name: string;
    file_size: number;
    uploaded_at: string;
  }[];
}

export interface Category {
  category_id: number;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: number | null;
  display_order: number;
}

export interface Course {
  course_id: number;
  instructor_id: number;
  category_id?: number | null;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail_url?: string | null;
  level: CourseLevel;
  language: string;
  price: number;
  discount_price?: number | null;
  duration_hours: number;
  status: CourseStatus;
  approval_status: ApprovalStatus;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  total_students: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
  published_at?: string | null;

  instructor?: AuthenticatedUser;
  category?: Category;
  sections?: Section[];
  tags?: CourseTag[];
  is_enrolled?: boolean;
}

export interface CourseTag {
  tag_id: number;
  name: string;
  slug: string;
}

export interface Section {
  section_id: number;
  course_id: number;
  title: string;
  description?: string | null;
  display_order: number;
  created_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  lesson_id: number;
  section_id: number;
  title: string;
  description?: string | null;
  lesson_type: LessonType;
  video_url?: string | null;
  video_bucket?: string | null;
  video_key?: string | null;
  video_uploaded_at?: string | null;
  video_duration: number;
  content?: string | null;
  allow_preview: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  resources?: LessonResource[];
  quiz?: Quiz;
  approval_status: ApprovalStatus;
  rejection_reason?: string | null;
}

export interface LessonResource {
  resource_id: number;
  lesson_id: number;
  title: string;
  file_url: string;
  file_type?: string | null;
  file_size?: number | null;
  uploaded_at: string;
}

export interface CourseForm {
  title: string;
  description: string;
  category_id: number;
  level: CourseLevel;
  language: string;
  price: number;
  discount_price?: number;
  thumbnail_url?: string;
  duration_hours: number;
  tag_ids?: number[];
}

/**
 * Dữ liệu cho form tạo/cập nhật Section
 */
export interface SectionForm {
  title: string;
  description?: string;
  display_order: number;
}

/**
 * Dữ liệu cho form tạo/cập nhật Lesson
 */
export interface LessonForm {
  title: string;
  description?: string;
  lesson_type: LessonType;
  video_url?: string;
  video_bucket?: string;
  video_key?: string;
  video_uploaded_at?: string;
  video_duration?: number;
  content?: string;
  allow_preview: boolean;
  display_order: number;
}

export interface LessonUploadResponse {
  lesson_id: number;
  bucket: string;
  key: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
}

export type LiveSessionType = "group" | "one_on_one" | "webinar";
export type LiveSessionStatus = "scheduled" | "completed" | "cancelled";
export type AttendanceStatus = "registered" | "attended" | "absent";

export interface SessionRegistration {
  registration_id: number;
  session_id: number;
  student_id: number;
  attendance_status: AttendanceStatus;
  joined_at?: string | null;
  left_at?: string | null;
  student?: {
    user_id: number;
    full_name: string;
    avatar_url?: string | null;
  };
}

export interface LiveSession {
  session_id: number;
  course_id?: number | null;
  instructor_id: number;
  session_type: LiveSessionType;
  title: string;
  description?: string | null;
  scheduled_start: string;
  scheduled_end: string;
  capacity: number;
  meeting_provider: string;
  meeting_link?: string | null;
  status: LiveSessionStatus;
  calendar_event_id?: string | null;
  course?: Course;
  instructor?: {
    user_id: number;
    full_name: string;
    email?: string;
  };
  registrations?: SessionRegistration[];
  created_at?: string;
  updated_at?: string;
}

export interface Quiz {
  quiz_id: number;
  lesson_id: number;
  title: string;
  description?: string | null;
  time_limit?: number | null;
  passing_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  show_correct_answers: boolean;
  created_at: string;
  questions?: Question[];
}

export interface Question {
  question_id: number;
  quiz_id: number;
  question_text: string;
  question_type: QuestionType;
  points: number;
  display_order: number;
  explanation?: string | null;
  options?: AnswerOption[];
}

export interface AnswerOption {
  option_id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
  display_order: number;
}

export interface Enrollment {
  enrollment_id: number;
  student_id: number;
  course_id: number;
  enrolled_at: string;
  completion_percentage: number;
  status: EnrollmentStatus;
  completed_at?: string | null;
  certificate_issued: boolean;

  course: Course;
  lessonProgress: LessonProgress[];
}

export interface StudentStats {
  total_courses_enrolled: number;
  total_courses_completed: number;
  total_hours_learned: number;
}

export interface RecentActivity {
  type: "lesson_completed" | "quiz_submitted" | "course_enrolled";
  title: string;
  course_title: string;
  timestamp: string;
}

export interface LessonProgress {
  progress_id: number;
  enrollment_id: number;
  lesson_id: number;
  status: ProgressStatus;
  video_progress: number;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface QuizAttempt {
  attempt_id: number;
  student_id: number;
  quiz_id: number;
  started_at: string;
  submitted_at?: string | null;
  score?: number | null;
  passed?: boolean | null;
  time_taken?: number | null;
}

export interface StudentAnswer {
  answer_id: number;
  attempt_id: number;
  question_id: number;
  selected_option_id?: number | null;
  answer_text?: string | null;
  is_correct?: boolean | null;
  points_earned: number;
}

export interface Transaction {
  transaction_id: number;
  student_id: number;
  transaction_code: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method?: PaymentMethod | null;
  payment_gateway?: string | null;
  status: TransactionStatus;
  payment_at?: string | null;
  refunded_at?: string | null;
  created_at: string;
  student?: {
    full_name: string;
    email: string;
  };
  details?: TransactionDetail[];
}

export interface TransactionDetail {
  detail_id: number;
  transaction_id: number;
  course_id: number;
  price: number;
  discount: number;
  final_price: number;
  course?: {
    title: string;
    thumbnail_url?: string | null;
  };
}

export interface Review {
  review_id: number;
  course_id: number;
  student_id: number;
  rating: number;
  comment?: string | null;
  status: ApprovalStatus;
  created_at: string;
  updated_at: string;
}

export interface QaDiscussion {
  discussion_id: number;
  lesson_id: number;
  student_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  student?: AuthenticatedUser;
  replies?: QaReply[];
}

export interface QaReply {
  reply_id: number;
  discussion_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user?: AuthenticatedUser;
}

export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  course_id?: number | null;
  message_text: string;
  is_read: boolean;
  sent_at: string;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  content?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface SupportTicket {
  ticket_id: number;
  user_id: number;
  category: SupportCategory;
  subject: string;
  description: string;
  priority: SupportPriority;
  status: SupportStatus;
  assigned_to?: number | null;
  created_at: string;
  resolved_at?: string | null;
  user?: User;
  replies?: SupportReply[];
}

export interface SupportReply {
  reply_id: number;
  ticket_id: number;
  user_id: number;
  reply_text: string;
  created_at: string;
}

export interface SystemSetting {
  setting_id: number;
  setting_key: string;
  setting_value?: string | null;
  description?: string | null;
  updated_at: string;
}

/**
 * Cấu trúc response chung từ API
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

/**
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

/**
 * Dữ liệu người dùng trả về sau khi xác thực (không chứa password_hash)
 * Thường được tạo bởi một hàm serialize ở backend.
 */
export interface AuthenticatedUser {
  id: number;
  user_id?: number;
  email: string;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  instructor_profile?: InstructorProfile | null;
}

/**
 * Dữ liệu cho API đăng nhập
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Dữ liệu cho API đăng ký
 */
export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: "student" | "instructor";
}

/**
 * Dữ liệu cho form cập nhật profile
 */
export interface UpdateProfileForm {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  status?: UserStatus;
}

/**
 * Dữ liệu cho form đổi mật khẩu
 */
export interface ChangePasswordForm {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

/**
 * Dữ liệu cho form ứng tuyển giảng viên
 */
export interface InstructorApplicationForm {
  bio: string;
  education: string;
  experience: string;
  certificates: string;

  cv_url: string;
  intro_video_url: string;
}
export interface InstructorSummary {
  total_students: number;
  total_revenue: number;
  average_rating: number;
  pending_questions_count: number;
  total_courses: number;
  total_enrollments: number;
  revenue_over_time: { month: string; revenue: number }[];
  enrollments_over_time: { month: string; enrollments: number }[];
  recent_enrollments: {
    enrollment_id: number;
    enrolled_at: string;
    student: { full_name: string; avatar_url?: string };
    course: { title: string };
  }[];
  top_courses: {
    course_id: number;
    total_revenue: number;
    course: { title: string };
  }[];
}

interface ActionItemQuestion {
  discussion_id: number;
  course: { course_id: number; title: string };
  user: { user_id: number; full_name: string; avatar_url?: string };
  content: string;
  created_at: string;
}

interface ActionItemReview {
  review_id: number;
  course: { course_id: number; title: string };
  student: { user_id: number; full_name: string; avatar_url?: string };
  rating: number;
  comment: string;
  created_at: string;
}

export interface ActionItems {
  pending_questions: ActionItemQuestion[];
  recent_reviews: ActionItemReview[];
}
