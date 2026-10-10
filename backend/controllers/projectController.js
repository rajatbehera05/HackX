import { isSupabaseConfigured } from '../utils/supabaseClient.js';
import { memoryStore } from '../utils/memoryStore.js';

export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      problemStatement,
      teamSize = '1',
      teamSkills = '',
      developmentTime = '24 hours',
      budget = '',
      hardware = '',
    } = req.body;

    if (!problemStatement || problemStatement.trim().length === 0) {
      return res.status(400).json({ error: 'Problem statement is required.' });
    }

    const userId = req.user?.id || 'dev-user';
    const projectTitle = title?.trim() ||
      (problemStatement.length > 50 ? problemStatement.substring(0, 47) + '...' : problemStatement);

    if (isSupabaseConfigured()) {
      if (!req.supabase) {
        return res.status(401).json({ error: 'Authentication required for Supabase operations.' });
      }

      const { data, error } = await req.supabase
        .from('projects')
        .insert({
          user_id: userId,
          title: projectTitle,
          problem_statement: problemStatement,
          team_size: teamSize,
          team_skills: teamSkills,
          development_time: developmentTime,
          budget,
          hardware,
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ project: data });
    }

    // Dev In-Memory Mode
    const project = memoryStore.createProject({
      userId,
      title: projectTitle,
      problemStatement,
      teamSize,
      teamSkills,
      developmentTime,
      budget,
      hardware,
    });

    return res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (isSupabaseConfigured()) {
      if (!req.supabase) {
        return res.status(401).json({ error: 'Authentication required for Supabase operations.' });
      }

      const { data, error } = await req.supabase
        .from('projects')
        .select(`
          *,
          analyses ( id, domain, difficulty ),
          selected_solutions ( id, idea_id )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return res.json({ projects: data });
    }

    // Dev In-Memory Mode
    const projects = memoryStore.getProjects(userId);
    return res.json({ projects });
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (isSupabaseConfigured()) {
      if (!req.supabase) {
        return res.status(401).json({ error: 'Authentication required for Supabase operations.' });
      }

      const { data: project, error: pError } = await req.supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (pError || !project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const { data: analyses } = await req.supabase
        .from('analyses')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(1);

      const { data: ideas } = await req.supabase
        .from('ideas')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });

      const { data: solution } = await req.supabase
        .from('selected_solutions')
        .select('*')
        .eq('project_id', id)
        .maybeSingle();

      return res.json({
        project: {
          ...project,
          analysis: analyses?.[0] || null,
          ideas: ideas || [],
          selectedSolution: solution || null,
        },
      });
    }

    // Dev In-Memory Mode
    const project = memoryStore.getProject(id, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json({ project });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (isSupabaseConfigured()) {
      if (!req.supabase) {
        return res.status(401).json({ error: 'Authentication required for Supabase operations.' });
      }

      const { error } = await req.supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.json({ success: true, message: 'Project deleted successfully' });
    }

    // Dev In-Memory Mode
    const deleted = memoryStore.deleteProject(id, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }
    return res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const {
      title,
      problemStatement,
      teamSize,
      teamSkills,
      developmentTime,
      budget,
      hardware,
    } = req.body;

    if (isSupabaseConfigured()) {
      if (!req.supabase) {
        return res.status(401).json({ error: 'Authentication required for Supabase operations.' });
      }

      const updates = {};
      if (title !== undefined) updates.title = title.trim();
      if (problemStatement !== undefined) updates.problem_statement = problemStatement.trim();
      if (teamSize !== undefined) updates.team_size = teamSize;
      if (teamSkills !== undefined) updates.team_skills = teamSkills;
      if (developmentTime !== undefined) updates.development_time = developmentTime;
      if (budget !== undefined) updates.budget = budget;
      if (hardware !== undefined) updates.hardware = hardware;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await req.supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ project: data });
    }

    // Dev In-Memory Mode
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (problemStatement !== undefined) updates.problem_statement = problemStatement.trim();
    if (teamSize !== undefined) updates.team_size = teamSize;
    if (teamSkills !== undefined) updates.team_skills = teamSkills;
    if (developmentTime !== undefined) updates.development_time = developmentTime;
    if (budget !== undefined) updates.budget = budget;
    if (hardware !== undefined) updates.hardware = hardware;

    const project = memoryStore.updateProject(id, userId, updates);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    return res.json({ project });
  } catch (err) {
    next(err);
  }
};
