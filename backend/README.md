# Manraah Backend & Data Layer

This folder holds all data models, type definitions, database client initialization, and server-side query stubs for the Manraah platform. It is kept completely separate from the React/Next.js frontend code in `src/`.

## Directory Structure

```
backend/
├── db/
│   └── client.ts         # Provider-agnostic database client init (TODO stub)
├── types/
│   └── index.ts          # Shared TypeScript interfaces (User, MoodEntry, JournalEntry, Therapist, etc.)
└── queries/
    ├── mood.ts           # Mood log & check-in query stubs
    ├── journal.ts        # Journal entry query stubs
    ├── therapists.ts     # Therapist directory query stubs
    ├── community.ts      # Community discussion query stubs
    └── resources.ts      # Psychoeducation resource query stubs
```

## Database Provider Note
The database provider choice is **not yet finalized** (e.g. Supabase, PostgreSQL, Firebase, or MongoDB). All query functions in `backend/queries/` and `backend/db/client.ts` are provider-agnostic stubs with clear `TODO` markers. When a database provider is chosen, implement the SDK connection in `backend/db/client.ts` and fill in the query logic in `backend/queries/` without modifying any UI components in `src/`.
