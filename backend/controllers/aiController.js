import { aiService } from '../services/ai/aiService.js';
import { memoryStore } from '../utils/memoryStore.js';
import { SCORING_WEIGHTS, calculateWeightedScore } from '../services/ai/scoringService.js';

const isSupabaseConfigured = () => {
  return Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  );
};

// Helper to fetch full project context
async function getFullProjectContext(req, projectId) {
  if (isSupabaseConfigured() && req.supabase) {
    const { data: project } = await req.supabase.from('projects').select('*').eq('id', projectId).single();
    if (!project) return null;

    const { data: analyses } = await req.supabase.from('analyses').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(1);
    const { data: ideas } = await req.supabase.from('ideas').select('*').eq('project_id', projectId);
    const { data: solution } = await req.supabase.from('selected_solutions').select('*').eq('project_id', projectId).maybeSingle();

    return {
      ...project,
      analysis: analyses?.[0] || null,
      ideas: ideas || [],
      selectedSolution: solution || null,
    };
  }

  return memoryStore.getProject(projectId);
}

// 1. Analyze Problem Statement
export const analyzeProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await getFullProjectContext(req, id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const analysis = await aiService.analyzeProblem(project);

    if (isSupabaseConfigured() && req.supabase) {
      const { data, error } = await req.supabase
        .from('analyses')
        .insert({
          project_id: id,
          summary: analysis.summary,
          domain: analysis.domain,
          simple_explanation: analysis.simpleExplanation,
          target_users: analysis.targetUsers,
          functional_requirements: analysis.functionalRequirements,
          technical_requirements: analysis.technicalRequirements,
          constraints: analysis.constraints,
          challenges: analysis.challenges,
          difficulty: analysis.difficulty,
          difficulty_reason: analysis.difficultyReason,
          keywords: analysis.keywords,
        })
        .select()
        .single();

      if (error) throw error;
      return res.json({ analysis: data });
    }

    const saved = memoryStore.saveAnalysis(id, analysis);
    return res.json({ analysis: saved });
  } catch (err) {
    next(err);
  }
};

// 2. Generate Solution Ideas
export const generateIdeas = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await getFullProjectContext(req, id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const ideas = await aiService.generateIdeas(project, project.analysis);

    if (isSupabaseConfigured() && req.supabase) {
      // Clear previous ideas if regenerating
      await req.supabase.from('ideas').delete().eq('project_id', id);

      const dbIdeas = ideas.map((idea) => ({
        project_id: id,
        title: idea.title,
        concept: idea.concept,
        description: idea.description,
        how_it_solves: idea.howItSolves,
        features: idea.features,
        technical_approach: idea.technicalApproach,
        required_tech: idea.requiredTech,
        innovation_score: idea.innovationScore,
        feasibility_score: idea.feasibilityScore,
        complexity_score: idea.complexityScore,
        cost_score: idea.costScore,
        impact_score: idea.impactScore,
        demo_score: idea.demoScore,
        scalability_score: idea.scalabilityScore,
        is_recommended: idea.is_recommended,
        recommendation_reason: idea.recommendation_reason,
      }));

      const { data, error } = await req.supabase
        .from('ideas')
        .insert(dbIdeas)
        .select();

      if (error) throw error;
      return res.json({ ideas: data });
    }

    const saved = memoryStore.saveIdeas(id, ideas);
    return res.json({ ideas: saved });
  } catch (err) {
    next(err);
  }
};

// 3. Compare Ideas
export const compareIdeas = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await getFullProjectContext(req, id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const ideas = project.ideas || [];
    const comparison = ideas.map((idea) => {
      const score = calculateWeightedScore(idea);
      return {
        id: idea.id,
        title: idea.title,
        concept: idea.concept,
        innovation: idea.innovation_score || idea.innovationScore || 5,
        feasibility: idea.feasibility_score || idea.feasibilityScore || 5,
        impact: idea.impact_score || idea.impactScore || 5,
        demo: idea.demo_score || idea.demoScore || 5,
        cost: idea.cost_score || idea.costScore || 5,
        scalability: idea.scalability_score || idea.scalabilityScore || 5,
        weightedTotal: score,
        isRecommended: idea.is_recommended || false,
        recommendationReason: idea.recommendation_reason || '',
      };
    });

    return res.json({
      weights: SCORING_WEIGHTS,
      comparison,
      topPick: comparison.find((c) => c.isRecommended) || comparison[0] || null,
    });
  } catch (err) {
    next(err);
  }
};

// 4. Select Idea
export const selectIdea = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ideaId } = req.body;
    if (!ideaId) return res.status(400).json({ error: 'ideaId is required' });

    if (isSupabaseConfigured() && req.supabase) {
      const { data, error } = await req.supabase
        .from('selected_solutions')
        .upsert(
          { project_id: id, idea_id: ideaId, updated_at: new Date().toISOString() },
          { onConflict: 'project_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return res.json({ selectedSolution: data });
    }

    const saved = memoryStore.saveSolutionPart(id, { idea_id: ideaId });
    return res.json({ selectedSolution: saved });
  } catch (err) {
    next(err);
  }
};

// 5. Generate Differentiators
export const generateDifferentiators = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await getFullProjectContext(req, id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const selectedIdeaId = req.body?.ideaId || project.selectedSolution?.idea_id || project.ideas?.[0]?.id;
    const idea = (project.ideas || []).find((i) => i.id === selectedIdeaId) || project.ideas?.[0];
    if (!idea) return res.status(400).json({ error: 'Please generate and select an idea first' });

    const diffData = await aiService.generateDifferentiators(project, idea);

    if (isSupabaseConfigured() && req.supabase) {
      const { data, error } = await req.supabase
        .from('selected_solutions')
        .upsert(
          {
            project_id: id,
            idea_id: idea.id,
            differentiators: diffData.differentiators,
            judge_pitch_reasons: diffData.judgePitchReasons,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'project_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return res.json({ differentiators: diffData, selectedSolution: data });
    }

    const updated = memoryStore.saveSolutionPart(id, {
      idea_id: idea.id,
      differentiators: diffData.differentiators,
      judge_pitch_reasons: diffData.judgePitchReasons,
    });
    return res.json({ differentiators: diffData, selectedSolution: updated });
  } catch (err) {
    next(err);
  }
};

// 6. Generate Tech Stack
export const generateTechStack = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await getFullProjectContext(req, id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const selectedIdeaId = project.selectedSolution?.idea_id || project.ideas?.[0]?.id;
    const idea = (project.ideas || []).find((i) => i.id === selectedIdeaId) || project.ideas?.[0];
    if (!idea) return res.status(400).json({ error: 'Please generate and select an idea first' });

    const stackData = await aiService.recommendTechStack(project, idea);

    if (isSupabaseConfigured() && req.supabase) {
      const { data, error } = await req.supabase
        .from('selected_solutions')
        .upsert(
          {
            project_id: id,
            idea_id: idea.id,
            tech_stack: stackData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'project_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return res.json({ techStack: stackData, selectedSolution: data });
    }

    const updated = memoryStore.saveSolutionPart(id, {
      idea_id: idea.id,
      tech_stack: stackData,
    });
    return res.json({ techStack: stackData, selectedSolution: updated });
  } catch (err) {
    next(err);
  }
};

// 7. Generate Architecture
export const generateArchitecture = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await getFullProjectContext(req, id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const selectedIdeaId = project.selectedSolution?.idea_id || project.ideas?.[0]?.id;
    const idea = (project.ideas || []).find((i) => i.id === selectedIdeaId) || project.ideas?.[0];
    if (!idea) return res.status(400).json({ error: 'Please generate and select an idea first' });

    const techStack = project.selectedSolution?.tech_stack || project.selectedSolution?.techStack || {};
    const archData = await aiService.generateArchitecture(project, idea, techStack);

    if (isSupabaseConfigured() && req.supabase) {
      const { data, error } = await req.supabase
        .from('selected_solutions')
        .upsert(
          {
            project_id: id,
            idea_id: idea.id,
            architecture: archData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'project_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return res.json({ architecture: archData, selectedSolution: data });
    }

    const updated = memoryStore.saveSolutionPart(id, {
      idea_id: idea.id,
      architecture: archData,
    });
    return res.json({ architecture: archData, selectedSolution: updated });
  } catch (err) {
    next(err);
  }
};

// 8. Generate Roadmap
export const generateRoadmap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await getFullProjectContext(req, id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const selectedIdeaId = project.selectedSolution?.idea_id || project.ideas?.[0]?.id;
    const idea = (project.ideas || []).find((i) => i.id === selectedIdeaId) || project.ideas?.[0];
    if (!idea) return res.status(400).json({ error: 'Please generate and select an idea first' });

    const roadmapData = await aiService.generateRoadmap(project, idea);

    if (isSupabaseConfigured() && req.supabase) {
      const { data, error } = await req.supabase
        .from('selected_solutions')
        .upsert(
          {
            project_id: id,
            idea_id: idea.id,
            roadmap: roadmapData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'project_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return res.json({ roadmap: roadmapData, selectedSolution: data });
    }

    const updated = memoryStore.saveSolutionPart(id, {
      idea_id: idea.id,
      roadmap: roadmapData,
    });
    return res.json({ roadmap: roadmapData, selectedSolution: updated });
  } catch (err) {
    next(err);
  }
};

// 9. Generate Pitch
export const generatePitch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await getFullProjectContext(req, id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const selectedIdeaId = project.selectedSolution?.idea_id || project.ideas?.[0]?.id;
    const idea = (project.ideas || []).find((i) => i.id === selectedIdeaId) || project.ideas?.[0];
    if (!idea) return res.status(400).json({ error: 'Please generate and select an idea first' });

    const differentiators = project.selectedSolution?.differentiators || [];
    const pitchData = await aiService.generatePitch(project, idea, differentiators);

    if (isSupabaseConfigured() && req.supabase) {
      const { data, error } = await req.supabase
        .from('selected_solutions')
        .upsert(
          {
            project_id: id,
            idea_id: idea.id,
            pitch: pitchData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'project_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return res.json({ pitch: pitchData, selectedSolution: data });
    }

    const updated = memoryStore.saveSolutionPart(id, {
      idea_id: idea.id,
      pitch: pitchData,
    });
    return res.json({ pitch: pitchData, selectedSolution: updated });
  } catch (err) {
    next(err);
  }
};

// 10. Recommend Team Roles
export const recommendTeamRoles = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await getFullProjectContext(req, id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const selectedIdeaId = project.selectedSolution?.idea_id || project.ideas?.[0]?.id;
    const idea = (project.ideas || []).find((i) => i.id === selectedIdeaId) || project.ideas?.[0];
    if (!idea) return res.status(400).json({ error: 'Please generate and select an idea first' });

    const rolesData = await aiService.recommendTeamRoles(project, idea);

    if (isSupabaseConfigured() && req.supabase) {
      const { data, error } = await req.supabase
        .from('selected_solutions')
        .upsert(
          {
            project_id: id,
            idea_id: idea.id,
            team_roles: rolesData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'project_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return res.json({ teamRoles: rolesData, selectedSolution: data });
    }

    const updated = memoryStore.saveSolutionPart(id, {
      idea_id: idea.id,
      team_roles: rolesData,
    });
    return res.json({ teamRoles: rolesData, selectedSolution: updated });
  } catch (err) {
    next(err);
  }
};
