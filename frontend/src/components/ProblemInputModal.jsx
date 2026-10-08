import React, { useState } from 'react';
import { X, Sparkles, Clock, Users, Wrench, Cpu, DollarSign, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { api } from '../services/api';

const PRESETS = [
  {
    title: 'Rural Telemedicine with Low Bandwidth',
    domain: 'Healthcare',
    statement: 'Patients in remote rural clinics frequently experience intermittent, 2G-level cellular connectivity and cannot access medical specialists in metropolitan hospitals. Design an asynchronous, low-bandwidth clinical consultation platform that compresses high-resolution diagnostic imagery, supports localized edge voice transcription, and queues patient triage records for store-and-forward teleconsultation without packet drops.',
    skills: 'React, Node.js, WebRTC, SQLite, Compression Algorithms',
    time: '24 hours',
    size: '3',
    hardware: 'Raspberry Pi 4, Medical Sensors'
  },
  {
    title: 'Urban Flash Flood Early Warning & Triage',
    domain: 'Climate & Smart Cities',
    statement: 'During sudden monsoon flash floods, municipal drainage systems overflow unpredictably, trapping low-lying settlements before city disaster authorities can issue targeted evacuation alerts. Build a decentralized hydrological monitoring and hyper-local emergency dispatch system that ingests IoT storm drain ultrasonic level sensors, predicts street-level flood peaks 45 minutes ahead, and disseminates multilingual offline SMS/mesh alerts.',
    skills: 'Python, FastAPI, IoT, React, PostgreSQL',
    time: '24 hours',
    size: '4',
    hardware: 'ESP32, Ultrasonic Distance Sensor, LoRa module'
  },
  {
    title: 'Adaptive AI Micro-Tutor for Neurodivergent Learners',
    domain: 'EdTech & Accessibility',
    statement: 'Standard algorithmic online learning platforms present rigid, high-friction interfaces that overwhelm students with ADHD and sensory processing difficulties. Develop an adaptive micro-learning workspace that dynamically adjusts cognitive load, chunking complex STEM lessons into gamified bite-sized challenges with real-time multimodal accessibility, personalized pacing, and executive dysfunction task timers.',
    skills: 'React, Tailwind CSS, Python, Web Speech API',
    time: '3 days',
    size: '2',
    hardware: 'None'
  },
  {
    title: 'Micro-Merchant Lending Fraud Defense',
    domain: 'FinTech',
    statement: 'Informal small street vendors and micro-merchants lack formal credit history and tax filings, making it difficult for community credit unions to extend working capital loans while preventing synthetic identity fraud and loan stacking. Create an alternative credit appraisal system utilizing verified UPI/digital wallet receipt metadata, localized supplier peer vouchers, and explainable risk scoring.',
    skills: 'TypeScript, Express, PostgreSQL, Data Visualization',
    time: '24 hours',
    size: '3',
    hardware: 'None'
  }
];

const TIME_OPTIONS = ['8 hours', '24 hours', '3 days', '1 week', '2 weeks'];
const TEAM_SIZES = ['1', '2', '3', '4', '5+'];

export default function ProblemInputModal({ onClose, onProjectCreated }) {
  const [problemStatement, setProblemStatement] = useState('');
  const [title, setTitle] = useState('');
  const [teamSize, setTeamSize] = useState('3');
  const [teamSkills, setTeamSkills] = useState('React, Node.js, JavaScript, Tailwind');
  const [developmentTime, setDevelopmentTime] = useState('24 hours');
  const [budget, setBudget] = useState('Minimal / Free tier');
  const [hardware, setHardware] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setProblemStatement(preset.statement);
    setTeamSkills(preset.skills);
    setDevelopmentTime(preset.time);
    setTeamSize(preset.size);
    setHardware(preset.hardware);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problemStatement.trim()) {
      setError('Please provide a hackathon problem statement to proceed.');
      return;
    }
    if (problemStatement.trim().length < 20) {
      setError('Please provide a more detailed problem statement (minimum 20 characters).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.createProject({
        title: title.trim() || undefined,
        problemStatement: problemStatement.trim(),
        teamSize,
        teamSkills: teamSkills.trim(),
        developmentTime,
        budget: budget.trim(),
        hardware: hardware.trim(),
      });

      if (result.project) {
        onProjectCreated(result.project);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Create Solution Plan</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Provide your problem statement and team constraints to initiate the HackX decision engine
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-6 p-3 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Quick-load Real Hackathon Problem Statements:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-left p-2 rounded-lg bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800/80 hover:border-indigo-600/40 transition-all text-xs text-slate-300 group"
              >
                <div className="font-medium text-white group-hover:text-indigo-300 truncate">{p.title}</div>
                <div className="text-[11px] text-slate-500">{p.domain} • {p.time}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Optional Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Project Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. TeleClinic Lite / FloodWatch Sentinel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Problem Statement */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Problem Statement <span className="text-red-400">*</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {problemStatement.length} characters
              </span>
            </div>
            <textarea
              required
              rows={5}
              placeholder="Paste the hackathon challenge prompt, user pain points, constraints, or problem context here..."
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none font-sans"
            />
          </div>

          {/* Context Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Development Time */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Available Time
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {TIME_OPTIONS.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setDevelopmentTime(time)}
                    className={`py-2 px-1 text-center text-xs rounded-lg font-medium border transition-all ${
                      developmentTime === time
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Size */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Team Size
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {TEAM_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setTeamSize(size)}
                    className={`py-2 px-1 text-center text-xs rounded-lg font-medium border transition-all ${
                      teamSize === size
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {size} {size === '1' ? 'dev' : 'devs'}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Skills */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                Team Skills
              </label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, Python, OpenCV"
                value={teamSkills}
                onChange={(e) => setTeamSkills(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Hardware (Optional) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Hardware (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. ESP32, Raspberry Pi, Arduino, None"
                value={hardware}
                onChange={(e) => setHardware(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initializing Plan...</span>
                </>
              ) : (
                <>
                  <span>Launch Solution Engine</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
