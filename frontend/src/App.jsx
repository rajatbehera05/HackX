import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ProjectWorkspace from './components/workspace/ProjectWorkspace';
import ProblemInputModal from './components/ProblemInputModal';
import { api } from './services/api';
import { useAuth } from './context/AuthContext';
import { Loader2, ArrowLeft, Lock } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Authentication Required</h3>
        <p className="text-xs text-slate-400">
          You must be signed in to view projects, architectures, and saved blueprints.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
        >
          Return to Home & Sign In
        </button>
      </div>
    );
  }

  return children;
}

function WorkspaceWrapper() {
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
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
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
              <ProtectedRoute>
                <Dashboard
                  onOpenProject={(id) => navigate(`/project/${id}`)}
                  onNewProjectClick={() => setShowModal(true)}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:id"
            element={
              <ProtectedRoute>
                <WorkspaceWrapper />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2638] bg-[#0d121c] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300 font-mono">HackX</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Hackathon Decision Support & Architecture Workspace</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
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
