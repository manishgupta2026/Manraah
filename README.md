# Manraah — AI-Powered Mental Wellness Platform

**Manraah** is a compassionate, lifestyle-oriented AI wellness sanctuary designed to bridge high-tech artificial intelligence capabilities with soft, organic human wellness care. It offers multi-demographic tailored dashboards (Students, Working Professionals, Parents, Senior Citizens), an interactive AI Companion, 1-on-1 verified professional therapy booking, daily check-ins, mindful journaling, ambient sleep soundscapes, and 24/7 crisis support.

---

## 🚀 Sequential User Onboarding & Auth Flow

```text
Landing (/) 
  -> Category Selection (/category-selection) 
  -> Assessment (/assessment) 
  -> Wellness Score (/wellness-score)   [Dynamic serenity score & recommendations]
  -> Signup / Login (/signup, /login)    [Persists assessment to DB]
  -> Dashboard (/dashboard)              [Auth protected via middleware]
```

---

## 🏗️ Project Architecture & Folder Split

The codebase separates Next.js App Router routing, frontend UI components, and provider-agnostic backend data logic:

```text
Manraah/
├── app/                       # THIN Next.js App Router Layer ONLY
│   ├── (onboarding)/          # Route group: Welcome (/), Category Selection, Assessment, Wellness Score, Login, Signup
│   ├── (core)/                # Route group: Dashboard, AI Chat, Check-in, Journal, Meditation, Sleep
│   ├── (support)/             # Route group: Community, Resources, Professional Care, Human Companion, Crisis Support, Reports
│   ├── (account)/             # Route group: Profile & Privacy Settings
│   ├── call/                  # Contextual Telehealth Call Page
│   ├── globals.css            # Tailwind baseline & custom gradients
│   └── layout.tsx             # Root layout with fonts, AppShell & Providers
│
├── frontend/                  # REAL HOME for all UI Code
│   ├── components/
│   │   ├── shell/             # AppShell, DesktopSidebar, MobileTabBar, Header
│   │   ├── screens/           # 21 Feature & Onboarding Screen Components
│   │   └── ui/                # Reusable UI Primitives (Button, Card, Badge)
│   └── lib/
│       ├── context/           # CategoryContext.tsx, AssessmentContext.tsx
│       ├── mock-data.ts       # Shared Mock Data (types imported from backend/types)
│       └── constants.ts      # Main Nav Items, Mobile Tabs & Category Config
│
├── backend/                   # Provider-Agnostic Data & Server Layer
│   ├── auth/                  # Neon Auth / Better Auth helpers (client.ts)
│   ├── db/                    # Provider-independent DB client stub (client.ts)
│   ├── types/                 # Shared TypeScript Interfaces (User, AssessmentResult, Mood, Journal, etc.)
│   ├── queries/               # Feature Data Query Stubs (assessment.ts, mood.ts, journal.ts, etc.)
│   └── README.md              # Backend documentation
│
├── middleware.ts              # Route protection & session redirection
└── public/
    └── images/                # Localized static image assets & SVG logo
```

---

## 🗺️ Route Mapping Table

| Public Route | Route Group Folder | Screen Component | Access Control |
| :--- | :--- | :--- | :--- |
| `/` | `app/(onboarding)/page.tsx` | [`WelcomeFlow.tsx`](file:///z:/Manraah/frontend/components/screens/WelcomeFlow.tsx) | Public Onboarding |
| `/category-selection` | `app/(onboarding)/category-selection/` | [`CategorySelection.tsx`](file:///z:/Manraah/frontend/components/screens/CategorySelection.tsx) | Public Onboarding |
| `/assessment` | `app/(onboarding)/assessment/` | [`AssessmentFlow.tsx`](file:///z:/Manraah/frontend/components/screens/AssessmentFlow.tsx) | Public Onboarding |
| `/wellness-score` | `app/(onboarding)/wellness-score/` | [`WellnessScoreScreen.tsx`](file:///z:/Manraah/frontend/components/screens/WellnessScoreScreen.tsx) | Public Onboarding |
| `/login` | `app/(onboarding)/login/` | [`LoginScreen.tsx`](file:///z:/Manraah/frontend/components/screens/LoginScreen.tsx) | Public Auth |
| `/signup` | `app/(onboarding)/signup/` | [`SignupScreen.tsx`](file:///z:/Manraah/frontend/components/screens/SignupScreen.tsx) | Public Auth |
| `/dashboard` | `app/(core)/dashboard/` | [`DashboardScreen.tsx`](file:///z:/Manraah/frontend/components/screens/DashboardScreen.tsx) | 🔒 Auth Protected |
| `/ai-chat` | `app/(core)/ai-chat/` | [`AICompanionChat.tsx`](file:///z:/Manraah/frontend/components/screens/AICompanionChat.tsx) | 🔒 Auth Protected |
| `/checkin` | `app/(core)/checkin/` | [`DailyCheckInScreen.tsx`](file:///z:/Manraah/frontend/components/screens/DailyCheckInScreen.tsx) | 🔒 Auth Protected |
| `/journal` | `app/(core)/journal/` | [`JournalScreen.tsx`](file:///z:/Manraah/frontend/components/screens/JournalScreen.tsx) | 🔒 Auth Protected |
| `/meditation` | `app/(core)/meditation/` | [`MeditationPlayerScreen.tsx`](file:///z:/Manraah/frontend/components/screens/MeditationPlayerScreen.tsx) | 🔒 Auth Protected |
| `/sleep` | `app/(core)/sleep/` | [`SleepSupportScreen.tsx`](file:///z:/Manraah/frontend/components/screens/SleepSupportScreen.tsx) | 🔒 Auth Protected |
| `/community` | `app/(support)/community/` | [`CommunityScreen.tsx`](file:///z:/Manraah/frontend/components/screens/CommunityScreen.tsx) | 🔒 Auth Protected |
| `/resources` | `app/(support)/resources/` | [`ResourcesScreen.tsx`](file:///z:/Manraah/frontend/components/screens/ResourcesScreen.tsx) | 🔒 Auth Protected |
| `/professional-care` | `app/(support)/professional-care/` | [`ProfessionalCareScreen.tsx`](file:///z:/Manraah/frontend/components/screens/ProfessionalCareScreen.tsx) | 🔒 Auth Protected |
| `/professional-care/[id]` | `app/(support)/professional-care/[therapistId]/` | [`TherapistProfileScreen.tsx`](file:///z:/Manraah/frontend/components/screens/TherapistProfileScreen.tsx) | 🔒 Auth Protected |
| `/human-companion` | `app/(support)/human-companion/` | [`HumanCompanionStub.tsx`](file:///z:/Manraah/frontend/components/screens/HumanCompanionStub.tsx) | 🔒 Auth Protected |
| `/crisis-support` | `app/(support)/crisis-support/` | [`CrisisSupportScreen.tsx`](file:///z:/Manraah/frontend/components/screens/CrisisSupportScreen.tsx) | 🔒 Auth Protected |
| `/reports` | `app/(support)/reports/` | [`WellnessReportsScreen.tsx`](file:///z:/Manraah/frontend/components/screens/WellnessReportsScreen.tsx) | 🔒 Auth Protected |
| `/profile` | `app/(account)/profile/` | [`SettingsPrivacyScreen.tsx`](file:///z:/Manraah/frontend/components/screens/SettingsPrivacyScreen.tsx) | 🔒 Auth Protected |
| `/call` | `app/call/` | [`ActiveSessionScreen.tsx`](file:///z:/Manraah/frontend/components/screens/ActiveSessionScreen.tsx) | 🔒 Auth Protected |

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build for production & verify compilation
npm run build
```
