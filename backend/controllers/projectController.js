import { supabaseAdmin } from '../utils/supabaseClient.js';
import { memoryStore } from '../utils/memoryStore.js';

const isSupabaseConfigured = () => {
  return Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  );
};

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

    if (isSupabaseConfigured() && req.supabase) {
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

    // Memory Store fallback
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
    const userId = req.user?.id || 'dev-user';

    if (isSupabaseConfigured() && req.supabase) {
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

    const projects = memoryStore.getProjects(userId);
    return res.json({ projects });
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured() && req.supabase) {
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

    const project = memoryStore.getProject(id);
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

    if (isSupabaseConfigured() && req.supabase) {
      const { error } = await req.supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.json({ success: true, message: 'Project deleted successfully' });
    }

    memoryStore.deleteProject(id);
    return res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};
