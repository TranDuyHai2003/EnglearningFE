//ENUMS

export type UserRole =
  | "student"
  | "instructor"
  | "support_admin"
  | "system_admin";
export type UserStatus = "active" | "inactive" | "pending" | "locked";
export type ApprovalStatus = "pending" | "approved" | "rejected";
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
export type ReviewStatus = "pending" | "approved" | "rejected";
export type NotificationType = "course" | "payment" | "message" | "system";
export type TicketCategory = "technical" | "payment" | "content" | "other";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

//USER & AUTH

export interface User {
  user_id: number;
  email: string;
  password_hash?: string; // Don't send to frontend
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface InstructorProfile {
  profile_id: number;
  user_id: number;
  bio?: string;
  education?: string;
  experience?: string;
  certificates?: string;
  approval_status: ApprovalStatus;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
}

//COURSES

export interface Category {
  category_id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  display_order: number;
}

export interface Course {
  course_id: number;
  instructor_id: number;
  category_id?: number;
  title: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  level: CourseLevel;
  language: string;
  price: number;
  discount_price?: number;
  duration_hours: number;
  status: CourseStatus;
  approval_status: ApprovalStatus;
  reviewed_by?: number;
  reviewed_at?: string;
  rejection_reason?: string;
  total_students: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CourseTag {
  tag_id: number;
  name: string;
  slug: string;
}

export interface CourseTagMapping {
  course_id: number;
  tag_id: number;
}

//LESSONS

export interface Section {
  section_id: number;
  course_id: number;
  title: string;
  description?: string;
  display_order: number;
  created_at: string;
}

export interface Lesson {
  lesson_id: number;
  section_id: number;
  title: string;
  description?: string;
  lesson_type: LessonType;
  video_url?: string;
  video_duration: number;
  content?: string;
  allow_preview: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LessonResource {
  resource_id: number;
  lesson_id: number;
  title: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  uploaded_at: string;
}

//QUIZZES

export interface Quiz {
  quiz_id: number;
  lesson_id: number;
  title: string;
  description?: string;
  time_limit?: number;
  passing_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  show_correct_answers: boolean;
  created_at: string;
}

export interface Question {
  question_id: number;
  quiz_id: number;
  question_text: string;
  question_type: QuestionType;
  points: number;
  display_order: number;
  explanation?: string;
}

export interface AnswerOption {
  option_id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
  display_order: number;
}

//ENROLLMENTS

export interface Enrollment {
  enrollment_id: number;
  student_id: number;
  course_id: number;
  enrolled_at: string;
  completion_percentage: number;
  status: EnrollmentStatus;
  completed_at?: string;
  certificate_issued: boolean;
}

export interface LessonProgress {
  progress_id: number;
  enrollment_id: number;
  lesson_id: number;
  status: ProgressStatus;
  video_progress: number;
  started_at?: string;
  completed_at?: string;
}

export interface QuizAttempt {
  attempt_id: number;
  student_id: number;
  quiz_id: number;
  started_at: string;
  submitted_at?: string;
  score?: number;
  passed?: boolean;
  time_taken?: number;
}

export interface StudentAnswer {
  answer_id: number;
  attempt_id: number;
  question_id: number;
  selected_option_id?: number;
  answer_text?: string;
  is_correct?: boolean;
  points_earned: number;
}

//TRANSACTIONS

export interface Transaction {
  transaction_id: number;
  student_id: number;
  transaction_code: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method?: PaymentMethod;
  payment_gateway?: string;
  status: TransactionStatus;
  payment_at?: string;
  refunded_at?: string;
  created_at: string;
}

export interface TransactionDetail {
  detail_id: number;
  transaction_id: number;
  course_id: number;
  price: number;
  discount: number;
  final_price: number;
}

//REVIEWS

export interface Review {
  review_id: number;
  course_id: number;
  student_id: number;
  rating: number; // 1-5
  comment?: string;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

//Q&A

export interface QADiscussion {
  discussion_id: number;
  lesson_id: number;
  student_id: number;
  question: string;
  created_at: string;
  updated_at: string;
}

export interface QAReply {
  reply_id: number;
  discussion_id: number;
  user_id: number;
  reply_text: string;
  created_at: string;
  updated_at: string;
}

//MESSAGES

export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  course_id?: number;
  message_text: string;
  is_read: boolean;
  sent_at: string;
}

//NOTIFICATIONS

export interface Notification {
  notification_id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  content?: string;
  is_read: boolean;
  created_at: string;
}

//SUPPORT

export interface SupportTicket {
  ticket_id: number;
  user_id: number;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to?: number;
  created_at: string;
  resolved_at?: string;
}

export interface SupportReply {
  reply_id: number;
  ticket_id: number;
  user_id: number;
  reply_text: string;
  created_at: string;
}

//SYSTEM

export interface SystemSetting {
  setting_id: number;
  setting_key: string;
  setting_value?: string;
  description?: string;
  updated_at: string;
}

//API RESPONSES

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

//AUTH

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: "student" | "instructor";
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

//COURSE WITH RELATIONS

export interface CourseWithInstructor extends Course {
  instructor: User;
  category?: Category;
  tags?: CourseTag[];
}

export interface CourseWithDetails extends Course {
  instructor: User;
  sections: SectionWithLessons[];
  enrollments_count: number;
  reviews_count: number;
}

export interface SectionWithLessons extends Section {
  lessons: Lesson[];
}

export interface LessonWithResources extends Lesson {
  resources: LessonResource[];
  quiz?: Quiz;
}

//ENROLLMENT WITH PROGRESS

export interface EnrollmentWithCourse extends Enrollment {
  course: Course;
  progress: LessonProgress[];
}

//TRANSACTION WITH DETAILS

export interface TransactionWithDetails extends Transaction {
  details: TransactionDetail[];
  courses?: Course[];
}

//QUIZ WITH QUESTIONS

export interface QuizWithQuestions extends Quiz {
  questions: QuestionWithOptions[];
}

export interface QuestionWithOptions extends Question {
  options: AnswerOption[];
}

//FORM TYPES

export interface UpdateProfileForm {
  full_name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
}

export interface ChangePasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface InstructorApplicationForm {
  bio: string;
  education: string;
  experience: string;
  certificates: string;
}

export interface CreateCourseForm {
  title: string;
  description: string;
  category_id: number;
  level: CourseLevel;
  price: number;
  discount_price?: number;
  thumbnail_url?: string;
}

export interface CreateSectionForm {
  title: string;
  description?: string;
  display_order: number;
}

export interface CreateLessonForm {
  title: string;
  description?: string;
  lesson_type: LessonType;
  video_url?: string;
  content?: string;
  allow_preview: boolean;
  display_order: number;
}
