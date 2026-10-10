import React, { useState } from 'react';
import { X, Clock, Users, Wrench, Cpu, ArrowRight, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const PRESETS = [
  {
    title: 'Rural Telemedicine with Low Bandwidth',
    domain: 'Healthcare',
    statement: 'Patients in remote rural clinics frequently experience intermittent, 2G-level cellular connectivity and cannot access medical specialists in metropolitan hospitals. Design an asynchronous, low-bandwidth clinical consultation platform that compresses high-resolution diagnostic imagery, supports localized edge voice transcription, and queues patient triage records for store-and-forward teleconsultation without packet drops.',
    skills: 'React, Node.js, WebRTC, SQLite, Compression',
    time: '24 hours',
    size: '3',
    budget: 'Minimal / Free tier',
    hardware: 'Raspberry Pi 4, Medical Sensors'
  },
  {
    title: 'Urban Flash Flood Early Warning & Triage',
    domain: 'Climate & IoT',
    statement: 'During sudden monsoon flash floods, municipal drainage systems overflow unpredictably, trapping low-lying settlements before city disaster authorities can issue targeted evacuation alerts. Build a decentralized hydrological monitoring and hyper-local emergency dispatch system that ingests IoT storm drain ultrasonic level sensors, predicts street-level flood peaks 45 minutes ahead, and disseminates multilingual offline SMS/mesh alerts.',
    skills: 'Python, FastAPI, IoT, React, PostgreSQL',
    time: '24 hours',
    size: '4',
    budget: '$50 for sensors',
    hardware: 'ESP32, Ultrasonic Sensor, LoRa module'
  },
  {
    title: 'Adaptive AI Micro-Tutor for Neurodivergent Learners',
    domain: 'EdTech',
    statement: 'Standard algorithmic online learning platforms present rigid, high-friction interfaces that overwhelm students with ADHD and sensory processing difficulties. Develop an adaptive micro-learning workspace that dynamically adjusts cognitive load, chunking complex STEM lessons into gamified bite-sized challenges with real-time multimodal accessibility, personalized pacing, and executive dysfunction task timers.',
    skills: 'React, Tailwind CSS, Python, Web Speech API',
    time: '3 days',
    size: '2',
    budget: 'Free tier',
    hardware: 'None'
  },
  {
    title: 'Micro-Merchant Lending Fraud Defense',
    domain: 'FinTech',
    statement: 'Informal small street vendors and micro-merchants lack formal credit history and tax filings, making it difficult for community credit unions to extend working capital loans while preventing synthetic identity fraud and loan stacking. Create an alternative credit appraisal system utilizing verified UPI/digital wallet receipt metadata, localized supplier peer vouchers, and explainable risk scoring.',
    skills: 'TypeScript, Express, PostgreSQL, Data Visualization',
    time: '24 hours',
    size: '3',
    budget: 'Free tier',
    hardware: 'None'
  }
];

const TIME_OPTIONS = ['8 hours', '24 hours', '3 days', '1 week'];
const TEAM_SIZES = ['1', '2', '3', '4', '5+'];

export default function ProblemInputModal({ onClose, onProjectCreated }) {
  const [problemStatement, setProblemStatement] = useState('');
  const [title, setTitle] = useState('');
  const [teamSize, setTeamSize] = useState('3');
  const [teamSkills, setTeamSkills] = useState('React, Node.js, Python, PostgreSQL');
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
    setBudget(preset.budget || 'Minimal / Free tier');
    setHardware(preset.hardware);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problemStatement.trim()) {
      setError('Please provide a hackathon challenge or problem statement to proceed.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#111622] border border-[#1e2638] rounded-lg shadow-2xl p-6 sm:p-7 relative text-slate-100 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-100 rounded-md hover:bg-[#1a2130] transition-colors"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pb-4 border-b border-[#1e2638]">
          <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
            New Project Intake
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Define your challenge prompt and team constraints for the decision engine
          </p>
        </div>

        {/* Preset Selector */}
        <div className="mb-5 p-3 rounded-md bg-[#0d121c] border border-[#1c2436]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              Load Sample Hackathon Prompts:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-left px-2 py-1.5 rounded bg-[#131926] hover:bg-[#1a2233] border border-[#1e273a] hover:border-blue-500/40 text-[11px] text-slate-300 transition-colors"
              >
                <div className="font-medium text-slate-200 truncate">{p.domain}</div>
                <div className="text-[10px] text-slate-500 truncate">{p.title.split(' ')[0]}...</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-950/40 border border-red-800/40 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Optional Project Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Project Name <span className="text-slate-500 text-[11px]">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. FloodWatch Sentinel or TeleClinic Lite"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#0b0f17] border border-[#1e2638] rounded-md text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Problem Statement */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">
                Problem Statement & Hackathon Prompt <span className="text-blue-400">*</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {problemStatement.length} chars
              </span>
            </div>
            <textarea
              required
              rows={4}
              placeholder="Paste the problem statement, user friction, hardware constraints, or track requirements here..."
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#0b0f17] border border-[#1e2638] rounded-md text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Constraints Grid */}
          <div className="p-3.5 rounded-md bg-[#0d121c] border border-[#1c2436] space-y-3.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Execution Constraints & Team Calibrations
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Timeline */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Development Timeline
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {TIME_OPTIONS.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setDevelopmentTime(time)}
                      className={`py-1 text-center text-[11px] rounded border transition-colors ${
                        developmentTime === time
                          ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                          : 'bg-[#111622] border-[#1e2638] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team Size */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-slate-400" />
                  Team Size
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {TEAM_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTeamSize(size)}
                      className={`py-1 text-center text-[11px] rounded border transition-colors ${
                        teamSize === size
                          ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                          : 'bg-[#111622] border-[#1e2638] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {size} {size === '1' ? 'dev' : 'devs'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team Skills */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Wrench className="w-3 h-3 text-slate-400" />
                  Available Skills
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Python, PostgreSQL"
                  value={teamSkills}
                  onChange={(e) => setTeamSkills(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#0b0f17] border border-[#1e2638] rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Hardware / Budget */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-slate-400" />
                  Hardware & Equipment (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ESP32, Raspberry Pi, Arduino, None"
                  value={hardware}
                  onChange={(e) => setHardware(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#0b0f17] border border-[#1e2638] rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-[#1e2638] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#1a2130] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-md flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
