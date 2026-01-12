# Pathfinder: Accessible Disability Rights Education

Pathfinder is a specialized, highly accessible learning platform designed to empower individuals with disabilities to understand their rights and advocate for themselves. Developed with a focus on inclusivity, the platform provides a structured, interactive educational journey tailored to diverse learning needs.

## 🌟 Key Features

### 🧩 Inclusive Design & Accessibility
- **Personalized Onboarding**: Tailors the platform experience based on user-selected accessibility needs (Dyslexia, ADHD, Visual Impairment, etc.).
- **Dynamic Accessibility Toolbar**: Real-time adjustment of font size, contrast themes, and text spacing.
- **Easy-Read Mode**: Automatic conversion of lesson content into simplified, high-comprehension formats.
- **Text-to-Speech (TTS)**: Integrated narration for all educational materials.

### 📚 Educational Content
- **Structured Modules**: Multi-course curriculum covering ADA basics, self-advocacy, and legal rights.
- **Interactive Scenarios**: Real-world role-playing elements to practice advocacy skills.
- **Knowledge Reinforcement**: Spaced-repetition flashcards and lesson-specific quizzes.
- **Digital Dictionary**: Comprehensive library of legal and disability-related terms with simplified definitions.

### 🎮 Gamified Engagement
- **Progress Tracking**: Detailed analytics on lesson completion and time spent.
- **Achievement System**: Earn XP, level up, and unlock digital badges for milestones.
- **AI Learning Assistant**: 24/7 guidance and clarification on complex concepts.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Backend**: [Supabase](https://supabase.com/) (Auth, Database, Edge Functions)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons & Motion**: [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)

## 📁 Project Structure

```text
├── src/
│   ├── app/                    # Next.js App Router (Route Grouped)
│   │   ├── (auth)/             # Authentication flows
│   │   ├── (dashboard)/        # Main app experience (Courses, Flashcards, etc.)
│   │   └── api/                # Backend API routes
│   ├── components/             # Reusable UI & specialized accessibility components
│   ├── hooks/                  # Custom React hooks for accessibility & state
│   ├── lib/                    # Supabase client, middleware, and utility functions
│   └── styles/                 # Global styles and design tokens
├── supabase/
│   ├── migrations/             # Database schema and RLS policies
│   └── seed/                   # Initial course and dictionary data
└── public/                     # Optimized static assets and icons
```

## ⚙️ Development Setup

1. **Clone & Install**:
   ```bash
   git clone https://github.com/your-org/pathfinder.git
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Database Initialization**:
   Apply migrations to your Supabase project using the SQL editor.

4. **Run**:
   ```bash
   npm run dev
   ```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
