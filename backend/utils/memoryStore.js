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
    if (!userId || userId === 'dev-user') return list;
    return list.filter((p) => p.user_id === userId);
  }

  getProject(id) {
    const project = this.projects.get(id);
    if (!project) return null;
    return {
      ...project,
      analysis: this.analyses.get(id) || null,
      ideas: this.ideas.get(id) || [],
      selectedSolution: this.selectedSolutions.get(id) || null,
    };
  }

  deleteProject(id) {
    this.projects.delete(id);
    this.analyses.delete(id);
    this.ideas.delete(id);
    this.selectedSolutions.delete(id);
    return true;
  }

  saveAnalysis(projectId, analysis) {
    const record = {
      id: randomUUID(),
      project_id: projectId,
      ...analysis,
      created_at: new Date().toISOString(),
    };
    this.analyses.set(projectId, record);
    return record;
  }

  saveIdeas(projectId, ideasList) {
    const records = ideasList.map((idea) => ({
      id: idea.id || randomUUID(),
      project_id: projectId,
      ...idea,
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
