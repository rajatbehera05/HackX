import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Layers,
  Cpu,
  GitBranch,
  Calendar,
  Mic,
  ShieldCheck,
  CheckCircle,
  Zap,
  BookOpen,
} from 'lucide-react';

export default function LandingPage({ onStartPlanning, onOpenPreset }) {
  const steps = [
    { title: 'Deconstruct', desc: 'Dissect functional requirements, hidden constraints, and technical hurdles.' },
    { title: 'Synthesize Ideas', desc: 'Generate 3–5 fundamentally distinct architectural approaches.' },
    { title: 'Deterministic Scoring', desc: 'Rank feasibility, innovation, and demo wow with weighted math.' },
    { title: 'Engineer Moats', desc: 'Formulate defensible differentiators and key arguments for judges.' },
    { title: 'Tailor Tech Stack', desc: 'Pragmatic tech selections matched to your exact team skills and timeline.' },
    { title: 'Interactive Flow', desc: 'Live visual system DAG mapped with React Flow nodes & protocols.' },
    { title: 'Hackathon Roadmap', desc: 'Milestone sprints with MVP rules avoiding classic hackathon traps.' },
    { title: 'Judge Pitch Suite', desc: '30s elevator, 1m quick-fire, 3m presentation, and slide deck outline.' },
  ];

  return (
    <div className="w-full space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Decision Support Engine for Hackathon Winners</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
          Turn Raw Problem Statements Into{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Winning Blueprints
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Not a generic chatbot. HackX is a structured AI planning platform that transforms vague challenge prompts into practical, differentiated, and technically validated project architectures.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartPlanning}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Solution Engine</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Deterministic Algorithm Scoring
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Interactive React Flow DAGs
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Zero-Leak Backend AI Layer
          </span>
        </div>
      </div>

      {/* 8-Stage Blueprint Process */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            The 8-Stage Hackathon Formulation Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Move step-by-step from raw problem statement to judge-ready demo
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 mb-2 block">
                  0{i + 1}
                </span>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors mb-1">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
