export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  experience_points: number;
  level: number;
  display_mode: 'standard' | 'easy_read' | 'high_contrast';
  text_size: 'small' | 'medium' | 'large' | 'extra_large';
  line_spacing: 'normal' | 'relaxed' | 'loose';
  letter_spacing: 'normal' | 'wide' | 'wider';
  tts_enabled: boolean;
  dark_mode: boolean;
  dyslexic_font: boolean;
  reduce_motion: boolean;
  age_group?: 'teen' | 'adult';
  disability_types?: string[];
  preferred_avatar?: any;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration?: number;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: any;
  easy_read_content?: any;
  order_index: number;
  duration?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  time_spent: number;
  last_accessed_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  created_at: string;
}

export interface DictionaryTerm {
  id: string;
  term: string;
  definition: string;
  easy_read_definition?: string;
  example_usage?: string;
  related_terms?: string[];
  category?: string;
  created_at: string;
  updated_at: string;
}
