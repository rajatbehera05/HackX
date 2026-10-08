/**
 * HackX Modular Prompts for Gemini
 * Each prompt returns a system instruction and user prompt expecting strict JSON output.
 */

export const prompts = {
  problemAnalysis: (project) => ({
    systemPrompt: `You are HackX, an elite hackathon mentor and technical architect.
Your objective is to dissect raw problem statements into structured, professional, and razor-sharp analysis.
You MUST output ONLY a valid JSON object matching the requested schema. No markdown formatting outside JSON.`,
    userPrompt: `Analyze this hackathon problem statement:
---
PROBLEM STATEMENT:
${project.problem_statement || project.problemStatement}

TEAM CONTEXT:
- Team Size: ${project.team_size || project.teamSize || 'Not specified'}
- Skills: ${project.team_skills || project.teamSkills || 'General Fullstack'}
- Time Budget: ${project.development_time || project.developmentTime || '24 hours'}
- Available Budget: ${project.budget || 'Minimal / Student friendly'}
- Hardware: ${project.hardware || 'None'}
---

Respond with a JSON object strictly having this format:
{
  "summary": "2-3 concise sentences summarizing the core issue and mission",
  "domain": "Single clean domain name (e.g., Healthcare, FinTech, Smart Cities, Agriculture, EdTech, Cybersecurity, IoT, Accessibility, ClimateTech)",
  "simpleExplanation": "Plain, jargon-free explanation understandable by a high schooler",
  "targetUsers": ["User group 1", "User group 2", "User group 3"],
  "functionalRequirements": ["Core system must do X", "Must do Y", "Must support Z", "Must provide W"],
  "technicalRequirements": ["Tech need 1 (e.g. low-latency real-time sync)", "Tech need 2", "Tech need 3"],
  "constraints": ["Key constraint 1 (e.g. offline availability)", "Key constraint 2", "Key constraint 3"],
  "challenges": ["Technical/practical challenge 1", "Technical/practical challenge 2", "Challenge 3"],
  "difficulty": "Easy" | "Medium" | "Hard",
  "difficultyReason": "Why this difficulty was assigned based on domain complexity and technical hurdles",
  "keywords": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`
  }),

  ideaGeneration: (project, analysis) => ({
    systemPrompt: `You are HackX Solution Architect. Generate 3 to 4 GENUINELY DIFFERENT, HIGH-IMPACT solution directions for a hackathon.
DO NOT provide variations of the same idea. Each idea must represent a distinct architectural or product paradigm (e.g. 1: lightweight progressive web app / community-driven, 2: automated AI agent/pipeline, 3: edge/hardware/offline-first or specialized integration).
Scores must be realistic integer numbers from 1 to 10.
Return ONLY valid JSON.`,
    userPrompt: `PROBLEM CONTEXT:
Problem: ${project.problem_statement || project.problemStatement}
Summary: ${analysis?.summary || ''}
Domain: ${analysis?.domain || 'General'}
Key Challenges: ${(analysis?.challenges || []).join(', ')}

TEAM RESTRICTIONS:
- Time: ${project.development_time || project.developmentTime || '24 hours'}
- Team Size: ${project.team_size || project.teamSize || '1'}
- Skills: ${project.team_skills || project.teamSkills || 'Full-stack'}
- Hardware: ${project.hardware || 'None'}

Generate 3-4 diverse ideas in this JSON structure:
{
  "ideas": [
    {
      "title": "Compelling, memorable product title",
      "concept": "Punchy one-liner concept pitch",
      "description": "Comprehensive explanation of what is built and how it functions",
      "howItSolves": "Specific explanation of how this tackles root causes of the problem statement",
      "features": ["Key Feature 1", "Key Feature 2", "Key Feature 3", "Key Feature 4"],
      "technicalApproach": "Engineering approach describing data flow and core components",
      "requiredTech": ["Tech 1", "Tech 2", "Tech 3", "Tech 4"],
      "innovationScore": 8, // 1 to 10
      "feasibilityScore": 9, // 1 to 10 (consider the user's available time!)
      "complexityScore": 6, // 1 to 10
      "costScore": 9, // 1 to 10 (10 = super affordable/free-tier, 1 = expensive)
      "impactScore": 9, // 1 to 10
      "demoScore": 9, // 1 to 10 (how visually wowing or interactive is the live demo)
      "scalabilityScore": 8 // 1 to 10
    }
  ]
}`
  }),

  differentiators: (project, idea) => ({
    systemPrompt: `You are HackX Winning Strategist. You help hackathon teams formulate unassailable competitive advantages and win judges' ballots.
Focus on pragmatic technical moats, user delight, and tangible impact, avoiding hollow marketing buzzwords.
Return ONLY valid JSON.`,
    userPrompt: `SELECTED SOLUTION:
Title: ${idea.title}
Concept: ${idea.concept}
Description: ${idea.description}
Tech: ${(idea.required_tech || idea.requiredTech || []).join(', ')}

ORIGINAL PROBLEM:
${project.problem_statement || project.problemStatement}

Provide practical differentiators and judge pitch arguments in this JSON format:
{
  "differentiators": [
    {
      "category": "Unique Feature" | "Automation & AI" | "UX & Accessibility" | "Speed & Performance" | "Cost & Offline",
      "title": "Title of Differentiator",
      "description": "Concrete technical or functional distinction from existing conventional alternatives",
      "implementationHint": "Actionable way to demo this during a 3-minute hackathon presentation"
    }
  ],
  "judgePitchReasons": [
    {
      "pillar": "Problem Relevance" | "Technical Depth" | "Innovation Factor" | "Practical Feasibility" | "Real Impact",
      "headline": "Punchy point for judges",
      "argument": "Substantive reason why judges should award top marks to this solution"
    }
  ]
}`
  }),

  techStack: (project, idea) => ({
    systemPrompt: `You are HackX Lead Systems Architect.
Recommend a coherent, production-ready, hackathon-tested tech stack tailored to the team's skills and time limit.
Only recommend AI/ML or Hardware if genuinely essential.
Return ONLY valid JSON.`,
    userPrompt: `PROJECT CONTEXT:
Title: ${idea.title}
Concept: ${idea.concept}
Time Available: ${project.development_time || project.developmentTime || '24 hours'}
Team Skills: ${project.team_skills || project.teamSkills || 'JavaScript, React'}
Hardware: ${project.hardware || 'None'}

Recommend the tech stack in this JSON format:
{
  "categories": [
    {
      "category": "Frontend" | "Backend" | "Database" | "AI/ML" | "APIs & Services" | "Auth & Security" | "Deployment & DevOps" | "Hardware & IoT",
      "technology": "Specific framework or tool (e.g. Next.js, FastAPI, PostgreSQL, Supabase, Tailwind CSS, Vercel)",
      "purpose": "What this technology handles in this specific project",
      "whyRecommended": "Why this is optimal given the team's skills and timeline constraints"
    }
  ],
  "stackSummary": "One paragraph justifying why this combined stack maximizes shipping speed and demo stability."
}`
  }),

  architecture: (project, idea, techStack) => ({
    systemPrompt: `You are HackX Cloud & Systems Visualizer.
Generate a clean, structured system architecture DAG designed for interactive React Flow visualization.
Node types can be 'client', 'api', 'database', 'ai', 'service', 'external'.
Nodes must have reasonable (x, y) coordinates for a readable, hierarchical top-to-bottom or left-to-right flow.
Connections must have source, target, and meaningful labels.
Return ONLY valid JSON.`,
    userPrompt: `PROJECT:
Title: ${idea.title}
Description: ${idea.description}
Tech Stack: ${JSON.stringify(techStack || {})}

Generate a React Flow compatible architecture schema:
{
  "overview": "2-3 sentences explaining the high-level architecture pattern",
  "nodes": [
    {
      "id": "node-1",
      "label": "User / Browser Client",
      "type": "client",
      "description": "Responsive Web Interface built with React & Tailwind",
      "tech": "React + Vite",
      "position": { "x": 250, "y": 50 }
    },
    {
      "id": "node-2",
      "label": "API Gateway / Backend Server",
      "type": "api",
      "description": "Express REST server managing sessions, workflow orchestration",
      "tech": "Node.js / Express",
      "position": { "x": 250, "y": 180 }
    },
    {
      "id": "node-3",
      "label": "Database & Storage",
      "type": "database",
      "description": "Relational storage for user profiles and project analyses",
      "tech": "PostgreSQL / Supabase",
      "position": { "x": 100, "y": 320 }
    },
    {
      "id": "node-4",
      "label": "AI Engine / LLM Service",
      "type": "ai",
      "description": "Model reasoning pipeline for structured insights",
      "tech": "Google Gemini API",
      "position": { "x": 400, "y": 320 }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "node-1", "target": "node-2", "label": "HTTPS REST / JWT" },
    { "id": "e2-3", "source": "node-2", "target": "node-3", "label": "SQL queries" },
    { "id": "e2-4", "source": "node-2", "target": "node-4", "label": "Prompt API calls" }
  ]
}`
  }),

  roadmap: (project, idea) => ({
    systemPrompt: `You are HackX Hackathon Sprint Coach.
Produce an aggressively realistic, milestone-based sprint roadmap budgeted precisely for the user's available time.
Emphasize shipping a working MVP first before cosmetic additions.
Return ONLY valid JSON.`,
    userPrompt: `PROJECT:
Title: ${idea.title}
Available Time: ${project.development_time || project.developmentTime || '24 hours'}
Team Size: ${project.team_size || project.teamSize || '2'}
Team Skills: ${project.team_skills || project.teamSkills || 'Web development'}

Generate a phase-by-phase roadmap in this JSON format:
{
  "timeframe": "${project.development_time || '24 hours'}",
  "mvpRule": "Single golden rule for the team to prevent scope creep",
  "phases": [
    {
      "phaseNumber": 1,
      "name": "Phase Name (e.g. Foundation & Repo Setup)",
      "duration": "e.g. Hours 0 - 3",
      "objectives": ["Goal 1", "Goal 2"],
      "deliverables": ["Deliverable 1", "Deliverable 2"],
      "pitfallsToAvoid": "Specific trap students fall into during this phase"
    }
  ]
}`
  }),

  pitch: (project, idea, differentiators) => ({
    systemPrompt: `You are HackX Pitch Coach. You train hackathon teams to deliver high-scoring, captivating pitches to judges.
Generate three distinct pitch formats (30-second elevator pitch, 1-minute hackathon pitch, 3-minute comprehensive judge presentation) plus a slide-deck outline.
Return ONLY valid JSON.`,
    userPrompt: `PROJECT:
Title: ${idea.title}
Concept: ${idea.concept}
Problem: ${project.problem_statement || project.problemStatement}
Differentiators: ${JSON.stringify(differentiators || {})}

Generate pitch materials in this JSON format:
{
  "pitch30s": {
    "duration": "30 Seconds (Elevator Pitch)",
    "hook": "Attention-grabbing opening line",
    "problem": "Pain point highlighted",
    "solution": "Our solution in one sentence",
    "callToAction": "Closing punchline"
  },
  "pitch1m": {
    "duration": "60 Seconds (Hackathon Quick Fire)",
    "script": "Full verbatim script designed to be delivered comfortably in 60 seconds",
    "keyTakeaways": ["Point 1", "Point 2", "Point 3"]
  },
  "pitch3m": {
    "duration": "3 Minutes (Full Judge Presentation)",
    "sections": [
      { "part": "Problem & Context (0:00 - 0:30)", "content": "What to say" },
      { "part": "Our Solution & Demo (0:30 - 1:30)", "content": "What to show live" },
      { "part": "Technical Architecture & Innovation (1:30 - 2:15)", "content": "Why it's technically impressive" },
      { "part": "Market Viability & Impact (2:15 - 2:45)", "content": "Real-world reach" },
      { "part": "Future Scope & Q&A Hook (2:45 - 3:00)", "content": "Strong conclusion" }
    ]
  },
  "slideDeck": [
    { "slideNumber": 1, "title": "Problem Statement", "talkingPoints": ["Point 1", "Point 2"], "visualSuggestion": "Graphic/stat idea" },
    { "slideNumber": 2, "title": "The Solution", "talkingPoints": ["Point 1", "Point 2"], "visualSuggestion": "Product mockup" },
    { "slideNumber": 3, "title": "How It Works", "talkingPoints": ["Point 1", "Point 2"], "visualSuggestion": "Flow diagram" },
    { "slideNumber": 4, "title": "Technical Architecture", "talkingPoints": ["Point 1", "Point 2"], "visualSuggestion": "Architecture DAG" },
    { "slideNumber": 5, "title": "Competitive Differentiator", "talkingPoints": ["Point 1", "Point 2"], "visualSuggestion": "Comparison matrix" },
    { "slideNumber": 6, "title": "Impact & Scalability", "talkingPoints": ["Point 1", "Point 2"], "visualSuggestion": "Metrics & trajectory" },
    { "slideNumber": 7, "title": "Roadmap & Team", "talkingPoints": ["Point 1", "Point 2"], "visualSuggestion": "Milestone timeline" }
  ]
}`
  }),

  teamRoles: (project, idea) => ({
    systemPrompt: `You are HackX Team Coordinator.
Given the team size, skills, and selected project, assign practical roles to team members, identifying potential skill gaps and mitigation tips.
Return ONLY valid JSON.`,
    userPrompt: `TEAM CONTEXT:
Team Size: ${project.team_size || project.teamSize || '3'}
Team Skills: ${project.team_skills || project.teamSkills || 'React, Python, SQL'}
Timeframe: ${project.development_time || project.developmentTime || '24 hours'}
Project: ${idea.title} - ${idea.concept}

Generate roles in this JSON format:
{
  "roles": [
    {
      "member": "Member 1",
      "primaryRole": "e.g. Lead Frontend & UI/UX",
      "responsibilities": ["Build interactive dashboard", "Polish responsive styles"],
      "skillsUsed": "React, Tailwind"
    }
  ],
  "identifiedSkillGaps": ["Any missing skill needed for this project"],
  "mitigationAdvice": "Pragmatic hackathon advice on how to bypass gaps (e.g. use managed APIs / prebuilt templates)"
}`
  })
};
