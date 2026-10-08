import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Award, CheckCircle, Flame, Sparkles } from 'lucide-react';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export default function ComparisonChart({ ideas, onSelectIdea, selectedIdeaId }) {
  if (!ideas || ideas.length === 0) {
    return <div className="text-slate-500 text-sm">No ideas to compare yet.</div>;
  }

  // Multi-dimensional metrics for radar comparison
  const criteria = [
    { key: 'feasibility', label: 'Feasibility (25%)' },
    { key: 'innovation', label: 'Innovation (20%)' },
    { key: 'impact', label: 'Impact (20%)' },
    { key: 'demo', label: 'Demo (15%)' },
    { key: 'cost', label: 'Cost Value (10%)' },
    { key: 'scalability', label: 'Scalability (10%)' },
  ];

  const radarData = criteria.map((c) => {
    const item = { metric: c.label };
    ideas.forEach((idea, idx) => {
      const score =
        c.key === 'feasibility' ? (idea.feasibility_score || idea.feasibilityScore) :
        c.key === 'innovation' ? (idea.innovation_score || idea.innovationScore) :
        c.key === 'impact' ? (idea.impact_score || idea.impactScore) :
        c.key === 'demo' ? (idea.demo_score || idea.demoScore) :
        c.key === 'cost' ? (idea.cost_score || idea.costScore) :
        (idea.scalability_score || idea.scalabilityScore);
      item[`Idea ${idx + 1}`] = score || 5;
    });
    return item;
  });

  // Calculate weighted total for each idea deterministically
  const ranked = [...ideas].map((idea, idx) => {
    const feas = Number(idea.feasibility_score || idea.feasibilityScore || 5);
    const inno = Number(idea.innovation_score || idea.innovationScore || 5);
    const imp = Number(idea.impact_score || idea.impactScore || 5);
    const demo = Number(idea.demo_score || idea.demoScore || 5);
    const cost = Number(idea.cost_score || idea.costScore || 5);
    const scale = Number(idea.scalability_score || idea.scalabilityScore || 5);

    const weighted = (feas * 0.25) + (inno * 0.20) + (imp * 0.20) + (demo * 0.15) + (cost * 0.10) + (scale * 0.10);
    const totalScore = Math.round(weighted * 10 * 10) / 10;

    return {
      ...idea,
      calculatedTotal: totalScore,
      color: COLORS[idx % COLORS.length],
    };
  }).sort((a, b) => b.calculatedTotal - a.calculatedTotal);

  const topPick = ranked[0];

  return (
    <div className="space-y-6">
      {/* Top Pick Recommendation Highlight */}
      {topPick && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500 text-white">
                    Algorithm Recommendation
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    Weighted Fit: {topPick.calculatedTotal}/100
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">{topPick.title}</h3>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                  {topPick.recommendation_reason || topPick.concept}
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectIdea(topPick.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-md ${
                selectedIdeaId === topPick.id
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {selectedIdeaId === topPick.id ? '✓ Selected as Plan Base' : 'Select Top Recommendation'}
            </button>
          </div>
        </div>
      )}

      {/* Visual Chart + Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Comparison Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Multi-Vector Radar Comparison
            </h4>
            <div className="flex items-center gap-3 text-xs">
              {ideas.map((_, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span>Idea {i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#475569" />
                {ideas.map((_, i) => (
                  <Radar
                    key={i}
                    name={`Idea ${i + 1}`}
                    dataKey={`Idea ${i + 1}`}
                    stroke={COLORS[i % COLORS.length]}
                    fill={COLORS[i % COLORS.length]}
                    fillOpacity={0.25}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weighted Score Table */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Weighted Evaluation Ranking</h4>
              <span className="text-[11px] text-slate-500 font-mono">Formula: F:25% I:20% Imp:20% D:15% C:10% S:10%</span>
            </div>

            <div className="space-y-3">
              {ranked.map((idea, idx) => (
                <div
                  key={idea.id || idx}
                  className={`p-3 rounded-xl border transition-all ${
                    selectedIdeaId === idea.id
                      ? 'bg-indigo-950/30 border-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-bold flex items-center justify-center text-slate-300">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-[260px]">
                        {idea.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs font-bold text-indigo-400 font-mono">
                          {idea.calculatedTotal}
                        </span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </div>
                      <button
                        onClick={() => onSelectIdea(idea.id)}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                          selectedIdeaId === idea.id
                            ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {selectedIdeaId === idea.id ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>

                  {/* Micro score breakdown bar */}
                  <div className="mt-2 grid grid-cols-6 gap-1 text-[10px] text-slate-400 text-center font-mono">
                    <div className="bg-slate-900 py-0.5 rounded">F:{idea.feasibility_score || idea.feasibilityScore}</div>
                    <div className="bg-slate-900 py-0.5 rounded">I:{idea.innovation_score || idea.innovationScore}</div>
                    <div className="bg-slate-900 py-0.5 rounded">Imp:{idea.impact_score || idea.impactScore}</div>
                    <div className="bg-slate-900 py-0.5 rounded">D:{idea.demo_score || idea.demoScore}</div>
                    <div className="bg-slate-900 py-0.5 rounded">C:{idea.cost_score || idea.costScore}</div>
                    <div className="bg-slate-900 py-0.5 rounded">S:{idea.scalability_score || idea.scalabilityScore}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
