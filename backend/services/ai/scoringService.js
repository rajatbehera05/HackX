/**
 * HackX Deterministic Scoring Engine
 * 
 * Scores ideas based on weighted evaluation criteria specified in PRD Section 16:
 * - Feasibility: 25%
 * - Innovation: 20%
 * - Impact: 20%
 * - Demo Potential: 15%
 * - Cost: 10% (Cost efficiency: 10 is low-cost/budget-friendly, 1 is prohibitively expensive)
 * - Scalability: 10%
 */

export const SCORING_WEIGHTS = {
  feasibility: 0.25,
  innovation: 0.20,
  impact: 0.20,
  demo: 0.15,
  cost: 0.10,
  scalability: 0.10,
};

/**
 * Calculates a weighted recommendation score (0 - 100)
 * Higher score means better fit for a hackathon team context.
 */
export function calculateWeightedScore(idea) {
  const feasibility = Number(idea.feasibility_score || idea.feasibilityScore || 5);
  const innovation = Number(idea.innovation_score || idea.innovationScore || 5);
  const impact = Number(idea.impact_score || idea.impactScore || 5);
  const demo = Number(idea.demo_score || idea.demoScore || 5);
  const cost = Number(idea.cost_score || idea.costScore || 5);
  const scalability = Number(idea.scalability_score || idea.scalabilityScore || 5);

  const weightedSum =
    (feasibility * SCORING_WEIGHTS.feasibility) +
    (innovation * SCORING_WEIGHTS.innovation) +
    (impact * SCORING_WEIGHTS.impact) +
    (demo * SCORING_WEIGHTS.demo) +
    (cost * SCORING_WEIGHTS.cost) +
    (scalability * SCORING_WEIGHTS.scalability);

  // Return out of 100 scaled, with 1 decimal precision
  return Math.round(weightedSum * 10 * 10) / 10;
}

/**
 * Ranks a list of ideas deterministically and marks the top recommendation
 */
export function rankAndRecommendIdeas(ideas, projectContext = {}) {
  if (!Array.isArray(ideas) || ideas.length === 0) return [];

  const scoredIdeas = ideas.map((idea) => {
    const totalScore = calculateWeightedScore(idea);
    return {
      ...idea,
      totalWeightedScore: totalScore,
    };
  });

  // Sort descending by score
  scoredIdeas.sort((a, b) => b.totalWeightedScore - a.totalWeightedScore);

  // Top idea is recommended
  return scoredIdeas.map((idea, index) => {
    const isRecommended = index === 0;
    let recommendationReason = idea.recommendation_reason || '';
    if (isRecommended && !recommendationReason) {
      recommendationReason = `Highest overall balance of high execution feasibility (${idea.feasibility_score || idea.feasibilityScore}/10), presentation demo potential (${idea.demo_score || idea.demoScore}/10), and real-world impact (${idea.impact_score || idea.impactScore}/10) suited for the team's timeline.`;
    }

    return {
      ...idea,
      is_recommended: isRecommended,
      recommendation_reason: recommendationReason,
    };
  });
}
