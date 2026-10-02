export type UserRole = 'user' | 'admin';
export type AccountStatus = 'active' | 'suspended';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export interface College {
  id: string;
  name: string;
  code: string;
  domain?: string;
  city: string;
  state: string;
  is_active: boolean;
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  avatar_url?: string;
  bio?: string;
  college_id?: string;
  college?: College;
  department?: string;
  year_of_study?: string;
  skills: string[];
  is_available: boolean;
  preferred_categories: string[];
  max_purchase_limit: number;
  rating_avg: number;
  tasks_completed: number;
  tasks_posted: number;
  approx_lat?: number;
  approx_lng?: number;
  approx_address?: string;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  account_status: AccountStatus;
  email_verified: boolean;
  phone_verified: boolean;
  profile?: UserProfile;
  created_at: string;
  updated_at: string;
}

export interface CollegeVerification {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  college_id?: string;
  college_name?: string;
  id_card_url?: string;
  id_number?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  reviewed_by?: string;
  reviewer_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  base_suggested_fee: number;
  is_active: boolean;
}

export type TaskStatus =
  | 'DRAFT'
  | 'POSTED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'DISPUTED';

export interface Task {
  id: string;
  creator_id: string;
  creator?: {
    name: string;
    avatar_url?: string;
    rating_avg: number;
  };
  category_id: string;
  category?: TaskCategory;
  title: string;
  description: string;
  worker_fee: number;
  estimated_purchase_cost: number;
  total_budget: number;
  status: TaskStatus;
  is_urgent: boolean;
  approx_lat?: number;
  approx_lng?: number;
  approx_area?: string;
  preferred_time?: string;
  estimated_duration_min?: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  availableWorkers: number;
  totalColleges: number;
}
