import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { CheckCircle2, Award } from 'lucide-react';

const PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function ComparisonChart({ ideas, onSelectIdea, selectedIdeaId }) {
  if (!ideas || ideas.length === 0) {
    return (
      <div className="p-8 rounded-md bg-[#111622] border border-[#1e2638] text-xs text-slate-400 text-center">
        No solution ideas generated yet. Complete step 2 to run deterministic scoring.
      </div>
    );
  }

  // Scoring criteria weights from specification:
  // Feasibility 25%, Innovation 20%, Impact 20%, Demo 15%, Cost 10%, Scalability 10%
  const CRITERIA = [
    { key: 'feasibility', label: 'Feasibility', weight: '25%', factor: 0.25 },
    { key: 'innovation', label: 'Innovation', weight: '20%', factor: 0.20 },
    { key: 'impact', label: 'Impact', weight: '20%', factor: 0.20 },
    { key: 'demo', label: 'Demo Potential', weight: '15%', factor: 0.15 },
    { key: 'cost', label: 'Cost Value', weight: '10%', factor: 0.10 },
    { key: 'scalability', label: 'Scalability', weight: '10%', factor: 0.10 },
  ];

  // Prepare radar chart data
  const radarData = CRITERIA.map((crit) => {
    const item = { metric: `${crit.label} (${crit.weight})` };
    ideas.forEach((idea, idx) => {
      let score = 5;
      if (crit.key === 'feasibility') score = idea.feasibility_score ?? idea.feasibilityScore ?? 5;
      else if (crit.key === 'innovation') score = idea.innovation_score ?? idea.innovationScore ?? 5;
      else if (crit.key === 'impact') score = idea.impact_score ?? idea.impactScore ?? 5;
      else if (crit.key === 'demo') score = idea.demo_score ?? idea.demoScore ?? 5;
      else if (crit.key === 'cost') score = idea.cost_score ?? idea.costScore ?? 5;
      else if (crit.key === 'scalability') score = idea.scalability_score ?? idea.scalabilityScore ?? 5;

      item[`Idea ${idx + 1}`] = Number(score);
    });
    return item;
  });

  // Calculate weighted totals for deterministic ranking
  const rankedIdeas = ideas.map((idea, idx) => {
    const feas = Number(idea.feasibility_score ?? idea.feasibilityScore ?? 5);
    const inno = Number(idea.innovation_score ?? idea.innovationScore ?? 5);
    const imp = Number(idea.impact_score ?? idea.impactScore ?? 5);
    const demo = Number(idea.demo_score ?? idea.demoScore ?? 5);
    const cost = Number(idea.cost_score ?? idea.costScore ?? 5);
    const scale = Number(idea.scalability_score ?? idea.scalabilityScore ?? 5);

    const weightedScore =
      feas * 0.25 +
      inno * 0.20 +
      imp * 0.20 +
      demo * 0.15 +
      cost * 0.10 +
      scale * 0.10;

    const totalScore = Math.round(weightedScore * 10 * 10) / 10;

    return {
      ...idea,
      originalIndex: idx,
      calculatedTotal: totalScore,
      color: PALETTE[idx % PALETTE.length],
    };
  });

  const sortedRanked = [...rankedIdeas].sort((a, b) => b.calculatedTotal - a.calculatedTotal);
  const topPick = sortedRanked[0];

  return (
    <div className="space-y-6">
      {/* Top Pick Recommendation Banner */}
      {topPick && (
        <div className="p-4 sm:p-5 rounded-md bg-[#111622] border border-[#1e2638] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Award className="w-3 h-3" />
                DETERMINISTIC TOP PICK
              </span>
              <span className="text-xs font-mono text-slate-400">
                Score: <strong className="text-slate-100">{topPick.calculatedTotal}</strong>/100
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-100">
              {topPick.title}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {topPick.recommendation_reason || topPick.concept || topPick.description}
            </p>
          </div>

          <button
            onClick={() => onSelectIdea(topPick.id)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedIdeaId === topPick.id
                ? 'bg-[#1a2333] text-emerald-400 border border-emerald-500/30 cursor-default flex items-center gap-1.5'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {selectedIdeaId === topPick.id ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Selected as Active Plan</span>
              </>
            ) : (
              'Select Top Recommendation'
            )}
          </button>
        </div>
      )}

      {/* Decision Matrix Table */}
      <div className="border border-[#1e2638] rounded-md overflow-hidden bg-[#111622]">
        <div className="p-3.5 border-b border-[#1e2638] bg-[#0d121c] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Decision Scoring Matrix
            </h4>
            <p className="text-[11px] text-slate-400">
              Deterministic weights applied directly to AI-assessed dimensions
            </p>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            F:25% + I:20% + Imp:20% + D:15% + C:10% + S:10% = 100%
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f1420] text-slate-400 border-b border-[#1e2638] text-[11px] font-mono">
              <tr>
                <th className="py-2.5 px-4 font-semibold w-48">Evaluation Dimension</th>
                {rankedIdeas.map((idea, idx) => {
                  const isSelected = selectedIdeaId === idea.id;
                  const isTop = topPick?.id === idea.id;
                  return (
                    <th
                      key={idea.id || idx}
                      className={`py-2.5 px-4 font-semibold min-w-[160px] ${
                        isSelected ? 'bg-blue-950/20 text-blue-300' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate">Idea {idx + 1}: {idea.title}</span>
                        {isTop && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded border border-emerald-500/30">
                            TOP
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638] text-slate-300">
              {CRITERIA.map((crit) => (
                <tr key={crit.key} className="hover:bg-[#141b29] transition-colors">
                  <td className="py-2.5 px-4 font-medium text-slate-300 whitespace-nowrap bg-[#0d121c]/50">
                    <div className="flex items-center justify-between">
                      <span>{crit.label}</span>
                      <span className="text-[10px] font-mono text-slate-500">{crit.weight}</span>
                    </div>
                  </td>
                  {rankedIdeas.map((idea, idx) => {
                    let val = 5;
                    if (crit.key === 'feasibility') val = idea.feasibility_score ?? idea.feasibilityScore ?? 5;
                    else if (crit.key === 'innovation') val = idea.innovation_score ?? idea.innovationScore ?? 5;
                    else if (crit.key === 'impact') val = idea.impact_score ?? idea.impactScore ?? 5;
                    else if (crit.key === 'demo') val = idea.demo_score ?? idea.demoScore ?? 5;
                    else if (crit.key === 'cost') val = idea.cost_score ?? idea.costScore ?? 5;
                    else if (crit.key === 'scalability') val = idea.scalability_score ?? idea.scalabilityScore ?? 5;

                    const isSelected = selectedIdeaId === idea.id;

                    return (
                      <td
                        key={idea.id || idx}
                        className={`py-2.5 px-4 font-mono text-xs ${
                          isSelected ? 'bg-blue-950/10 font-bold text-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{val}/10</span>
                          <div className="w-16 h-1.5 rounded-full bg-[#1e2638] overflow-hidden hidden sm:block">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${Math.min(100, (val / 10) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-[#0e1420] font-bold border-t-2 border-[#1e2638]">
                <td className="py-3 px-4 text-slate-100 font-mono text-xs uppercase tracking-wider">
                  Weighted Score
                </td>
                {rankedIdeas.map((idea, idx) => {
                  const isSelected = selectedIdeaId === idea.id;
                  const isTop = topPick?.id === idea.id;
                  return (
                    <td
                      key={idea.id || idx}
                      className={`py-3 px-4 font-mono text-sm ${
                        isTop ? 'text-emerald-400' : 'text-slate-200'
                      } ${isSelected ? 'bg-blue-950/20' : ''}`}
                    >
                      <span>{idea.calculatedTotal}</span>
                      <span className="text-[10px] text-slate-500 font-normal"> / 100</span>
                    </td>
                  );
                })}
              </tr>

              {/* Action / Selection Row */}
              <tr className="bg-[#0d121c]">
                <td className="py-3 px-4 text-slate-400 text-xs">Active Plan</td>
                {rankedIdeas.map((idea, idx) => {
                  const isSelected = selectedIdeaId === idea.id;
                  return (
                    <td key={idea.id || idx} className="py-3 px-4">
                      <button
                        onClick={() => onSelectIdea(idea.id)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          isSelected
                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold'
                            : 'bg-[#1e2638] hover:bg-blue-600 hover:text-white text-slate-300 font-medium'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : 'Choose'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Radar Chart + Trade-off Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Diagram */}
        <div className="p-4 rounded-md bg-[#111622] border border-[#1e2638]">
          <div className="flex items-center justify-between mb-3 border-b border-[#1e2638] pb-2">
            <h4 className="text-xs font-semibold text-slate-200">
              Dimensional Radar Profile
            </h4>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              {rankedIdeas.map((idea, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: idea.color }}
                  />
                  <span>Idea {i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e2638" />
                <PolarAngleAxis dataKey="metric" stroke="#64748b" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#2a3449" tick={{ fontSize: 9 }} />
                {rankedIdeas.map((idea, i) => (
                  <Radar
                    key={i}
                    name={`Idea ${i + 1}`}
                    dataKey={`Idea ${i + 1}`}
                    stroke={idea.color}
                    fill={idea.color}
                    fillOpacity={0.15}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trade-off Analysis */}
        <div className="p-4 rounded-md bg-[#111622] border border-[#1e2638] space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-200 border-b border-[#1e2638] pb-2 mb-3">
              Trade-Off Breakdown
            </h4>
            <div className="space-y-2.5">
              {rankedIdeas.map((idea, idx) => (
                <div
                  key={idea.id || idx}
                  className="p-3 rounded bg-[#0d121c] border border-[#1e2638] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">
                      Idea {idx + 1}: {idea.title}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Score: {idea.calculatedTotal}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {idea.concept}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded bg-[#0e1420] border border-[#1e2638] text-[11px] text-slate-400">
            <strong className="text-slate-300">Decision Rule:</strong> The scoring engine prioritizes feasibility and demo potential (40% total) to ensure hackathon working code viability over theoretical innovation.
          </div>
        </div>
      </div>
    </div>
  );
}
