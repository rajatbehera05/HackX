import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard({ onOpenProject, onNewProjectClick }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProjects();
      setProjects(res.projects || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project plan?')) return;

    setDeletingId(id);
    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-7 h-7 text-indigo-400" />
            Project Plans & Workspaces
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access and manage your hackathon solution architectures, differentiators, and pitches
          </p>
        </div>

        <button
          onClick={onNewProjectClick}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Solution Plan</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/50 text-xs sm:text-sm text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading your saved plans...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No projects created yet</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Start by entering a hackathon challenge prompt or loading one of our sample problem statements.
            </p>
          </div>
          <button
            onClick={onNewProjectClick}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Plan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const hasAnalysis = Boolean(project.analyses?.length || project.analysis);
            const hasSolution = Boolean(project.selected_solutions?.length || project.selectedSolution);
            const domain = project.analyses?.[0]?.domain || project.analysis?.domain || 'General';
            const difficulty = project.analyses?.[0]?.difficulty || project.analysis?.difficulty || 'Medium';

            return (
              <div
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className="p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 shadow-md hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {domain}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, project.id)}
                      disabled={deletingId === project.id}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & snippet */}
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1.5">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {project.problem_statement}
                  </p>
                </div>

                {/* Footer Info */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{project.development_time || '24h'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Open Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
