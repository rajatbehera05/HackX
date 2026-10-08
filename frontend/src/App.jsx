import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ProjectWorkspace from './components/workspace/ProjectWorkspace';
import ProblemInputModal from './components/ProblemInputModal';
import { api } from './services/api';
import { Loader2, ArrowLeft } from 'lucide-react';

function WorkspaceWrapper({ onBackToDashboard }) {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadProject = async () => {
    try {
      setLoading(true);
      const res = await api.getProject(id);
      setProject(res.project);
    } catch (err) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading project blueprint...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-red-400">{error || 'Project not found.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs hover:bg-slate-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Projects</span>
        </button>
      </div>
      <ProjectWorkspace project={project} onProjectUpdated={loadProject} />
    </div>
  );
}

function MainApp() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleProjectCreated = (newProject) => {
    navigate(`/project/${newProject.id}`);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar onNewProjectClick={() => setShowModal(true)} />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                onStartPlanning={() => setShowModal(true)}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                onOpenProject={(id) => navigate(`/project/${id}`)}
                onNewProjectClick={() => setShowModal(true)}
              />
            }
          />
          <Route
            path="/project/:id"
            element={<WorkspaceWrapper />}
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-400">HackX</span> — AI Hackathon Decision Support & Solution Planning Engine
          </div>
          <div className="text-[11px] text-slate-600">
            Powered by Google Gemini & React Flow
          </div>
        </div>
      </footer>

      {showModal && (
        <ProblemInputModal
          onClose={() => setShowModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </AuthProvider>
  );
}
