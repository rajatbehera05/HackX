import { randomUUID } from 'crypto';

/**
 * Local In-Memory Store
 * Acts as a seamless fallback if Supabase credentials are not yet configured in .env.
 * Automatically synchronizes with Supabase whenever Supabase is configured.
 */

class MemoryStore {
  constructor() {
    this.projects = new Map();
    this.analyses = new Map();
    this.ideas = new Map(); // key: project_id, value: array of ideas
    this.selectedSolutions = new Map(); // key: project_id, value: solution object
  }

  createProject({ userId = 'dev-user', title, problemStatement, teamSize, teamSkills, developmentTime, budget, hardware }) {
    const id = randomUUID();
    const project = {
      id,
      user_id: userId,
      title: title || (problemStatement.length > 50 ? problemStatement.substring(0, 47) + '...' : problemStatement),
      problem_statement: problemStatement,
      team_size: teamSize || '1',
      team_skills: teamSkills || '',
      development_time: developmentTime || '24 hours',
      budget: budget || '',
      hardware: hardware || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.projects.set(id, project);
    return project;
  }

  getProjects(userId) {
    const list = Array.from(this.projects.values());
    const filtered = userId ? list.filter((p) => p.user_id === userId) : list;
    return filtered.map((p) => {
      const analysis = this.analyses.get(p.id) || null;
      const solution = this.selectedSolutions.get(p.id) || null;
      return {
        ...p,
        analysis,
        analyses: analysis ? [analysis] : [],
        selectedSolution: solution,
        selected_solutions: solution ? [solution] : [],
      };
    });
  }

  getProject(id, userId = null) {
    const project = this.projects.get(id);
    if (!project) return null;
    if (userId && project.user_id !== userId) {
      const err = new Error('Forbidden: You do not have permission to access this project.');
      err.status = 403;
      throw err;
    }
    return {
      ...project,
      analysis: this.analyses.get(id) || null,
      analyses: this.analyses.has(id) ? [this.analyses.get(id)] : [],
      ideas: this.ideas.get(id) || [],
      selectedSolution: this.selectedSolutions.get(id) || null,
      selected_solutions: this.selectedSolutions.has(id) ? [this.selectedSolutions.get(id)] : [],
    };
  }

  deleteProject(id, userId = null) {
    const project = this.projects.get(id);
    if (!project) return false;
    if (userId && project.user_id !== userId) {
      const err = new Error('Forbidden: You do not have permission to delete this project.');
      err.status = 403;
      throw err;
    }
    this.projects.delete(id);
    this.analyses.delete(id);
    this.ideas.delete(id);
    this.selectedSolutions.delete(id);
    return true;
  }

  updateProject(id, userId = null, updates = {}) {
    const project = this.projects.get(id);
    if (!project) return null;
    if (userId && project.user_id !== userId) {
      const err = new Error('Forbidden: You do not have permission to update this project.');
      err.status = 403;
      throw err;
    }
    const updated = {
      ...project,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  saveAnalysis(projectId, analysis) {
    const record = {
      id: randomUUID(),
      project_id: projectId,
      summary: analysis.summary || '',
      domain: analysis.domain || 'General',
      simple_explanation: analysis.simple_explanation || analysis.simpleExplanation || '',
      simpleExplanation: analysis.simple_explanation || analysis.simpleExplanation || '',
      target_users: analysis.target_users || analysis.targetUsers || [],
      targetUsers: analysis.target_users || analysis.targetUsers || [],
      functional_requirements: analysis.functional_requirements || analysis.functionalRequirements || [],
      functionalRequirements: analysis.functional_requirements || analysis.functionalRequirements || [],
      technical_requirements: analysis.technical_requirements || analysis.technicalRequirements || [],
      technicalRequirements: analysis.technical_requirements || analysis.technicalRequirements || [],
      constraints: analysis.constraints || [],
      challenges: analysis.challenges || [],
      difficulty: analysis.difficulty || 'Medium',
      difficulty_reason: analysis.difficulty_reason || analysis.difficultyReason || '',
      difficultyReason: analysis.difficulty_reason || analysis.difficultyReason || '',
      keywords: analysis.keywords || [],
      created_at: new Date().toISOString(),
    };
    this.analyses.set(projectId, record);
    return record;
  }

  saveIdeas(projectId, ideasList) {
    const records = ideasList.map((idea) => ({
      id: idea.id || randomUUID(),
      project_id: projectId,
      title: idea.title,
      concept: idea.concept,
      description: idea.description,
      how_it_solves: idea.how_it_solves || idea.howItSolves || '',
      howItSolves: idea.how_it_solves || idea.howItSolves || '',
      features: idea.features || [],
      technical_approach: idea.technical_approach || idea.technicalApproach || '',
      technicalApproach: idea.technical_approach || idea.technicalApproach || '',
      required_tech: idea.required_tech || idea.requiredTech || [],
      requiredTech: idea.required_tech || idea.requiredTech || [],
      innovation_score: idea.innovation_score ?? idea.innovationScore ?? 7,
      innovationScore: idea.innovation_score ?? idea.innovationScore ?? 7,
      feasibility_score: idea.feasibility_score ?? idea.feasibilityScore ?? 7,
      feasibilityScore: idea.feasibility_score ?? idea.feasibilityScore ?? 7,
      complexity_score: idea.complexity_score ?? idea.complexityScore ?? 5,
      complexityScore: idea.complexity_score ?? idea.complexityScore ?? 5,
      cost_score: idea.cost_score ?? idea.costScore ?? 8,
      costScore: idea.cost_score ?? idea.costScore ?? 8,
      impact_score: idea.impact_score ?? idea.impactScore ?? 8,
      impactScore: idea.impact_score ?? idea.impactScore ?? 8,
      demo_score: idea.demo_score ?? idea.demoScore ?? 8,
      demoScore: idea.demo_score ?? idea.demoScore ?? 8,
      scalability_score: idea.scalability_score ?? idea.scalabilityScore ?? 7,
      scalabilityScore: idea.scalability_score ?? idea.scalabilityScore ?? 7,
      is_recommended: Boolean(idea.is_recommended),
      recommendation_reason: idea.recommendation_reason || '',
      created_at: new Date().toISOString(),
    }));
    this.ideas.set(projectId, records);
    return records;
  }

  saveSolutionPart(projectId, updateObj) {
    const existing = this.selectedSolutions.get(projectId) || {
      id: randomUUID(),
      project_id: projectId,
      created_at: new Date().toISOString(),
    };
    const updated = {
      ...existing,
      ...updateObj,
      updated_at: new Date().toISOString(),
    };
    this.selectedSolutions.set(projectId, updated);
    return updated;
  }
}

export const memoryStore = new MemoryStore();
