import React from 'react';
import {
  ArrowRight,
  Plus,
  GitBranch,
  Layers,
  Cpu,
  BarChart2,
  Calendar,
  Mic,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  FileCode,
} from 'lucide-react';

export default function LandingPage({ onStartPlanning }) {
  const stages = [
    {
      num: '01',
      title: 'Problem Deconstruction',
      desc: 'Parses raw hackathon prompts into functional requirements, technical barriers, and user constraints.',
      icon: FileCode,
    },
    {
      num: '02',
      title: 'Architecture Syntheses',
      desc: 'Generates 3–5 distinct solution vectors differing in architecture, hardware dependency, and complexity.',
      icon: Layers,
    },
    {
      num: '03',
      title: 'Deterministic Matrix',
      desc: 'Computes weighted multi-criteria scores (feasibility 25%, innovation 20%, impact 20%, demo wow 15%, cost 10%, scalability 10%).',
      icon: BarChart2,
    },
    {
      num: '04',
      title: 'Competitive Moats',
      desc: 'Formulates concrete differentiators and defense arguments specifically prepared for judge inquiries.',
      icon: ShieldCheck,
    },
    {
      num: '05',
      title: 'Tech Stack Formulation',
      desc: 'Selects pragmatic libraries and APIs calibrated to your available team skills and hackathon timeline.',
      icon: Cpu,
    },
    {
      num: '06',
      title: 'Dataflow Architecture',
      desc: 'Generates an interactive React Flow DAG with client, service, database, and hardware node interfaces.',
      icon: GitBranch,
    },
    {
      num: '07',
      title: 'Milestone Roadmap',
      desc: 'Breaks execution into chronological sprint phases with strict MVP guidelines avoiding overengineering.',
      icon: Calendar,
    },
    {
      num: '08',
      title: 'Judge Pitch Suite',
      desc: 'Provides structured pitch assets: 30s elevator pitch, 1m live script, 3m presentation, and a 7-slide deck.',
      icon: Mic,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Workspace Hero */}
      <div className="border border-[#1e2638] bg-[#111622] rounded-lg p-6 sm:p-10 space-y-6">
        <div className="flex items-center gap-2 font-mono text-[11px] text-blue-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>HACKATHON_PLANNING_ENGINE // v1.0</span>
        </div>

        <div className="max-w-3xl space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 tracking-tight leading-tight">
            Decision-support & technical blueprinting for hackathons.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            HackX helps teams deconstruct challenge prompts, compare architectural trade-offs with deterministic scoring, plot system DAGs, and assemble complete judge presentations before writing code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={onStartPlanning}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-md flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-4 border-t border-[#1e2638] flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Weighted Scoring Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive React Flow DAGs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Structured Pitch & Slide Decks</span>
          </div>
        </div>
      </div>

      {/* The 8-Stage Architecture Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-200">
              Structured Planning Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              Each stage generates verified artifacts based on team timeline, skillsets, and hardware constraints
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {stages.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="p-4 rounded-md bg-[#111622] border border-[#1e2638] hover:border-[#2b374e] transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-blue-400 font-semibold">
                      {st.num}
                    </span>
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-200">
                    {st.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
