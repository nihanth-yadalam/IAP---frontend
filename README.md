# L1 Intelligent Academic Planner — Frontend

<p align="center">
  AI-powered academic scheduling with energy-based planning, Google Calendar sync, and behavioral analytics
</p>

---

## 📖 Project Overview

**L1: Intelligent Academic Planner** is a web-based productivity platform designed to solve the disconnect between planning and execution that students face daily. Unlike passive calendar applications that treat every hour as equal, L1 uses AI to model the user's habits, learning style, and energy levels to create realistic, achievable schedules.

### The Problem
Students face three critical planning challenges:
- **Optimism Bias**: Consistent underestimation of task durations
- **Mental Energy**: Standard calendars ignore human fatigue and burnout
- **Dynamic Chaos**: Missed deadlines make static calendars obsolete

### The Solution
L1 integrates academic context (deadlines, course difficulty) with behavioral health (burnout risk, procrastination patterns) to create a personalized, adaptive scheduling system that moves beyond "managing time" to **managing energy and focus**.

### Core Innovation
- **"Cold Start" Solution**: Initial profiling questionnaire establishes baseline user archetype
- **"Digital Twin" Memory**: Rolling "Reflexion" architecture learns user patterns over time
- **Energy-Based Scheduling**: Feedback loop records task drain to prevent burnout
- **Google Calendar Integration**: Seamless two-way sync with existing workflows

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **UI Components**: Shadcn/UI + Tailwind CSS
- **Calendar**: React-Big-Calendar
- **Visualization**: Recharts

---

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # Shadcn UI components
│   │   ├── layout/                # App layout & sidebar
│   │   ├── calendar/              # Calendar views
│   │   ├── AuthLayout.tsx         # Auth page wrapper
│   │   ├── CalendarView.tsx       # Week/Day calendar
│   │   ├── KanbanView.tsx         # Task board view
│   │   ├── ListView.tsx           # List view
│   │   ├── ScheduleDialog.tsx     # Task creation/edit
│   │   └── theme-provider.tsx     # Dark/Light theme
│   ├── pages/
│   │   ├── Home.tsx               # Landing page
│   │   ├── LoginPage.tsx          # Sign in
│   │   ├── SignupPage.tsx         # Sign up
│   │   ├── ForgotPassword.tsx     # Password recovery
│   │   ├── ResetPasswordPage.tsx  # Password reset
│   │   ├── WizardPage.tsx         # Onboarding wizard
│   │   ├── CalendarPage.tsx       # Main calendar
│   │   ├── TasksPage.tsx          # Tasks view
│   │   ├── KanbanPage.tsx         # Kanban view
│   │   ├── SettingsPage.tsx       # Settings
│   │   └── GoogleCallbackPage.tsx # OAuth callback
│   ├── context/
│   │   └── auth.tsx               # Auth context
│   ├── stores/
│   │   ├── useAuthStore.ts        # Auth state (Zustand)
│   │   ├── useCourseStore.ts      # Courses state
│   │   └── useTaskStore.ts        # Tasks state
│   ├── lib/
│   │   ├── api.ts                 # API client
│   │   └── utils.ts               # Utility functions
│   ├── routes/
│   │   ├── App.tsx                # Main routes
│   │   └── Protected.tsx           # Protected route wrapper
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Entry point
│   └── styles/                    # Global styles
├── public/                        # Static assets
├── package.json                   # Dependencies
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind CSS config
└── README.md                      # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running (see backend repo for setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🔐 Key Features Explained

### 1. **Authentication & Authorization** (Epic 1)
- Secure signup/login with JWT tokens
- Password recovery via email links
- OAuth2 integration for Google Calendar
- Profile personalization

### 2. **Onboarding Wizard** (Epic 2)
Upon first login, users complete:
- **Profiling Questionnaire**: Chronotype (Night Owl/Early Bird), subject confidence, preferred study block duration
- **Fixed Schedule Setup**: Input recurring commitments (classes, labs, etc.)
- **Google Calendar Sync**: Automatically import existing events and export planned tasks

### 3. **Task Management** (Story 3.1 - Current)
- **Manual Task Entry**: Create tasks by selecting calendar slots
- Task details: Title, deadlines, priority, category, and course association
- Multiple view modes: Calendar, Kanban, and List views

### 4. **AI-Powered Features** (In Development)
- Time estimation based on historical performance
- Energy-aware scheduling
- Intelligent task decomposition for large projects
- Feedback loop to refine predictions

---

## 🔄 Data Flow

```
User Input (Signup/Onboarding)
    ↓
User Profile Created (Cold Start Data)
    ↓
Tasks Entered Manually or via AI
    ↓
Tasks Scheduled to Calendar
    ↓
User Completes Tasks & Provides Feedback
    ↓
Feedback Loop Updates User Memory (Reflexion Agent)
    ↓
AI Adapts Future Predictions & Scheduling
```

---

## 🎨 UI Components

Key reusable components from Shadcn/UI:
- `calendar.tsx` - Date picker
- `card.tsx` - Content containers
- `dialog.tsx` - Modals for task creation/editing
- `button.tsx` - Interactive buttons
- `input.tsx` - Form inputs
- `select.tsx` - Dropdown selectors
- `tabs.tsx` - View mode switching
- `badge.tsx` - Status indicators
- `avatar.tsx` - User avatars

---

## 🔗 API Integration

The frontend communicates with the backend API for:

| Endpoint | Purpose |
|----------|---------|
| `/auth/signup` | Create new account |
| `/auth/login` | User authentication |
| `/auth/refresh` | Refresh JWT token |
| `/auth/forgot-password` | Password recovery |
| `/users/{id}` | Get/update user profile |
| `/courses` | Manage courses |
| `/fixed-slots` | Set recurring schedule |
| `/tasks` | CRUD operations on tasks |
| `/tasks/{id}/logs` | Submit completion feedback |
| `/google/callback` | OAuth2 callback handler |

---

## 📄 License

See LICENSE file for details.

---


**Last Updated**: February 2026  
**Implementation Status**: Sprint 1 (Epics 1, 2, and Story 3.1 complete)
