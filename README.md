# Academic Planner (Frontend Only)

Tech: React + Vite + TypeScript + Tailwind CSS (+ shadcn-style components)

This build is **frontend-only**. All data (auth, profile, busy slots, tasks) is stored in **localStorage** using a mock API layer in `src/lib/api.ts`.

## Run
```bash
npm install
npm run dev
```

Open: http://localhost:5173

## Implemented
- Login / Signup / Forgot Password (mocked)
- Cold-start Wizard (chronotype, attention span, busy slots painter, calendar prefs)
- Home: Dashboard widgets + Calendar/List/Kanban tabs
- Schedule modal: Category, Title, Description, Deadline (+ priority)
- Run Scheduling: simple heuristic scheduler (frontend-only)

## Notes
- Google Calendar connect is a UI stub in this frontend-only build.
