import React, { useState, useEffect } from 'react';
import {
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
  ShieldAlert,
  Flame,
  Award,
  BookOpen,
  Save,
  Check,
  Download,
  Copy,
} from 'lucide-react';
import { api } from '../../services/api';
import ArchitectureFlow from './ArchitectureFlow';
import ComparisonChart from './ComparisonChart';

export default function ProjectWorkspace({ project, onProjectUpdated }) {
  const [activeTab, setActiveTab] = useState('analysis');
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState(null);
  const [lastFailedAction, setLastFailedAction] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedPitch, setCopiedPitch] = useState(null);

  // Local state copy
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
    if (loadingAction) return;
    setLoadingAction(actionType);
    setError(null);
    setLastFailedAction(null);

    try {
      let res;
      switch (actionType) {
        case 'analyze':
          res = await api.analyzeProblem(currentProject.id);
          setCurrentProject((prev) => ({ ...prev, analysis: res.analysis }));
          break;
        case 'ideas': {
          res = await api.generateIdeas(currentProject.id);
          const newIdeas = res.ideas || [];
          const topPick = newIdeas.find((i) => i.is_recommended) || newIdeas[0];
          if (topPick) {
            await api.selectIdea(currentProject.id, topPick.id).catch(() => {});
            setCurrentProject((prev) => ({
              ...prev,
              ideas: newIdeas,
              selectedSolution: { ...prev.selectedSolution, idea_id: topPick.id },
            }));
          } else {
            setCurrentProject((prev) => ({ ...prev, ideas: newIdeas }));
          }
          break;
        }
        case 'differentiators':
          res = await api.generateDifferentiators(currentProject.id, selectedIdeaId);
          setCurrentProject((prev) => ({
            ...prev,
            selectedSolution: {
              ...prev.selectedSolution,
              ...res.selectedSolution,
              differentiators: res.differentiators.differentiators,
              judge_pitch_reasons: res.differentiators.judgePitchReasons,
            },
          }));
          break;
        case 'techStack':
          res = await api.generateTechStack(currentProject.id, { ideaId: selectedIdeaId });
          setCurrentProject((prev) => ({
            ...prev,
            selectedSolution: {
              ...prev.selectedSolution,
              ...res.selectedSolution,
              tech_stack: res.techStack,
            },
          }));
          break;
        case 'architecture':
          res = await api.generateArchitecture(currentProject.id, {
            ideaId: selectedIdeaId,
            techStack: solution?.tech_stack || solution?.techStack,
          });
          setCurrentProject((prev) => ({
            ...prev,
            selectedSolution: {
              ...prev.selectedSolution,
              ...res.selectedSolution,
              architecture: res.architecture,
            },
          }));
          break;
        case 'roadmap':
          res = await api.generateRoadmap(currentProject.id, { ideaId: selectedIdeaId });
          setCurrentProject((prev) => ({
            ...prev,
            selectedSolution: {
              ...prev.selectedSolution,
              ...res.selectedSolution,
              roadmap: res.roadmap,
            },
          }));
          break;
        case 'pitch':
          res = await api.generatePitch(currentProject.id, {
            ideaId: selectedIdeaId,
            differentiators: solution?.differentiators,
          });
          setCurrentProject((prev) => ({
            ...prev,
            selectedSolution: {
              ...prev.selectedSolution,
              ...res.selectedSolution,
              pitch: res.pitch,
            },
          }));
          break;
        case 'teamRoles':
          res = await api.recommendTeamRoles(currentProject.id, { ideaId: selectedIdeaId });
          setCurrentProject((prev) => ({
            ...prev,
            selectedSolution: {
              ...prev.selectedSolution,
              ...res.selectedSolution,
              team_roles: res.teamRoles,
            },
          }));
          break;
        default:
          break;
      }
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      setError(err.message || 'Action failed. Please try again.');
      setLastFailedAction(actionType);
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

  // Explicit Save
  const handleSaveBlueprint = async () => {
    if (saveStatus === 'saving') return;
    try {
      setSaveStatus('saving');
      setError(null);
      await api.updateProject(currentProject.id, {
        title: currentProject.title,
        problemStatement: currentProject.problem_statement,
        developmentTime: currentProject.development_time,
        teamSize: currentProject.team_size,
        teamSkills: currentProject.team_skills,
        budget: currentProject.budget,
        hardware: currentProject.hardware,
      });
      setSaveStatus('saved');
      setToastMessage('Project blueprint saved to database.');
      if (onProjectUpdated) onProjectUpdated();
      setTimeout(() => {
        setSaveStatus(null);
        setToastMessage(null);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to save project.');
      setSaveStatus(null);
    }
  };

  // Export full blueprint as Markdown
  const handleExportBlueprint = () => {
    const lines = [
      `# HackX Solution Blueprint: ${currentProject.title || 'Untitled Project'}`,
      ``,
      `**Problem Statement:** ${currentProject.problem_statement}`,
      `**Domain:** ${analysis?.domain || 'General'} | **Complexity:** ${analysis?.difficulty || 'Medium'}`,
      `**Timeline:** ${currentProject.development_time || '24 hours'} | **Team Size:** ${currentProject.team_size || '1'} dev(s)`,
      ``,
      `## 1. Problem Analysis`,
      analysis?.summary || 'Not generated yet',
      analysis?.simple_explanation ? `\n*Plain English:* ${analysis.simple_explanation}` : '',
      ``,
      `## 2. Selected Solution`,
      selectedIdea
        ? `### ${selectedIdea.title}\n${selectedIdea.description}\n\n**Concept:** ${selectedIdea.concept}`
        : 'No idea selected yet',
      ``,
      `## 3. Technology Stack`,
      (solution?.tech_stack?.categories || solution?.techStack?.categories || [])
        .map((c) => `- **${c.category}**: ${c.technology} — ${c.purpose}`)
        .join('\n') || 'Not generated yet',
      ``,
      `## 4. Execution Roadmap`,
      (solution?.roadmap?.phases || [])
        .map((p) => `### Phase ${p.phaseNumber}: ${p.name} (${p.duration})\nDeliverables: ${(p.deliverables || []).join(', ')}`)
        .join('\n\n') || 'Not generated yet',
      ``,
      `## 5. Pitch Suite`,
      solution?.pitch?.pitch30s
        ? `**30s Hook:** "${solution.pitch.pitch30s.hook}"\n**Solution:** "${solution.pitch.pitch30s.solution}"`
        : 'Not generated yet',
      ``,
      `---`,
      `Generated by HackX Decision Support Engine`,
    ];

    const content = lines.filter(Boolean).join('\n');
    navigator.clipboard?.writeText(content);
    setToastMessage('Full Markdown blueprint copied to clipboard.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyText = (text, label) => {
    navigator.clipboard?.writeText(text);
    setCopiedPitch(label);
    setTimeout(() => setCopiedPitch(null), 2500);
  };

  // Automatic kick off analysis on initial load if missing
  useEffect(() => {
    if (!analysis && !loadingAction && currentProject?.id) {
      handleGenerate('analyze');
    }
  }, [currentProject?.id]);

  // Tab definitions
  const TABS = [
    { id: 'analysis', label: '1. Analysis', icon: BookOpen, done: Boolean(analysis) },
    { id: 'ideas', label: '2. Ideas', icon: Layers, done: Boolean(ideas.length) },
    { id: 'comparison', label: '3. Matrix', icon: BarChart2, done: Boolean(ideas.length) },
    { id: 'differentiators', label: '4. Moats', icon: Flame, done: Boolean(solution?.differentiators?.length) },
    {
      id: 'techStack',
      label: '5. Tech Stack',
      icon: Cpu,
      done: Boolean(solution?.tech_stack?.categories?.length || solution?.techStack?.categories?.length),
    },
    { id: 'architecture', label: '6. Architecture', icon: GitBranch, done: Boolean(solution?.architecture?.nodes?.length) },
    { id: 'roadmap', label: '7. Roadmap', icon: Calendar, done: Boolean(solution?.roadmap?.phases?.length) },
    { id: 'pitch', label: '8. Pitch', icon: Mic, done: Boolean(solution?.pitch?.pitch30s) },
    {
      id: 'teamRoles',
      label: '9. Team Roles',
      icon: Users,
      done: Boolean(solution?.team_roles?.roles?.length || solution?.teamRoles?.roles?.length),
    },
  ];

  return (
    <div className="w-full space-y-5">
      {/* Workspace Header & Metadata */}
      <div className="p-5 rounded-md bg-[#111622] border border-[#1e2638] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            {/* Breadcrumb & Track Pills */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="text-slate-400">PROJECTS /</span>
              <span className="px-2 py-0.5 rounded bg-[#161c2a] text-blue-400 border border-[#232d42]">
                {analysis?.domain || 'Analyzing Domain...'}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#161c2a] text-slate-300 border border-[#232d42] flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {currentProject.development_time || '24 hours'}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#161c2a] text-slate-300 border border-[#232d42] flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                {currentProject.team_size || '1'} {currentProject.team_size === '1' ? 'Developer' : 'Developers'}
              </span>
              {currentProject.hardware && (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {currentProject.hardware}
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
              {currentProject.title || 'Untitled Hackathon Project'}
            </h1>
            <p className="text-xs text-slate-400 max-w-4xl line-clamp-2 leading-relaxed">
              {currentProject.problem_statement}
            </p>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {selectedIdea && (
              <div className="px-3 py-1.5 rounded bg-[#0d121c] border border-[#1e2638] text-left">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Selected Vector:
                </span>
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[180px] block">
                  {selectedIdea.title}
                </span>
              </div>
            )}

            <button
              onClick={handleSaveBlueprint}
              disabled={saveStatus === 'saving'}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#161c2a] hover:bg-[#1f273a] text-slate-200 border border-[#242f44] flex items-center gap-1.5 transition-colors"
              title="Save project changes"
            >
              {saveStatus === 'saving' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : saveStatus === 'saved' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleExportBlueprint}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-xs transition-colors"
              title="Copy complete Markdown blueprint"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stage Navigator (Tabs) */}
        <div className="pt-3 border-t border-[#1e2638] flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0d121c] text-slate-400 hover:text-slate-200 hover:bg-[#161c2a] border border-[#1e2638]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.done ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.done && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications / Feedback */}
      {toastMessage && (
        <div className="p-3 rounded-md bg-emerald-950/40 border border-emerald-600/30 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-md bg-red-950/40 border border-red-800/40 text-xs text-red-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-2">
            {lastFailedAction && (
              <button
                onClick={() => handleGenerate(lastFailedAction)}
                disabled={Boolean(loadingAction)}
                className="px-2 py-0.5 rounded bg-red-900/60 hover:bg-red-800 text-white text-[11px] font-medium"
              >
                Retry
              </button>
            )}
            <button
              onClick={() => setError(null)}
              className="text-[11px] text-red-400 hover:text-white underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ===================== TAB 1: ANALYSIS ===================== */}
      {activeTab === 'analysis' && (
        <div className="space-y-4">
          {!analysis ? (
            <div className="p-14 text-center rounded-md bg-[#111622] border border-[#1e2638]">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2.5" />
              <h3 className="text-sm font-semibold text-slate-200">Analyzing Problem Statement...</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Deconstructing constraints, classifying domain, and extracting core requirements.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Problem Debrief & Technical Classification */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1e2638] pb-2">
                    <span className="text-[11px] font-mono uppercase text-slate-400">
                      Problem Deconstruction
                    </span>
                    <span className="text-[10px] font-mono text-blue-400">AI DEBRIEF</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {analysis.summary}
                  </p>
                  {(analysis.simple_explanation || analysis.simpleExplanation) && (
                    <div className="p-3 rounded bg-[#0d121c] border border-[#1e2638] text-xs text-slate-300">
                      <strong className="text-slate-200 block mb-0.5">Plain-English Synthesis:</strong>
                      {analysis.simple_explanation || analysis.simpleExplanation}
                    </div>
                  )}
                </div>

                {/* Difficulty & Classification */}
                <div className="p-4 rounded-md bg-[#111622] border border-[#1e2638] flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2 border-b border-[#1e2638] pb-1">
                      Assessed Complexity
                    </span>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                          analysis.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : analysis.difficulty === 'Hard'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {analysis.difficulty} Complexity
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {analysis.difficulty_reason || analysis.difficultyReason}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#1e2638]">
                    <span className="text-[10px] font-mono text-slate-500 block mb-1">Keywords</span>
                    <div className="flex flex-wrap gap-1">
                      {(analysis.keywords || []).map((kw, i) => (
                        <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0d121c] text-slate-400 border border-[#1e2638]">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements & Constraints 3-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Functional */}
                <div className="p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-emerald-400 border-b border-[#1e2638] pb-1.5">
                    Functional Requirements
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(analysis.functional_requirements || analysis.functionalRequirements || []).map((req, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical */}
                <div className="p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-sky-400 border-b border-[#1e2638] pb-1.5">
                    Technical Requirements
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(analysis.technical_requirements || analysis.technicalRequirements || []).map((req, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Target Users & Constraints */}
                <div className="p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-3">
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase text-slate-300 border-b border-[#1e2638] pb-1.5 mb-1.5">
                      Target Users
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {(analysis.target_users || analysis.targetUsers || []).map((u, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-[#0d121c] text-slate-300 border border-[#1e2638]">
                          {u}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase text-amber-400 border-b border-[#1e2638] pb-1.5 mb-1.5">
                      Identified Constraints
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-400">
                      {(analysis.constraints || []).map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Next Stage Navigation Footer */}
              <div className="p-3.5 rounded-md bg-[#0d121c] border border-[#1e2638] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Stage 1 complete. Proceed to generate and compare solution proposals.
                </span>
                <button
                  onClick={() => {
                    if (!ideas.length) handleGenerate('ideas');
                    setActiveTab('ideas');
                  }}
                  disabled={Boolean(loadingAction)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {loadingAction === 'ideas' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Ideas...</span>
                    </>
                  ) : (
                    <>
                      <span>{ideas.length ? 'Next: Solution Ideas' : 'Generate Solution Ideas'}</span>
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
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2638] pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                Solution Proposals
              </h3>
              <p className="text-xs text-slate-400">
                3–5 distinct architectural approaches evaluated against hackathon constraints
              </p>
            </div>
            <button
              onClick={() => handleGenerate('ideas')}
              disabled={Boolean(loadingAction)}
              className="px-3 py-1 bg-[#161c2a] hover:bg-[#1e2638] disabled:opacity-50 text-xs text-slate-300 rounded border border-[#242f44] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'ideas' ? 'animate-spin' : ''}`} />
              <span>Regenerate Ideas</span>
            </button>
          </div>

          {ideas.length === 0 ? (
            <div className="p-14 text-center rounded-md bg-[#111622] border border-[#1e2638]">
              <button
                onClick={() => handleGenerate('ideas')}
                disabled={Boolean(loadingAction)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md inline-flex items-center gap-2 transition-colors"
              >
                {loadingAction === 'ideas' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Ideas...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-3.5 h-3.5" />
                    <span>Generate Solution Ideas</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ideas.map((idea, idx) => {
                const isSelected = selectedIdeaId === idea.id;
                return (
                  <div
                    key={idea.id || idx}
                    className={`p-4 rounded-md border flex flex-col justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#121927] border-blue-500/60'
                        : 'bg-[#111622] border-[#1e2638] hover:border-[#2b374e]'
                    }`}
                  >
                    <div>
                      {/* Idea Top Bar */}
                      <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-[#1e2638]">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#161c2a] text-blue-400 border border-[#232d42]">
                              VECTOR #{idx + 1}
                            </span>
                            {idea.is_recommended && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                <Award className="w-3 h-3" /> TOP PICK
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-100">{idea.title}</h4>
                        </div>

                        <button
                          onClick={() => handleSelectIdea(idea.id)}
                          className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                            isSelected
                              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#1a2130] hover:bg-blue-600 hover:text-white text-slate-300'
                          }`}
                        >
                          {isSelected ? '✓ Active' : 'Select'}
                        </button>
                      </div>

                      {/* Concept & Description */}
                      <div className="text-xs text-blue-300 font-medium mb-1.5 font-mono">
                        {idea.concept}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {idea.description}
                      </p>

                      {/* Capabilities */}
                      <div className="mb-3 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-500 block">
                          Core Capabilities:
                        </span>
                        {(idea.features || []).map((feat, fIdx) => (
                          <div key={fIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                            <span className="text-blue-400">•</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Required Tech */}
                      <div className="mb-3">
                        <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                          Stack Targets:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(idea.required_tech || idea.requiredTech || []).map((t, tIdx) => (
                            <span key={tIdx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0d121c] text-slate-300 border border-[#1e2638]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="pt-3 border-t border-[#1e2638] grid grid-cols-4 gap-1.5 text-center font-mono">
                      <div className="p-1 rounded bg-[#0d121c] border border-[#1e2638]">
                        <span className="text-[9px] text-slate-500 block">FEASIBILITY</span>
                        <span className="text-xs font-bold text-emerald-400">
                          {idea.feasibility_score ?? idea.feasibilityScore}/10
                        </span>
                      </div>
                      <div className="p-1 rounded bg-[#0d121c] border border-[#1e2638]">
                        <span className="text-[9px] text-slate-500 block">INNOVATION</span>
                        <span className="text-xs font-bold text-blue-400">
                          {idea.innovation_score ?? idea.innovationScore}/10
                        </span>
                      </div>
                      <div className="p-1 rounded bg-[#0d121c] border border-[#1e2638]">
                        <span className="text-[9px] text-slate-500 block">IMPACT</span>
                        <span className="text-xs font-bold text-sky-400">
                          {idea.impact_score ?? idea.impactScore}/10
                        </span>
                      </div>
                      <div className="p-1 rounded bg-[#0d121c] border border-[#1e2638]">
                        <span className="text-[9px] text-slate-500 block">DEMO WOW</span>
                        <span className="text-xs font-bold text-amber-400">
                          {idea.demo_score ?? idea.demoScore}/10
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Navigation to comparison */}
          {ideas.length > 0 && (
            <div className="p-3.5 rounded-md bg-[#0d121c] border border-[#1e2638] flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Selected plan vector: <strong className="text-slate-200">{selectedIdea?.title}</strong>
              </span>
              <button
                onClick={() => setActiveTab('comparison')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
              >
                <span>Next: Decision Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: COMPARISON ===================== */}
      {activeTab === 'comparison' && (
        <div className="space-y-4">
          <ComparisonChart
            ideas={ideas}
            selectedIdeaId={selectedIdeaId}
            onSelectIdea={handleSelectIdea}
          />

          <div className="p-3.5 rounded-md bg-[#0d121c] border border-[#1e2638] flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Active plan: <strong className="text-slate-200">{selectedIdea?.title}</strong>
            </span>
            <button
              onClick={() => {
                if (!solution?.differentiators?.length) handleGenerate('differentiators');
                setActiveTab('differentiators');
              }}
              disabled={Boolean(loadingAction)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
            >
              {loadingAction === 'differentiators' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Formulating Moats...</span>
                </>
              ) : (
                <>
                  <span>{solution?.differentiators?.length ? 'Next: Competitive Moats' : 'Generate Moats'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ===================== TAB 4: DIFFERENTIATORS ===================== */}
      {activeTab === 'differentiators' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2638] pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                Competitive Moats & Differentiators
              </h3>
              <p className="text-xs text-slate-400">
                Defensible features and judge talking points distinguishing this project from standard hackathon clones
              </p>
            </div>
            <button
              onClick={() => handleGenerate('differentiators')}
              disabled={Boolean(loadingAction)}
              className="px-3 py-1 bg-[#161c2a] hover:bg-[#1e2638] disabled:opacity-50 text-xs text-slate-300 rounded border border-[#242f44] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'differentiators' ? 'animate-spin' : ''}`} />
              <span>Regenerate Moats</span>
            </button>
          </div>

          {!solution?.differentiators?.length ? (
            <div className="p-14 text-center rounded-md bg-[#111622] border border-[#1e2638]">
              <button
                onClick={() => handleGenerate('differentiators')}
                disabled={Boolean(loadingAction)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md inline-flex items-center gap-2 transition-colors"
              >
                {loadingAction === 'differentiators' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Formulating Moats...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-3.5 h-3.5" />
                    <span>Generate Competitive Moats</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(solution.differentiators || []).map((diff, i) => (
                  <div key={i} className="p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {diff.category || 'DEFENSIBLE MOAT'}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100">{diff.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{diff.description}</p>
                    {diff.implementationHint && (
                      <div className="mt-2 p-2 rounded bg-[#0d121c] border border-[#1e2638] text-[11px] text-amber-300">
                        <strong className="text-amber-400 block mb-0.5">Judge Demonstration Strategy:</strong>
                        {diff.implementationHint}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Judge Pitch Reasons */}
              {solution.judge_pitch_reasons?.length > 0 && (
                <div className="p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-300 border-b border-[#1e2638] pb-1.5 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-400" />
                    Why Judges Select This Solution
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {solution.judge_pitch_reasons.map((reason, i) => (
                      <div key={i} className="p-3 rounded bg-[#0d121c] border border-[#1e2638] space-y-1">
                        <span className="text-[10px] font-mono uppercase text-blue-400 block">
                          {reason.pillar}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 block">
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

              <div className="p-3.5 rounded-md bg-[#0d121c] border border-[#1e2638] flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Moats formulated. Next, configure the technology stack.
                </span>
                <button
                  onClick={() => {
                    if (!(solution?.tech_stack?.categories?.length || solution?.techStack?.categories?.length)) {
                      handleGenerate('techStack');
                    }
                    setActiveTab('techStack');
                  }}
                  disabled={Boolean(loadingAction)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                >
                  {loadingAction === 'techStack' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Configuring Stack...</span>
                    </>
                  ) : (
                    <>
                      <span>Next: Tech Stack</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 5: TECH STACK ===================== */}
      {activeTab === 'techStack' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2638] pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                Calibrated Technology Stack
              </h3>
              <p className="text-xs text-slate-400">
                Pragmatic libraries, frameworks, and APIs calibrated for a {currentProject.development_time || '24h'} hackathon sprint
              </p>
            </div>
            <button
              onClick={() => handleGenerate('techStack')}
              disabled={Boolean(loadingAction)}
              className="px-3 py-1 bg-[#161c2a] hover:bg-[#1e2638] disabled:opacity-50 text-xs text-slate-300 rounded border border-[#242f44] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'techStack' ? 'animate-spin' : ''}`} />
              <span>Regenerate Stack</span>
            </button>
          </div>

          {!(solution?.tech_stack?.categories?.length || solution?.techStack?.categories?.length) ? (
            <div className="p-14 text-center rounded-md bg-[#111622] border border-[#1e2638]">
              <button
                onClick={() => handleGenerate('techStack')}
                disabled={Boolean(loadingAction)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md inline-flex items-center gap-2 transition-colors"
              >
                {loadingAction === 'techStack' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Configuring Stack...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Recommend Tech Stack</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {(solution.tech_stack?.stackSummary || solution.techStack?.stackSummary) && (
                <div className="p-3.5 rounded-md bg-[#0d121c] border border-[#1e2638] text-xs text-slate-300">
                  <strong className="text-slate-100 block mb-0.5">Stack Rationale:</strong>
                  {solution.tech_stack?.stackSummary || solution.techStack?.stackSummary}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(solution.tech_stack?.categories || solution.techStack?.categories || []).map((cat, i) => (
                  <div key={i} className="p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-2">
                    <div className="flex items-center justify-between border-b border-[#1e2638] pb-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        {cat.category}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-blue-400">{cat.technology}</div>
                    <p className="text-xs text-slate-300">{cat.purpose}</p>
                    <div className="pt-2 border-t border-[#1e2638] text-[11px] text-slate-400">
                      <span className="text-slate-500">Why Selected: </span>
                      {cat.whyRecommended}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-md bg-[#0d121c] border border-[#1e2638] flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Tech stack confirmed. Next, map the system architecture DAG.
                </span>
                <button
                  onClick={() => {
                    if (!solution?.architecture?.nodes?.length) handleGenerate('architecture');
                    setActiveTab('architecture');
                  }}
                  disabled={Boolean(loadingAction)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                >
                  {loadingAction === 'architecture' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating DAG...</span>
                    </>
                  ) : (
                    <>
                      <span>Next: System Architecture</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 6: ARCHITECTURE ===================== */}
      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2638] pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                Interactive System Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Component topology and dataflow DAG plotted with React Flow nodes & protocols
              </p>
            </div>
            <button
              onClick={() => handleGenerate('architecture')}
              disabled={Boolean(loadingAction)}
              className="px-3 py-1 bg-[#161c2a] hover:bg-[#1e2638] disabled:opacity-50 text-xs text-slate-300 rounded border border-[#242f44] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'architecture' ? 'animate-spin' : ''}`} />
              <span>Regenerate Architecture</span>
            </button>
          </div>

          {!solution?.architecture?.nodes?.length ? (
            <div className="p-14 text-center rounded-md bg-[#111622] border border-[#1e2638]">
              <button
                onClick={() => handleGenerate('architecture')}
                disabled={Boolean(loadingAction)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md inline-flex items-center gap-2 transition-colors"
              >
                {loadingAction === 'architecture' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Plotting DAG...</span>
                  </>
                ) : (
                  <>
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Generate Architecture Diagram</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <ArchitectureFlow architectureData={solution.architecture} />

              <div className="p-3.5 rounded-md bg-[#0d121c] border border-[#1e2638] flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Architecture verified. Next, schedule the milestone sprint roadmap.
                </span>
                <button
                  onClick={() => {
                    if (!solution?.roadmap?.phases?.length) handleGenerate('roadmap');
                    setActiveTab('roadmap');
                  }}
                  disabled={Boolean(loadingAction)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                >
                  {loadingAction === 'roadmap' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Scheduling Roadmap...</span>
                    </>
                  ) : (
                    <>
                      <span>Next: Execution Roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 7: ROADMAP ===================== */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2638] pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                Sprint Execution Roadmap
              </h3>
              <p className="text-xs text-slate-400">
                Sequential sprint phases calibrated for a {currentProject.development_time || '24h'} competition
              </p>
            </div>
            <button
              onClick={() => handleGenerate('roadmap')}
              disabled={Boolean(loadingAction)}
              className="px-3 py-1 bg-[#161c2a] hover:bg-[#1e2638] disabled:opacity-50 text-xs text-slate-300 rounded border border-[#242f44] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'roadmap' ? 'animate-spin' : ''}`} />
              <span>Regenerate Roadmap</span>
            </button>
          </div>

          {!solution?.roadmap?.phases?.length ? (
            <div className="p-14 text-center rounded-md bg-[#111622] border border-[#1e2638]">
              <button
                onClick={() => handleGenerate('roadmap')}
                disabled={Boolean(loadingAction)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md inline-flex items-center gap-2 transition-colors"
              >
                {loadingAction === 'roadmap' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Scheduling Roadmap...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Generate Development Roadmap</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {solution.roadmap.mvpRule && (
                <div className="p-3.5 rounded-md bg-[#1a1710] border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 block mb-0.5">Golden Hackathon MVP Rule:</strong>
                    {solution.roadmap.mvpRule}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {solution.roadmap.phases.map((phase, i) => (
                  <div key={i} className="p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2638] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-blue-600 text-white text-xs font-mono font-bold flex items-center justify-center">
                          {phase.phaseNumber || i + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-100">{phase.name}</h4>
                      </div>
                      <span className="text-[11px] font-mono text-blue-400 px-2 py-0.5 rounded bg-[#0d121c] border border-[#1e2638]">
                        {phase.duration}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                          Phase Objectives
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {(phase.objectives || []).map((obj, oIdx) => (
                            <li key={oIdx} className="flex items-start gap-1.5">
                              <span className="text-blue-400">•</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                          Concrete Deliverables
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {(phase.deliverables || []).map((del, dIdx) => (
                            <li key={dIdx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400">•</span>
                              <span>{del}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {phase.pitfallsToAvoid && (
                      <div className="pt-2 border-t border-[#1e2638] text-[11px] text-red-300">
                        <strong className="text-red-400">Pitfall to Avoid: </strong>
                        {phase.pitfallsToAvoid}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-md bg-[#0d121c] border border-[#1e2638] flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Execution schedule configured. Next, prepare judge pitch assets.
                </span>
                <button
                  onClick={() => {
                    if (!solution?.pitch?.pitch30s) handleGenerate('pitch');
                    setActiveTab('pitch');
                  }}
                  disabled={Boolean(loadingAction)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                >
                  {loadingAction === 'pitch' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Scripting Pitch...</span>
                    </>
                  ) : (
                    <>
                      <span>Next: Pitch Suite</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 8: PITCH COACH ===================== */}
      {activeTab === 'pitch' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2638] pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                Judge Pitch & Presentation Suite
              </h3>
              <p className="text-xs text-slate-400">
                30s elevator pitch, 1m quick-fire script, 3m demo breakdown, and 7-slide deck blueprint
              </p>
            </div>
            <button
              onClick={() => handleGenerate('pitch')}
              disabled={Boolean(loadingAction)}
              className="px-3 py-1 bg-[#161c2a] hover:bg-[#1e2638] disabled:opacity-50 text-xs text-slate-300 rounded border border-[#242f44] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'pitch' ? 'animate-spin' : ''}`} />
              <span>Regenerate Pitches</span>
            </button>
          </div>

          {!solution?.pitch?.pitch30s ? (
            <div className="p-14 text-center rounded-md bg-[#111622] border border-[#1e2638]">
              <button
                onClick={() => handleGenerate('pitch')}
                disabled={Boolean(loadingAction)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md inline-flex items-center gap-2 transition-colors"
              >
                {loadingAction === 'pitch' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Scripting Pitch Assets...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Generate Pitch Package</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 30-Second Elevator Pitch */}
              <div className="p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-3">
                <div className="flex items-center justify-between border-b border-[#1e2638] pb-2">
                  <span className="text-xs font-mono font-bold uppercase text-blue-400 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5" />
                    30-Second Elevator Pitch
                  </span>
                  <button
                    onClick={() =>
                      copyText(
                        `"${solution.pitch.pitch30s.hook}" "${solution.pitch.pitch30s.problem}" "${solution.pitch.pitch30s.solution}" "${solution.pitch.pitch30s.callToAction}"`,
                        '30s'
                      )
                    }
                    className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedPitch === '30s' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3 rounded bg-[#0d121c] border border-[#1e2638] space-y-2 text-xs text-slate-200">
                  <p><strong className="text-blue-300">Hook: </strong>"{solution.pitch.pitch30s.hook}"</p>
                  <p><strong className="text-blue-300">Problem: </strong>"{solution.pitch.pitch30s.problem}"</p>
                  <p><strong className="text-blue-300">Solution: </strong>"{solution.pitch.pitch30s.solution}"</p>
                  <p><strong className="text-blue-300">Call to Action: </strong>"{solution.pitch.pitch30s.callToAction}"</p>
                </div>
              </div>

              {/* 1-Minute Script */}
              {solution.pitch.pitch1m && (
                <div className="p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1e2638] pb-2">
                    <span className="text-xs font-mono font-bold uppercase text-sky-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      1-Minute Verbatim Demo Script
                    </span>
                    <button
                      onClick={() => copyText(solution.pitch.pitch1m.script, '1m')}
                      className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedPitch === '1m' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-3.5 rounded bg-[#0d121c] border border-[#1e2638] text-xs text-slate-300 leading-relaxed font-sans">
                    {solution.pitch.pitch1m.script}
                  </div>
                </div>
              )}

              {/* 3-Minute Judge Presentation */}
              {solution.pitch.pitch3m?.sections?.length > 0 && (
                <div className="p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-3">
                  <div className="border-b border-[#1e2638] pb-2">
                    <span className="text-xs font-mono font-bold uppercase text-slate-300">
                      3-Minute Stage Demo Breakdown
                    </span>
                  </div>
                  <div className="space-y-2">
                    {solution.pitch.pitch3m.sections.map((sec, i) => (
                      <div key={i} className="p-3 rounded bg-[#0d121c] border border-[#1e2638] text-xs">
                        <strong className="text-blue-300 block mb-1">{sec.part}</strong>
                        <p className="text-slate-300 leading-relaxed">{sec.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7-Slide Deck Outline */}
              {solution.pitch.slideDeck?.length > 0 && (
                <div className="p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-3">
                  <div className="border-b border-[#1e2638] pb-2">
                    <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                      7-Slide Hackathon Presentation Deck
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {solution.pitch.slideDeck.map((slide, i) => (
                      <div key={i} className="p-3.5 rounded bg-[#0d121c] border border-[#1e2638] space-y-2">
                        <div className="flex items-center justify-between border-b border-[#1e2638] pb-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase">
                            SLIDE {slide.slideNumber || i + 1}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-100">{slide.title}</h5>
                        <ul className="space-y-1 text-[11px] text-slate-400">
                          {(slide.talkingPoints || []).map((tp, tpIdx) => (
                            <li key={tpIdx}>• {tp}</li>
                          ))}
                        </ul>
                        {slide.visualSuggestion && (
                          <div className="text-[10px] text-blue-300 pt-1 border-t border-[#1e2638]">
                            Visual: {slide.visualSuggestion}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-md bg-[#0d121c] border border-[#1e2638] flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Pitch materials ready. Next, review team roles & skill assignments.
                </span>
                <button
                  onClick={() => {
                    if (!(solution?.team_roles?.roles?.length || solution?.teamRoles?.roles?.length)) {
                      handleGenerate('teamRoles');
                    }
                    setActiveTab('teamRoles');
                  }}
                  disabled={Boolean(loadingAction)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                >
                  {loadingAction === 'teamRoles' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Allocating Roles...</span>
                    </>
                  ) : (
                    <>
                      <span>Next: Team Roles</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 9: TEAM ROLES ===================== */}
      {activeTab === 'teamRoles' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2638] pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                Team Role Allocation & Skill Gap Mitigations
              </h3>
              <p className="text-xs text-slate-400">
                Dividing tasks among {currentProject.team_size || '1'} team member(s) with workarounds for missing skills
              </p>
            </div>
            <button
              onClick={() => handleGenerate('teamRoles')}
              disabled={Boolean(loadingAction)}
              className="px-3 py-1 bg-[#161c2a] hover:bg-[#1e2638] disabled:opacity-50 text-xs text-slate-300 rounded border border-[#242f44] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'teamRoles' ? 'animate-spin' : ''}`} />
              <span>Regenerate Roles</span>
            </button>
          </div>

          {!(solution?.team_roles?.roles?.length || solution?.teamRoles?.roles?.length) ? (
            <div className="p-14 text-center rounded-md bg-[#111622] border border-[#1e2638]">
              <button
                onClick={() => handleGenerate('teamRoles')}
                disabled={Boolean(loadingAction)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md inline-flex items-center gap-2 transition-colors"
              >
                {loadingAction === 'teamRoles' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Allocating Roles...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5" />
                    <span>Generate Role Assignments</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(solution.team_roles?.roles || solution.teamRoles?.roles || []).map((r, i) => (
                  <div key={i} className="p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-2">
                    <div className="flex items-center justify-between border-b border-[#1e2638] pb-1.5">
                      <span className="text-xs font-mono font-bold text-blue-400">{r.member}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0d121c] text-slate-400 border border-[#1e2638]">
                        {r.skillsUsed || 'Core Stack'}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100">{r.primaryRole}</h4>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {(r.responsibilities || []).map((resp, respIdx) => (
                        <li key={respIdx} className="flex items-start gap-1.5">
                          <span className="text-blue-400">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {(solution.team_roles?.mitigationAdvice || solution.teamRoles?.mitigationAdvice) && (
                <div className="p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-1.5">
                  <span className="text-xs font-mono font-bold uppercase text-amber-400">
                    Skill Gaps & Workaround Advice
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {solution.team_roles?.mitigationAdvice || solution.teamRoles?.mitigationAdvice}
                  </p>
                </div>
              )}

              <div className="p-3.5 rounded-md bg-[#0d121c] border border-[#1e2638] flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Full blueprint generated and verified across all 9 stages.
                </span>
                <button
                  onClick={handleExportBlueprint}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Complete Blueprint</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
