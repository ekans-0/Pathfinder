-- Fixed schema that matches the codebase expectations
-- This includes all missing tables, proper column names, and triggers

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS ai_chat_messages CASCADE;
DROP TABLE IF EXISTS user_learning_streaks CASCADE;
DROP TABLE IF EXISTS user_flashcard_progress CASCADE;
DROP TABLE IF EXISTS user_quiz_attempts CASCADE;
DROP TABLE IF EXISTS user_lesson_progress CASCADE;
DROP TABLE IF EXISTS time_sessions CASCADE;
DROP TABLE IF EXISTS user_scenario_progress CASCADE;
DROP TABLE IF EXISTS scenarios CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_answers CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS flashcard_reviews CASCADE;
DROP TABLE IF EXISTS flashcards CASCADE;
DROP TABLE IF EXISTS lesson_dictionary_terms CASCADE;
DROP TABLE IF EXISTS dictionary_terms CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS module_progress CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS course_progress CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Profiles table (extends Supabase auth.users)
-- Updated to match code expectations: display_name, experience_points
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  full_name TEXT, -- Keep for backward compatibility
  avatar_url TEXT,
  experience_points INTEGER DEFAULT 0, -- Code uses experience_points
  xp INTEGER DEFAULT 0, -- Keep for backward compatibility, will sync with experience_points
  level INTEGER DEFAULT 1,
  display_mode TEXT DEFAULT 'standard' CHECK (display_mode IN ('standard', 'easy_read', 'high_contrast')),
  text_size TEXT DEFAULT 'medium' CHECK (text_size IN ('small', 'medium', 'large', 'extra_large')),
  line_spacing TEXT DEFAULT 'normal' CHECK (line_spacing IN ('normal', 'relaxed', 'loose')),
  letter_spacing TEXT DEFAULT 'normal' CHECK (letter_spacing IN ('normal', 'wide', 'wider')),
  tts_enabled BOOLEAN DEFAULT FALSE,
  dark_mode BOOLEAN DEFAULT FALSE,
  dyslexic_font BOOLEAN DEFAULT FALSE,
  reduce_motion BOOLEAN DEFAULT FALSE,
  age_group TEXT,
  disability_types TEXT[],
  preferred_avatar JSONB,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to sync xp and experience_points
CREATE OR REPLACE FUNCTION sync_xp_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.experience_points IS DISTINCT FROM OLD.experience_points THEN
      NEW.xp := NEW.experience_points;
    ELSIF NEW.xp IS DISTINCT FROM OLD.xp THEN
      NEW.experience_points := NEW.xp;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.experience_points IS NOT NULL AND NEW.xp IS NULL THEN
      NEW.xp := NEW.experience_points;
    ELSIF NEW.xp IS NOT NULL AND NEW.experience_points IS NULL THEN
      NEW.experience_points := NEW.xp;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_xp_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_xp_columns();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, experience_points, xp, level, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    0,
    0,
    1,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  easy_read_description TEXT,
  icon TEXT,
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules table (organizes lessons within courses)
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  easy_read_description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE, -- Denormalized for easier queries
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  easy_read_content JSONB,
  estimated_time INTEGER DEFAULT 15,
  order_index INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 10,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course progress
CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Module progress
CREATE TABLE module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, module_id)
);

-- Lesson progress (legacy table, kept for compatibility)
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  time_spent INTEGER DEFAULT 0,
  UNIQUE(user_id, lesson_id)
);

-- User lesson progress (main table used by code)
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  time_spent INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Dictionary terms
CREATE TABLE dictionary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  easy_read_definition TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for lessons and dictionary terms
CREATE TABLE lesson_dictionary_terms (
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES dictionary_terms(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, term_id)
);

-- Flashcards
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  easy_read_question TEXT,
  easy_read_answer TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flashcard reviews (spaced repetition - legacy)
CREATE TABLE flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  confidence INTEGER DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 5),
  next_review_date TIMESTAMPTZ DEFAULT NOW(),
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  easiness_factor FLOAT DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  UNIQUE(user_id, flashcard_id)
);

-- User flashcard progress (main table used by code)
CREATE TABLE user_flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  confidence_level INTEGER DEFAULT 0 CHECK (confidence_level >= 0 AND confidence_level <= 5),
  next_review_date TIMESTAMPTZ DEFAULT NOW(),
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  easiness_factor FLOAT DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, flashcard_id)
);

-- Quizzes
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (module_id IS NOT NULL OR course_id IS NOT NULL OR lesson_id IS NOT NULL)
);

-- Quiz questions
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  easy_read_question TEXT,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options JSONB, -- For multiple choice options
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz answers (legacy, kept for compatibility)
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz attempts (legacy)
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- User quiz attempts (main table used by code)
CREATE TABLE user_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN DEFAULT FALSE,
  answers JSONB, -- Store user's answers
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges/Achievements
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Scenarios (avatar-based interactive learning)
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  characters JSONB NOT NULL,
  dialogue JSONB NOT NULL,
  questions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User scenario progress
CREATE TABLE user_scenario_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  responses JSONB,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, scenario_id)
);

-- Time tracking sessions
CREATE TABLE time_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- AI Chat Messages
CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Learning Streaks
CREATE TABLE user_learning_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictionary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_dictionary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scenario_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for courses
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (is_published = true);

-- RLS Policies for modules
CREATE POLICY "Anyone can view modules" ON modules FOR SELECT USING (true);

-- RLS Policies for lessons
CREATE POLICY "Anyone can view published lessons" ON lessons FOR SELECT USING (is_published = true OR auth.uid() IS NOT NULL);

-- RLS Policies for course_progress
CREATE POLICY "Users can view own course progress" ON course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own course progress" ON course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own course progress" ON course_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for module_progress
CREATE POLICY "Users can view own module progress" ON module_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own module progress" ON module_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own module progress" ON module_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for lesson_progress
CREATE POLICY "Users can view own lesson progress" ON lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lesson progress" ON lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lesson progress" ON lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_lesson_progress
CREATE POLICY "Users can view own user lesson progress" ON user_lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user lesson progress" ON user_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own user lesson progress" ON user_lesson_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own user lesson progress" ON user_lesson_progress FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for dictionary_terms
CREATE POLICY "Anyone can view dictionary terms" ON dictionary_terms FOR SELECT USING (true);
CREATE POLICY "Anyone can view lesson dictionary terms" ON lesson_dictionary_terms FOR SELECT USING (true);

-- RLS Policies for flashcards
CREATE POLICY "Anyone can view flashcards" ON flashcards FOR SELECT USING (true);

-- RLS Policies for flashcard_reviews
CREATE POLICY "Users can view own flashcard reviews" ON flashcard_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flashcard reviews" ON flashcard_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcard reviews" ON flashcard_reviews FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_flashcard_progress
CREATE POLICY "Users can view own user flashcard progress" ON user_flashcard_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user flashcard progress" ON user_flashcard_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own user flashcard progress" ON user_flashcard_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own user flashcard progress" ON user_flashcard_progress FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for quizzes
CREATE POLICY "Anyone can view quizzes" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Anyone can view quiz questions" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can view quiz answers" ON quiz_answers FOR SELECT USING (true);

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_quiz_attempts
CREATE POLICY "Users can view own user quiz attempts" ON user_quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user quiz attempts" ON user_quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own user quiz attempts" ON user_quiz_attempts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own user quiz attempts" ON user_quiz_attempts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for badges
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for scenarios
CREATE POLICY "Anyone can view scenarios" ON scenarios FOR SELECT USING (true);
CREATE POLICY "Users can view own scenario progress" ON user_scenario_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scenario progress" ON user_scenario_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scenario progress" ON user_scenario_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for time_sessions
CREATE POLICY "Users can view own time sessions" ON time_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own time sessions" ON time_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own time sessions" ON time_sessions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for ai_chat_messages
CREATE POLICY "Users can view own ai chat messages" ON ai_chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai chat messages" ON ai_chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai chat messages" ON ai_chat_messages FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_learning_streaks
CREATE POLICY "Users can view own learning streaks" ON user_learning_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning streaks" ON user_learning_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning streaks" ON user_learning_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX idx_user_lesson_progress_status ON user_lesson_progress(status);
CREATE INDEX idx_user_quiz_attempts_user_id ON user_quiz_attempts(user_id);
CREATE INDEX idx_user_quiz_attempts_quiz_id ON user_quiz_attempts(quiz_id);
CREATE INDEX idx_user_flashcard_progress_user_id ON user_flashcard_progress(user_id);
CREATE INDEX idx_user_flashcard_progress_flashcard_id ON user_flashcard_progress(flashcard_id);
CREATE INDEX idx_ai_chat_messages_user_id ON ai_chat_messages(user_id);
CREATE INDEX idx_ai_chat_messages_created_at ON ai_chat_messages(created_at);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
