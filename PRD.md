# HACKX — MASTER PRODUCT REQUIREMENTS & BUILD SPECIFICATION

## 1. PRODUCT OVERVIEW
- **Product Name:** HackX
- **Product Type:** AI-powered web application for hackathon and project solution planning.
- **Core Purpose:** Transform a raw problem statement into a structured, practical, and differentiated project plan.
- **Workflow Journey:**
  `Problem Statement → Understand → Generate Ideas → Compare → Select Best Idea → Differentiators → Tech Stack → Architecture → Roadmap → Pitch → Save Project`

HackX is positioned not as a generic chatbot or summarizer, but as an **AI-powered decision-support and project planning platform** that helps teams make concrete decisions and build realistic solutions.

---

## 2. PRIMARY PRODUCT GOALS
Answers the 10 key questions for hackathon teams:
1. What exactly is the problem?
2. Who has this problem?
3. What are the important requirements and constraints?
4. What different solutions could we build?
5. Which solution is best for our team?
6. How can we make that solution different?
7. Which technologies should we use?
8. What should the architecture look like?
9. How should we build it within our available time?
10. How should we present it to judges?

---

## 3. TARGET USERS
- **Primary:** College students, hackathon participants, student developer teams, beginner/intermediate developers.
- **Secondary:** College project teams, innovation teams, prototype planners.

---

## 4. TECHNOLOGY STACK
- **Frontend:** React, Vite, JavaScript, Tailwind CSS, Lucide icons, React Flow, Recharts.
- **Backend:** Node.js, Express.js.
- **Database:** Supabase (PostgreSQL).
- **Authentication:** Supabase Auth (Email / Password).
- **AI Integration:** Google Gemini API (`@google/genai` or `@google/generative-ai`), strictly proxied via Express AI service layer with Zod validation.
- **Visualization:** React Flow (architecture DAG), Recharts (multi-criteria comparison spider/bar charts).
- **Deployment:** Frontend: Vercel, Backend: Render, DB: Supabase.

---

## 5. ARCHITECTURE & AI SERVICE DESIGN
- **Client-Server Privacy:** Frontend NEVER holds `GEMINI_API_KEY`. Frontend communicates via REST to Express backend with Supabase JWT bearer tokens.
- **AI Service Abstraction:** Dedicated provider architecture (`backend/services/ai/aiService.js`, `geminiProvider.js`) supporting prompt modularity and future alternative models.
- **Structured JSON Outputs:** AI responses enforced to return valid JSON schemas, parsed and validated with Zod with defensive recovery & retry.
- **Deterministic Logic:** Weighted idea scoring, ranking, timeline calculations, and progress tracking calculated deterministically on the server/client, not left to LLM guesswork.

---

## 6. DATABASE SCHEMA SPECIFICATION (Supabase PostgreSQL)
- **`projects`**:
  `id (UUID)`, `user_id (UUID)`, `title`, `problem_statement`, `team_size`, `team_skills`, `development_time`, `budget`, `hardware`, `created_at`, `updated_at`
- **`analyses`**:
  `id (UUID)`, `project_id (UUID)`, `summary`, `domain`, `target_users (JSONB)`, `requirements (JSONB)`, `technical_requirements (JSONB)`, `constraints (JSONB)`, `challenges (JSONB)`, `difficulty`, `difficulty_reason`, `keywords (JSONB)`, `created_at`
- **`ideas`**:
  `id (UUID)`, `project_id (UUID)`, `title`, `concept`, `description`, `features (JSONB)`, `technical_approach`, `required_tech (JSONB)`, `innovation_score (1-10)`, `feasibility_score (1-10)`, `complexity_score (1-10)`, `cost_score (1-10)`, `impact_score (1-10)`, `demo_score (1-10)`, `scalability_score (1-10)`, `is_recommended (BOOL)`, `created_at`
- **`selected_solutions`**:
  `id (UUID)`, `project_id (UUID)`, `idea_id (UUID)`, `differentiators (JSONB)`, `judge_pitch_reasons (JSONB)`, `tech_stack (JSONB)`, `architecture (JSONB)`, `roadmap (JSONB)`, `pitch (JSONB)`, `team_roles (JSONB)`, `created_at`, `updated_at`

---

## 7. FEATURE BREAKDOWN (V1 MVP)
1. **Problem Input & Validation:** Long-form statement + context (team size, skills, dev time: 8h/24h/3d/1w/2w, budget, hardware).
2. **Problem Analyzer:** Domain classification, target users, functional & technical requirements, constraints, challenges, difficulty explanation, keywords.
3. **Solution Idea Generator:** 3–5 distinct solution vectors scored across 7 dimensions (1–10).
4. **Deterministic Comparison:** Weighted scoring: Feasibility 25%, Innovation 20%, Impact 20%, Demo 15%, Cost 10%, Scalability 10%.
5. **Differentiator Generator:** Moat/differentiator catalog + "Why Judges Choose This" points.
6. **Tech Stack Recommender:** Granular frontend, backend, database, AI/ML (if relevant), APIs, auth, hardware, deployment with justifications based on skills & timeline.
7. **Interactive Architecture Generator:** React Flow visual interactive node-edge graph with zoom, pan, mobile layout.
8. **Development Roadmap:** Practical time-budgeted phases (Setup, MVP, Integration, Polish, Pitch) adapted to the chosen time window.
9. **Pitch Generator:** 30s elevator, 1m hackathon pitch, 3m judge presentation + 7-slide deck blueprint.
10. **Dashboard & Project Workspace:** Persistent project management, tabbed workspace, exportable/printable view, deletion, status indicators.
11. **Supabase Auth & RLS:** Secure per-user access control.
