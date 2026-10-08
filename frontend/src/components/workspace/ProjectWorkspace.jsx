import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  BarChart2,
  Cpu,
  GitBranch,
  Calendar,
  Mic,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';
import { api } from '../../services/api';
import ArchitectureFlow from './ArchitectureFlow';
import ComparisonChart from './ComparisonChart';

export default function ProjectWorkspace({ project, onProjectUpdated }) {
  const [activeTab, setActiveTab] = useState('analysis');
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState(null);

  // Local copy of project state
  const [currentProject, setCurrentProject] = useState(project);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  const analysis = currentProject?.analysis;
  const ideas = currentProject?.ideas || [];
  const solution = currentProject?.selectedSolution;
  const selectedIdeaId = solution?.idea_id || ideas[0]?.id;
  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId) || ideas[0];

  // Helper to trigger backend AI generation
  const handleGenerate = async (actionType) => {
    setLoadingAction(actionType);
    setError(null);

    try {
      let res;
      switch (actionType) {
        case 'analyze':
          res = await api.analyzeProblem(currentProject.id);
          setCurrentProject((prev) => ({ ...prev, analysis: res.analysis }));
          break;
        case 'ideas':
          res = await api.generateIdeas(currentProject.id);
          setCurrentProject((prev) => ({ ...prev, ideas: res.ideas }));
          break;
        case 'differentiators':
          res = await api.generateDifferentiators(currentProject.id, selectedIdeaId);
          setCurrentProject((prev) => ({
            ...prev,
            selectedSolution: { ...prev.selectedSolution, ...res.selectedSolution, differentiators: res.differentiators.differentiators, judge_pitch_reasons: res.differentiators.judgePitchReasons },
          }));
          break;
        case 'techStack':
          res = await api.generateTechStack(currentProject.id);
          setCurrentProject((prev) => ({
            ...prev,
            selectedSolution: { ...prev.selectedSolution, ...res.selectedSolution, tech_stack: res.techStack },
          }));
          break;
        case 'architecture':
          res = await api.generateArchitecture(currentProject.id);
          setCurrentProject((prev) => ({
            ...prev,
            selectedSolution: { ...prev.selectedSolution, ...res.selectedSolution, architecture: res.architecture },
          }));
          break;
        case 'roadmap':
          res = await api.generateRoadmap(currentProject.id);
          setCurrentProject((prev) => ({
            ...prev,
            selectedSolution: { ...prev.selectedSolution, ...res.selectedSolution, roadmap: res.roadmap },
          }));
          break;
        case 'pitch':
          res = await api.generatePitch(currentProject.id);
          setCurrentProject((prev) => ({
            ...prev,
            selectedSolution: { ...prev.selectedSolution, ...res.selectedSolution, pitch: res.pitch },
          }));
          break;
        case 'teamRoles':
          res = await api.recommendTeamRoles(currentProject.id);
          setCurrentProject((prev) => ({
            ...prev,
            selectedSolution: { ...prev.selectedSolution, ...res.selectedSolution, team_roles: res.teamRoles },
          }));
          break;
        default:
          break;
      }
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSelectIdea = async (ideaId) => {
    try {
      await api.selectIdea(currentProject.id, ideaId);
      setCurrentProject((prev) => ({
        ...prev,
        selectedSolution: { ...prev.selectedSolution, idea_id: ideaId },
      }));
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      setError(err.message || 'Failed to select idea.');
    }
  };

  // Automatically kick off analysis on first view if missing
  useEffect(() => {
    if (!analysis && !loadingAction && currentProject?.id) {
      handleGenerate('analyze');
    }
  }, [currentProject?.id]);

  // Tab configurations
  const TABS = [
    { id: 'analysis', label: '1. Analysis', icon: BookOpen, done: Boolean(analysis) },
    { id: 'ideas', label: '2. Ideas', icon: Layers, done: Boolean(ideas.length) },
    { id: 'comparison', label: '3. Comparison', icon: BarChart2, done: Boolean(ideas.length) },
    { id: 'differentiators', label: '4. Differentiators', icon: Flame, done: Boolean(solution?.differentiators?.length) },
    { id: 'techStack', label: '5. Tech Stack', icon: Cpu, done: Boolean(solution?.tech_stack?.categories?.length) },
    { id: 'architecture', label: '6. Architecture', icon: GitBranch, done: Boolean(solution?.architecture?.nodes?.length) },
    { id: 'roadmap', label: '7. Roadmap', icon: Calendar, done: Boolean(solution?.roadmap?.phases?.length) },
    { id: 'pitch', label: '8. Pitch Coach', icon: Mic, done: Boolean(solution?.pitch?.pitch30s) },
    { id: 'teamRoles', label: '9. Team Roles', icon: Users, done: Boolean(solution?.team_roles?.roles?.length) },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Project Banner & Meta */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {analysis?.domain || 'Analyzing Domain...'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {currentProject.development_time || '24 hours'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                {currentProject.team_size || '1'} {currentProject.team_size === '1' ? 'Developer' : 'Developers'}
              </span>
              {currentProject.hardware && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {currentProject.hardware}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {currentProject.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-4xl line-clamp-2">
              {currentProject.problem_statement}
            </p>
          </div>

          {selectedIdea && (
            <div className="shrink-0 p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-left lg:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                Selected Base Solution
              </span>
              <span className="text-xs font-semibold text-white truncate max-w-[220px] block">
                {selectedIdea.title}
              </span>
            </div>
          )}
        </div>

        {/* Workflow Stepper / Tab Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.done ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.done && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/50 text-xs sm:text-sm text-red-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-400 hover:text-red-200 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB CONTENT PANELS */}
      <div className="transition-all">
        {/* ===================== TAB 1: ANALYSIS ===================== */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {!analysis ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white">Analyzing Problem Statement...</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Deconstructing pain points, domain classification, and functional requirements.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary & Difficulty */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Executive Problem Summary
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed">{analysis.summary}</p>
                    {analysis.simple_explanation && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                        <span className="font-semibold text-indigo-300 block mb-0.5">Plain-English Translation:</span>
                        {analysis.simple_explanation}
                      </div>
                    )}
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Assessed Complexity
                      </span>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                            analysis.difficulty === 'Easy'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : analysis.difficulty === 'Hard'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {analysis.difficulty} Difficulty
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{analysis.difficulty_reason}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">Keywords & Tags</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(analysis.keywords || []).map((kw, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements, Constraints & Target Users */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Functional Requirements */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Functional Requirements
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {(analysis.functional_requirements || []).map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technical Requirements */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Technical Requirements
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {(analysis.technical_requirements || []).map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Constraints & Target Users */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                        Target Users
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(analysis.target_users || []).map((u, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 text-slate-200 border border-slate-800">
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">
                        Key Constraints
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {(analysis.constraints || []).map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-red-400 font-bold">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Advance to Ideas action */}
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-white">Analysis Complete.</span> Ready to synthesize 3–4 distinct hackathon solution directions?
                  </div>
                  <button
                    onClick={() => {
                      if (!ideas.length) handleGenerate('ideas');
                      setActiveTab('ideas');
                    }}
                    disabled={loadingAction === 'ideas'}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
                  >
                    {loadingAction === 'ideas' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Ideas...</span>
                      </>
                    ) : (
                      <>
                        <span>{ideas.length ? 'View Solution Ideas' : 'Generate Solution Ideas'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: IDEAS ===================== */}
        {activeTab === 'ideas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Solution Directions</h3>
                <p className="text-xs text-slate-400">
                  3–5 genuinely different solution architectures evaluated against team constraints
                </p>
              </div>
              <button
                onClick={() => handleGenerate('ideas')}
                disabled={loadingAction === 'ideas'}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'ideas' ? 'animate-spin' : ''}`} />
                <span>Regenerate Ideas</span>
              </button>
            </div>

            {ideas.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => handleGenerate('ideas')}
                  disabled={loadingAction === 'ideas'}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 mx-auto shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {loadingAction === 'ideas' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Architectures...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Solution Ideas</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ideas.map((idea, idx) => {
                  const isSelected = selectedIdeaId === idea.id;
                  return (
                    <div
                      key={idea.id || idx}
                      className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900/95 border-indigo-500 shadow-xl shadow-indigo-500/10'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Idea Header */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                Vector #{idx + 1}
                              </span>
                              {idea.is_recommended && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                  <Award className="w-3 h-3" /> Top Pick
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-bold text-white">{idea.title}</h4>
                          </div>

                          <button
                            onClick={() => handleSelectIdea(idea.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            {isSelected ? '✓ Active Plan' : 'Select'}
                          </button>
                        </div>

                        {/* One-line concept */}
                        <p className="text-xs font-medium text-indigo-300 mb-3">{idea.concept}</p>
                        <p className="text-xs text-slate-300 leading-relaxed mb-4">{idea.description}</p>

                        {/* Features */}
                        <div className="mb-4 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Key Capabilities
                          </span>
                          {(idea.features || []).map((feat, fIdx) => (
                            <div key={fIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                              <span className="text-indigo-400 font-bold">•</span>
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>

                        {/* Required tech */}
                        <div className="mb-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Target Technologies
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(idea.required_tech || idea.requiredTech || []).map((t, tIdx) => (
                              <span key={tIdx} className="text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Score metrics */}
                      <div className="pt-4 border-t border-slate-800/80 grid grid-cols-4 gap-2 text-center">
                        <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Feasibility</span>
                          <span className="text-xs font-bold text-emerald-400">
                            {idea.feasibility_score || idea.feasibilityScore}/10
                          </span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Innovation</span>
                          <span className="text-xs font-bold text-indigo-400">
                            {idea.innovation_score || idea.innovationScore}/10
                          </span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Impact</span>
                          <span className="text-xs font-bold text-cyan-400">
                            {idea.impact_score || idea.impactScore}/10
                          </span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Demo Wow</span>
                          <span className="text-xs font-bold text-amber-400">
                            {idea.demo_score || idea.demoScore}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 3: COMPARISON ===================== */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Deterministic Solution Comparison</h3>
              <p className="text-xs text-slate-400">
                Evaluation algorithm balancing innovation against practical delivery constraints
              </p>
            </div>
            <ComparisonChart
              ideas={ideas}
              selectedIdeaId={selectedIdeaId}
              onSelectIdea={handleSelectIdea}
            />
          </div>
        )}

        {/* ===================== TAB 4: DIFFERENTIATORS ===================== */}
        {activeTab === 'differentiators' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Competitive Moats & Differentiators</h3>
                <p className="text-xs text-slate-400">
                  Why this solution breaks out from generic clones and stands out to judges
                </p>
              </div>
              <button
                onClick={() => handleGenerate('differentiators')}
                disabled={loadingAction === 'differentiators'}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'differentiators' ? 'animate-spin' : ''}`} />
                <span>Regenerate Moats</span>
              </button>
            </div>

            {!solution?.differentiators?.length ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => handleGenerate('differentiators')}
                  disabled={loadingAction === 'differentiators'}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 mx-auto shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {loadingAction === 'differentiators' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Formulating Differentiators...</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4" />
                      <span>Generate Competitive Moats</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Differentiators Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(solution.differentiators || []).map((diff, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {diff.category || 'Moat'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{diff.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{diff.description}</p>
                      {diff.implementationHint && (
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-amber-300">
                          <span className="font-semibold block text-amber-400">Judge Demo Strategy:</span>
                          {diff.implementationHint}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Judge Pitch Reasons */}
                {solution.judge_pitch_reasons?.length > 0 && (
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-400" />
                      Why Judges Choose This Solution
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {solution.judge_pitch_reasons.map((reason, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-indigo-400 block">
                            {reason.pillar}
                          </span>
                          <span className="text-xs font-semibold text-white block">
                            {reason.headline}
                          </span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {reason.argument}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 5: TECH STACK ===================== */}
        {activeTab === 'techStack' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Recommended Technology Stack</h3>
                <p className="text-xs text-slate-400">
                  Pragmatic technology choices calibrated for your available timeline and team skillset
                </p>
              </div>
              <button
                onClick={() => handleGenerate('techStack')}
                disabled={loadingAction === 'techStack'}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'techStack' ? 'animate-spin' : ''}`} />
                <span>Regenerate Stack</span>
              </button>
            </div>

            {!solution?.tech_stack?.categories?.length ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => handleGenerate('techStack')}
                  disabled={loadingAction === 'techStack'}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 mx-auto shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {loadingAction === 'techStack' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Optimizing Stack...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      <span>Recommend Tech Stack</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {solution.tech_stack.stackSummary && (
                  <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-200">
                    <span className="font-semibold text-indigo-300 block mb-1">Architecture Rationale:</span>
                    {solution.tech_stack.stackSummary}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {solution.tech_stack.categories.map((cat, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {cat.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-indigo-400 font-mono">{cat.technology}</h4>
                      <p className="text-xs text-slate-300">{cat.purpose}</p>
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                        <span className="text-slate-500 font-medium">Why: </span>
                        {cat.whyRecommended}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 6: ARCHITECTURE ===================== */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Interactive System Architecture</h3>
                <p className="text-xs text-slate-400">
                  Dataflow DAG with interactive nodes, connections, and protocols
                </p>
              </div>
              <button
                onClick={() => handleGenerate('architecture')}
                disabled={loadingAction === 'architecture'}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'architecture' ? 'animate-spin' : ''}`} />
                <span>Regenerate Architecture</span>
              </button>
            </div>

            {!solution?.architecture?.nodes?.length ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => handleGenerate('architecture')}
                  disabled={loadingAction === 'architecture'}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 mx-auto shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {loadingAction === 'architecture' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Plotting Architecture DAG...</span>
                    </>
                  ) : (
                    <>
                      <GitBranch className="w-4 h-4" />
                      <span>Generate Architecture Diagram</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <ArchitectureFlow architectureData={solution.architecture} />
            )}
          </div>
        )}

        {/* ===================== TAB 7: ROADMAP ===================== */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Sprint Execution Roadmap</h3>
                <p className="text-xs text-slate-400">
                  Milestone-driven roadmap budgeted for {currentProject.development_time || '24 hours'}
                </p>
              </div>
              <button
                onClick={() => handleGenerate('roadmap')}
                disabled={loadingAction === 'roadmap'}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'roadmap' ? 'animate-spin' : ''}`} />
                <span>Regenerate Roadmap</span>
              </button>
            </div>

            {!solution?.roadmap?.phases?.length ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => handleGenerate('roadmap')}
                  disabled={loadingAction === 'roadmap'}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 mx-auto shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {loadingAction === 'roadmap' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Drafting Timeline...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Generate Development Roadmap</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {solution.roadmap.mvpRule && (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 block">The Golden MVP Rule:</span>
                      {solution.roadmap.mvpRule}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {solution.roadmap.phases.map((phase, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                            {phase.phaseNumber || i + 1}
                          </span>
                          <h4 className="text-sm font-bold text-white">{phase.name}</h4>
                        </div>
                        <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-900/50">
                          {phase.duration}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Objectives
                          </span>
                          <ul className="space-y-1 text-xs text-slate-300">
                            {(phase.objectives || []).map((obj, oIdx) => (
                              <li key={oIdx} className="flex items-start gap-1.5">
                                <span className="text-indigo-400 font-bold">•</span>
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Tangible Deliverables
                          </span>
                          <ul className="space-y-1 text-xs text-slate-300">
                            {(phase.deliverables || []).map((del, dIdx) => (
                              <li key={dIdx} className="flex items-start gap-1.5">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>{del}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {phase.pitfallsToAvoid && (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-red-300">
                          <span className="font-semibold text-red-400">Pitfall to Avoid: </span>
                          {phase.pitfallsToAvoid}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 8: PITCH COACH ===================== */}
        {activeTab === 'pitch' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Judge Presentation & Pitch Suite</h3>
                <p className="text-xs text-slate-400">
                  Tailored scripts for 30s elevator, 1m hackathon quick-fire, 3m demo, and slide deck outline
                </p>
              </div>
              <button
                onClick={() => handleGenerate('pitch')}
                disabled={loadingAction === 'pitch'}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'pitch' ? 'animate-spin' : ''}`} />
                <span>Regenerate Pitches</span>
              </button>
            </div>

            {!solution?.pitch?.pitch30s ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => handleGenerate('pitch')}
                  disabled={loadingAction === 'pitch'}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 mx-auto shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {loadingAction === 'pitch' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scripting Pitch Materials...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Generate Pitch Package</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 30-Second Elevator Pitch */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    30-Second Elevator Pitch
                  </span>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs sm:text-sm text-slate-200">
                    <p><strong className="text-indigo-300">Hook: </strong>"{solution.pitch.pitch30s.hook}"</p>
                    <p><strong className="text-indigo-300">Problem: </strong>"{solution.pitch.pitch30s.problem}"</p>
                    <p><strong className="text-indigo-300">Solution: </strong>"{solution.pitch.pitch30s.solution}"</p>
                    <p><strong className="text-indigo-300">Call to Action: </strong>"{solution.pitch.pitch30s.callToAction}"</p>
                  </div>
                </div>

                {/* 1-Minute Pitch Script */}
                {solution.pitch.pitch1m && (
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      1-Minute Verbatim Hackathon Script
                    </span>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                      {solution.pitch.pitch1m.script}
                    </div>
                  </div>
                )}

                {/* 3-Minute Judge Presentation */}
                {solution.pitch.pitch3m?.sections?.length > 0 && (
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      3-Minute Comprehensive Judge Presentation
                    </span>
                    <div className="space-y-2">
                      {solution.pitch.pitch3m.sections.map((sec, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                          <span className="font-bold text-indigo-300 block mb-1">{sec.part}</span>
                          <p className="text-slate-300 leading-relaxed">{sec.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7-Slide Deck Outline */}
                {solution.pitch.slideDeck?.length > 0 && (
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      7-Slide Hackathon Presentation Blueprint
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {solution.pitch.slideDeck.map((slide, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                              Slide {slide.slideNumber || i + 1}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-white">{slide.title}</h5>
                          <ul className="space-y-1 text-[11px] text-slate-400">
                            {(slide.talkingPoints || []).map((tp, tpIdx) => (
                              <li key={tpIdx}>• {tp}</li>
                            ))}
                          </ul>
                          {slide.visualSuggestion && (
                            <p className="text-[10px] text-indigo-400 pt-1 border-t border-slate-900">
                              Visual: {slide.visualSuggestion}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 9: TEAM ROLES ===================== */}
        {activeTab === 'teamRoles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Team Role Allocation & Skill Gap Defense</h3>
                <p className="text-xs text-slate-400">
                  Assign responsibilities to {currentProject.team_size || '1'} team members and identify workarounds for missing skills
                </p>
              </div>
              <button
                onClick={() => handleGenerate('teamRoles')}
                disabled={loadingAction === 'teamRoles'}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'teamRoles' ? 'animate-spin' : ''}`} />
                <span>Regenerate Roles</span>
              </button>
            </div>

            {!solution?.team_roles?.roles?.length ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => handleGenerate('teamRoles')}
                  disabled={loadingAction === 'teamRoles'}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 mx-auto shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {loadingAction === 'teamRoles' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Allocating Roles...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      <span>Generate Role Assignments</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {solution.team_roles.roles.map((r, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-400">{r.member}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {r.skillsUsed || 'Core'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{r.primaryRole}</h4>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {(r.responsibilities || []).map((resp, respIdx) => (
                          <li key={respIdx} className="flex items-start gap-1.5">
                            <span className="text-indigo-400">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {solution.team_roles.mitigationAdvice && (
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Identified Skill Gaps & Hackathon Workarounds
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {solution.team_roles.mitigationAdvice}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
