import React, { useEffect, useState, useMemo } from 'react';
import {
  FolderKanban,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  Search,
  Loader2,
  AlertCircle,
  Users,
  LayoutList,
  LayoutGrid,
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard({ onOpenProject, onNewProjectClick }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

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

  const handleDelete = async (e, id, title) => {
    e.stopPropagation();
    if (!window.confirm(`Delete workspace "${title || 'Untitled'}"? This action cannot be undone.`)) {
      return;
    }

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

  // Helper to determine stage of the project from real data
  const getProjectStage = (project) => {
    const hasSolution = Boolean(project.selected_solutions?.length || project.selectedSolution);
    const hasIdeas = Boolean(project.ideas?.length);
    const hasAnalysis = Boolean(project.analyses?.length || project.analysis);

    if (hasSolution) {
      const sol = project.selected_solutions?.[0] || project.selectedSolution;
      if (sol?.architecture || sol?.roadmap || sol?.pitch) {
        return { label: 'Complete Blueprint', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      }
      return { label: 'Solution Selected', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    }
    if (hasIdeas) {
      return { label: 'Ideas Evaluated', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    }
    if (hasAnalysis) {
      return { label: 'Problem Analyzed', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
    }
    return { label: 'Intake Draft', color: 'text-slate-400 bg-slate-800/60 border-slate-700/60' };
  };

  const getDomain = (project) => {
    return project.analyses?.[0]?.domain || project.analysis?.domain || 'General Track';
  };

  // Unique domains for filtering
  const domainOptions = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      const d = getDomain(p);
      if (d) set.add(d);
    });
    return Array.from(set);
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.problem_statement?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getDomain(p).toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDomain = selectedDomain === 'ALL' || getDomain(p) === selectedDomain;

      return matchesSearch && matchesDomain;
    });
  }, [projects, searchQuery, selectedDomain]);

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Projects & Workspaces
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#161c2a] text-slate-400 border border-[#232d42]">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Active hackathon solution architectures, trade-off comparisons, and execution plans
          </p>
        </div>

        <button
          onClick={onNewProjectClick}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-md flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-md bg-red-950/40 border border-red-800/40 text-xs text-red-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchProjects}
            className="text-xs text-red-300 hover:text-white underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      {!loading && projects.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by title, domain, or problem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#111622] border border-[#1e2638] focus:border-blue-500 focus:outline-none rounded-md text-slate-200 placeholder-slate-500"
              />
            </div>

            {domainOptions.length > 1 && (
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#111622] border border-[#1e2638] text-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
              >
                <option value="ALL">All Tracks</option>
                {domainOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-[#111622] p-1 border border-[#1e2638] rounded-md self-end sm:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'table' ? 'bg-[#1e2638] text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table view"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-[#1e2638] text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 text-center rounded-md bg-[#111622] border border-[#1e2638]">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2.5" />
          <p className="text-xs text-slate-400">Loading workspaces...</p>
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-md bg-[#111622] border border-[#1e2638] max-w-lg mx-auto space-y-4 my-8">
          <div className="w-10 h-10 rounded-md bg-[#161c2a] border border-[#232d42] flex items-center justify-center text-slate-400 mx-auto">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">No projects in this workspace</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Initialize a hackathon problem statement to start generating analysis, comparing solution architectures, and assembling pitch decks.
            </p>
          </div>
          <button
            onClick={onNewProjectClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-8 text-center rounded-md bg-[#111622] border border-[#1e2638] text-xs text-slate-400">
          No projects match your search filter "{searchQuery}".
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="border border-[#1e2638] rounded-md overflow-hidden bg-[#111622]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e131d] text-slate-400 uppercase font-mono text-[11px] border-b border-[#1e2638]">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Project / Challenge</th>
                  <th className="py-2.5 px-4 font-medium">Track</th>
                  <th className="py-2.5 px-4 font-medium">Planning Stage</th>
                  <th className="py-2.5 px-4 font-medium">Constraints</th>
                  <th className="py-2.5 px-4 font-medium">Date</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]">
                {filteredProjects.map((project) => {
                  const stage = getProjectStage(project);
                  const domain = getDomain(project);

                  return (
                    <tr
                      key={project.id}
                      onClick={() => onOpenProject(project.id)}
                      className="hover:bg-[#141b29] cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1">
                          {project.title}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {project.problem_statement}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#161c2a] text-slate-300 border border-[#232d42]">
                          {domain}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${stage.color}`}>
                          {stage.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {project.development_time || '24h'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-500" />
                            {project.team_size || '1'} dev
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {formatDate(project.updated_at || project.created_at)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenProject(project.id);
                            }}
                            className="px-2.5 py-1 rounded bg-[#1a2130] hover:bg-blue-600 hover:text-white text-slate-300 text-[11px] font-medium border border-[#242f44] transition-colors"
                          >
                            Open
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, project.id, project.title)}
                            disabled={deletingId === project.id}
                            className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const stage = getProjectStage(project);
            const domain = getDomain(project);

            return (
              <div
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className="p-4 rounded-md bg-[#111622] hover:bg-[#141b29] border border-[#1e2638] hover:border-[#2e3b55] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#161c2a] text-slate-300 border border-[#232d42]">
                      {domain}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, project.id, project.title)}
                      disabled={deletingId === project.id}
                      className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {project.problem_statement}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1e2638] flex items-center justify-between text-[11px]">
                  <span className={`px-2 py-0.5 rounded border ${stage.color}`}>
                    {stage.label}
                  </span>

                  <div className="flex items-center gap-1 text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
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
