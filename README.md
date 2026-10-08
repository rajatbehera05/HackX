# HackX — AI-Powered Hackathon Solution Planning Platform

> **Transform raw problem statements into practical, differentiated, and technically feasible hackathon blueprints.**

HackX is not a generic chatbot. It is a **structured AI decision-support and project planning platform** designed specifically for hackathon participants, student developers, and innovation teams. Given a problem statement, HackX guides teams through an end-to-end decision engine to formulate, rank, architect, and rehearse a winning project solution.

---

## 🌟 The Core Journey

```text
Problem Statement
       ↓
Understand (Deconstruct Requirements & Constraints)
       ↓
Generate Ideas (3–5 Distinct Technical Approaches)
       ↓
Compare Ideas (Deterministic Multi-Criteria Math)
       ↓
Select Best Idea (Algorithm Recommendation)
       ↓
Generate Differentiators (Competitive Moats & Judge Hooks)
       ↓
Recommend Tech Stack (Calibrated for Timeline & Skills)
       ↓
Generate Architecture (Interactive React Flow DAG)
       ↓
Generate Roadmap (Milestone Sprints & MVP Rules)
       ↓
Generate Pitch (30s Elevator, 1m Script, 3m Demo, 7-Slide Deck)
       ↓
Save Project Workspace & Dashboard
```

---

## 🚀 Key Features

1. **Problem Statement Analyzer**
   - Automatically detects domain (Healthcare, ClimateTech, FinTech, Smart Cities, IoT, Accessibility, etc.).
   - Assesses complexity (Easy, Medium, Hard) with technical hurdle explanations.
   - Identifies target users, functional requirements, technical needs, constraints, and keywords.
   - Provides a plain-English translation to ensure the whole team understands the core mission.

2. **Multi-Vector Solution Generator**
   - Generates **3 to 5 genuinely diverse** solutions rather than variations of the same idea.
   - Evaluates each vector across 7 dimensions (Innovation, Feasibility, Complexity, Cost, Impact, Demo Wow, Scalability).

3. **Deterministic Idea Comparison & Ranking Engine**
   - Evaluates solutions using weighted application logic:
     - Feasibility: **25%**
     - Innovation: **20%**
     - Impact: **20%**
     - Demo Potential: **15%**
     - Cost Value: **10%**
     - Scalability: **10%**
   - Visualizes multi-dimensional trade-offs using Recharts Radar & Bar charts.
   - Highlights the mathematically recommended top pick for the team's available timeline.

4. **Competitive Moats & Differentiators**
   - Formulates practical product advantages (automation, real-time sync, offline-first, edge processing).
   - Generates high-impact "Why Judges Choose This Solution" arguments across problem relevance, technical depth, and innovation.

5. **Pragmatic Tech Stack Recommender**
   - Recommends categorized components (Frontend, Backend, Database, AI/ML, APIs, Auth, Hardware, DevOps).
   - Only recommends AI/ML or hardware when genuinely relevant.
   - Provides concrete justifications based on team skills and time constraints (8h, 24h, 3d, 1w, 2w).

6. **Interactive System Architecture Visualizer**
   - Generates dynamic directed acyclic graphs (DAGs) visualized with **React Flow**.
   - Custom node styling for Client, API Gateway, Database, AI Engine, and Hardware.
   - Full zoom, pan, minimap, and connection protocol labels.

7. **Time-Budgeted Development Roadmap**
   - Adapts to team duration (8h / 24h / 3d / 1w / 2w).
   - Establishes a strict "Golden MVP Rule" to prevent hackathon scope creep.
   - Identifies phase objectives, tangible deliverables, and pitfalls to avoid.

8. **Judge Pitch Coach & Presentation Suite**
   - **30-Second Elevator Pitch:** Hook, Problem, Solution, Call to Action.
   - **1-Minute Hackathon Script:** Full spoken text for quick-fire demo sessions.
   - **3-Minute Judge Presentation:** Problem, live demo strategy, technical architecture, and Q&A hooks.
   - **7-Slide Deck Outline:** Slide titles, talking points, and visual asset suggestions.

9. **Team Role Allocation & Skill Gap Defense**
   - Assigns responsibilities per team member based on stated skills.
   - Flags missing skills and provides actionable hackathon workarounds.

10. **Persistent Project Workspace & Dashboard**
    - Save, reopen, update, and manage multiple hackathon plans.
    - Works out of the box with **Supabase PostgreSQL** and includes an automatic memory store for local friction-free development.

---

## 🛠️ Technology Stack

- **Frontend:**
  - React 19 + Vite
  - Tailwind CSS
  - Lucide React
  - React Flow (`@xyflow/react`)
  - Recharts
- **Backend:**
  - Node.js + Express.js
  - Zod (Runtime JSON schema validation)
  - CORS, Dotenv
- **AI Integration:**
  - Google Gemini API (`@google/generative-ai`)
  - **Zero-Leak Architecture:** Gemini API key is strictly maintained on the Express backend; frontend never touches secrets.
- **Database & Auth:**
  - Supabase (PostgreSQL with Row Level Security policies)
  - Supabase Auth (Email / Password)

---

## 🏗️ Architecture & Security

```text
React 19 Frontend (Vite)
       │ (REST / JWT)
       ▼
Express.js Backend (Port 5000)
       │
       ├── Auth Middleware (Supabase JWT verify)
       ├── AI Service Layer (Zod validation + JSON salvage)
       │         │
       │         └── Gemini Provider (Google Gemini API)
       │
       └── Database Adapter (Supabase PostgreSQL / Dev Memory Store)
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+
- A Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))
- (Optional) A free [Supabase](https://supabase.com/) account

### 1. Clone & Setup
```bash
git clone https://github.com/your-username/HackX.git
cd HackX
```

### 2. Configure Environment Variables
Copy the templates:
```bash
cp .env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Required for AI generation:
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# Optional: Supabase PostgreSQL credentials
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

> **Note:** If Supabase keys are left empty, HackX automatically runs in **Dev Memory Mode**, allowing immediate local usage and testing!

### 3. Setup Supabase Database (Optional)
If using Supabase, copy the contents of `backend/db/schema.sql` and run it in your **Supabase SQL Editor** to create tables, indexes, triggers, and Row Level Security policies.

### 4. Run Backend
```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:5000`. Test health:
```bash
curl http://localhost:5000/api/health
```

### 5. Run Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🚢 Deployment

### Frontend (Vercel)
1. Import repository into Vercel.
2. Root directory: `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Set environment variables:
   - `VITE_API_URL`: Your deployed Render backend URL (e.g. `https://hackx-api.onrender.com/api`).
   - `VITE_SUPABASE_URL`: Your Supabase URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

### Backend (Render)
1. Create a Web Service on Render pointing to `backend/`.
2. Build command: `npm install`.
3. Start command: `node server.js`.
4. Set environment variables:
   - `GEMINI_API_KEY`
   - `FRONTEND_URL` (Your Vercel URL)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 📄 License
MIT License. Built for hackathon participants worldwide.
