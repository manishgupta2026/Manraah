const fs = require('fs');

/**
 * Graphify Tool for Manraah Codebase
 * 
 * Generates an interactive Mermaid architecture graph documenting
 * onboarding flows, React state contexts, route protection, and Neon DB connections.
 */

function generateGraph() {
  console.log("Analyzing Manraah codebase structure...");

  const mermaidGraph = [
    "```mermaid",
    "graph TD",
    "    subgraph OnboardingFlow [ Onboarding & Authentication Sequence ]",
    "        Landing[\"/ (WelcomeFlow.tsx)\"]",
    "        CatSel[\"/category-selection (CategorySelection.tsx)\"]",
    "        Assess[\"/assessment (AssessmentFlow.tsx)\"]",
    "        Score[\"/wellness-score (WellnessScoreScreen.tsx)\"]",
    "        Login[\"/login (LoginScreen.tsx)\"]",
    "        Signup[\"/signup (SignupScreen.tsx)\"]",
    "",
    "        Landing -->|\"Get Started\"| CatSel",
    "        CatSel -->|\"Continue Journey\"| Assess",
    "        Assess -->|\"View Score\"| Score",
    "        Score -->|\"Create Account\"| Signup",
    "        Score -->|\"Login\"| Login",
    "        Signup -->|\"Create Session\"| Dashboard",
    "        Login -->|\"Authenticate\"| Dashboard",
    "    end",
    "",
    "    subgraph StateContexts [ React State Contexts ]",
    "        CatCtx[\"CategoryContext.tsx (9 Bento Categories)\"]",
    "        AssessCtx[\"AssessmentContext.tsx (Serenity Score Formula)\"]",
    "    end",
    "",
    "    CatSel -.->|\"Updates Category\"| CatCtx",
    "    Assess -.->|\"Stores Answers\"| AssessCtx",
    "    Score -.->|\"Reads Serenity Score\"| AssessCtx",
    "",
    "    subgraph ProtectedCore [ Auth-Protected Core & Support Features ]",
    "        Dashboard[\"/dashboard (DashboardScreen.tsx)\"]",
    "        AIChat[\"/ai-chat (AICompanionChat.tsx)\"]",
    "        CheckIn[\"/checkin (DailyCheckInScreen.tsx)\"]",
    "        Journal[\"/journal (JournalScreen.tsx)\"]",
    "        Meditation[\"/meditation (MeditationPlayerScreen.tsx)\"]",
    "        Sleep[\"/sleep (SleepSupportScreen.tsx)\"]",
    "        Community[\"/community (CommunityScreen.tsx)\"]",
    "        Resources[\"/resources (ResourcesScreen.tsx)\"]",
    "        ProCare[\"/professional-care (ProfessionalCareScreen.tsx)\"]",
    "        Reports[\"/reports (WellnessReportsScreen.tsx)\"]",
    "        Profile[\"/profile (SettingsPrivacyScreen.tsx)\"]",
    "    end",
    "",
    "    Middleware[\"middleware.ts (Edge Route Protection)\"]",
    "    Middleware -.->|\"Enforces Session\"| ProtectedCore",
    "",
    "    subgraph BackendLayer [ Backend & Neon Database Layer ]",
    "        AuthClient[\"backend/auth/client.ts (Neon Auth Helpers)\"]",
    "        DBClient[\"backend/db/client.ts (@neondatabase/serverless)\"]",
    "        DBQueries[\"backend/queries/ (assessment, mood, journal, therapists)\"]",
    "        NeonDB[(\"Neon PostgreSQL Cloud Database\")]",
    "",
    "        Signup --> AuthClient",
    "        Signup --> DBQueries",
    "        DBQueries --> DBClient",
    "        DBClient --> NeonDB",
    "    end",
    "",
    "    subgraph DesignTokens [ Design Tokens & Aesthetics ]",
    "        Tailwind[\"tailwind.config.ts (HSL Lavender, Mint, Peach)\"]",
    "        GlobalsCSS[\"app/globals.css (Glassmorphism & Gradients)\"]",
    "    end",
    "",
    "    classDef primary fill:#7C6BC4,stroke:#5F4EA5,color:#fff;",
    "    classDef secondary fill:#5FCFB0,stroke:#006B56,color:#fff;",
    "    classDef db fill:#00725C,stroke:#004D3E,color:#fff;",
    "",
    "    class Landing,Dashboard,Score primary;",
    "    class CatCtx,AssessCtx secondary;",
    "    class NeonDB db;",
    "```"
  ].join("\n");

  const docContent = [
    "# 🕸️ Manraah Codebase Architecture & Dependency Graph",
    "",
    "Generated using **Graphify Antigravity** tool. This graph visualizes the end-to-end user journeys, state contexts, route protections, and database connections.",
    "",
    "## 📊 Visual Architectural Graph",
    "",
    mermaidGraph,
    "",
    "---",
    "",
    "## 🧩 Component & Layer Map",
    "",
    "| Layer | Path | Purpose |",
    "| :--- | :--- | :--- |",
    "| **Routing Layer** | `app/` | Thin Next.js App Router route groups (`(onboarding)`, `(core)`, `(support)`, `(account)`) |",
    "| **Frontend UI** | `frontend/components/screens/` | 21 Full feature screen components |",
    "| **State Contexts** | `frontend/lib/context/` | `CategoryContext.tsx` (9 categories) & `AssessmentContext.tsx` (Score engine) |",
    "| **Access Control** | `middleware.ts` | Edge middleware protecting `/dashboard` and core routes |",
    "| **Auth & DB Helpers** | `backend/auth/`, `backend/db/` | Neon Auth SDK client & `@neondatabase/serverless` query driver |",
    "| **Database Queries** | `backend/queries/` | Parametrized SQL query functions for assessments, mood, journal, therapists |",
    "| **Cloud Database** | Neon PostgreSQL | 7 tables (`users`, `user_assessments`, `mood_entries`, `journal_entries`, `therapists`, `community_posts`, `resources`) |"
  ].join("\n");

  const path = require('path');
  const targetPath = path.join(__dirname, '..', 'docs', 'architecture', 'ARCHITECTURE_GRAPH.md');
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, docContent);
  console.log("✓ Created docs/architecture/ARCHITECTURE_GRAPH.md successfully!");
}

generateGraph();
