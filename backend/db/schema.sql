-- ========================================================
-- HACKX SUPABASE POSTGRESQL SCHEMA
-- Execute this script in the Supabase SQL Editor
-- ========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    problem_statement TEXT NOT NULL,
    team_size VARCHAR(50) DEFAULT '1',
    team_skills TEXT DEFAULT '',
    development_time VARCHAR(50) DEFAULT '24 hours',
    budget VARCHAR(100) DEFAULT '0',
    hardware TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ANALYSES TABLE
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    domain VARCHAR(100) NOT NULL,
    simple_explanation TEXT,
    target_users JSONB DEFAULT '[]'::jsonb,
    functional_requirements JSONB DEFAULT '[]'::jsonb,
    technical_requirements JSONB DEFAULT '[]'::jsonb,
    constraints JSONB DEFAULT '[]'::jsonb,
    challenges JSONB DEFAULT '[]'::jsonb,
    difficulty VARCHAR(50) DEFAULT 'Medium',
    difficulty_reason TEXT,
    keywords JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. IDEAS TABLE
CREATE TABLE IF NOT EXISTS public.ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    concept TEXT NOT NULL,
    description TEXT NOT NULL,
    how_it_solves TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    technical_approach TEXT,
    required_tech JSONB DEFAULT '[]'::jsonb,
    innovation_score INT CHECK (innovation_score BETWEEN 1 AND 10),
    feasibility_score INT CHECK (feasibility_score BETWEEN 1 AND 10),
    complexity_score INT CHECK (complexity_score BETWEEN 1 AND 10),
    cost_score INT CHECK (cost_score BETWEEN 1 AND 10),
    impact_score INT CHECK (impact_score BETWEEN 1 AND 10),
    demo_score INT CHECK (demo_score BETWEEN 1 AND 10),
    scalability_score INT CHECK (scalability_score BETWEEN 1 AND 10),
    is_recommended BOOLEAN DEFAULT FALSE,
    recommendation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SELECTED_SOLUTIONS TABLE
CREATE TABLE IF NOT EXISTS public.selected_solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES public.ideas(id) ON DELETE SET NULL,
    differentiators JSONB DEFAULT '[]'::jsonb,
    judge_pitch_reasons JSONB DEFAULT '[]'::jsonb,
    tech_stack JSONB DEFAULT '{}'::jsonb,
    architecture JSONB DEFAULT '{}'::jsonb,
    roadmap JSONB DEFAULT '[]'::jsonb,
    pitch JSONB DEFAULT '{}'::jsonb,
    team_roles JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_project_solution UNIQUE (project_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_project_id ON public.analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_ideas_project_id ON public.ideas(project_id);
CREATE INDEX IF NOT EXISTS idx_selected_solutions_project_id ON public.selected_solutions(project_id);

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_selected_solutions_updated_at
    BEFORE UPDATE ON public.selected_solutions
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selected_solutions ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR PROJECTS
CREATE POLICY "Users can view their own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- RLS POLICIES FOR ANALYSES (linked via projects)
CREATE POLICY "Users can view analyses of their projects"
    ON public.analyses FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = analyses.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can insert analyses for their projects"
    ON public.analyses FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = analyses.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can delete analyses of their projects"
    ON public.analyses FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = analyses.project_id AND projects.user_id = auth.uid()));

-- RLS POLICIES FOR IDEAS (linked via projects)
CREATE POLICY "Users can view ideas of their projects"
    ON public.ideas FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = ideas.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can insert ideas for their projects"
    ON public.ideas FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = ideas.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can update ideas of their projects"
    ON public.ideas FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = ideas.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can delete ideas of their projects"
    ON public.ideas FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = ideas.project_id AND projects.user_id = auth.uid()));

-- RLS POLICIES FOR SELECTED SOLUTIONS (linked via projects)
CREATE POLICY "Users can view solutions of their projects"
    ON public.selected_solutions FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = selected_solutions.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can insert solutions for their projects"
    ON public.selected_solutions FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = selected_solutions.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can update solutions of their projects"
    ON public.selected_solutions FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = selected_solutions.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can delete solutions of their projects"
    ON public.selected_solutions FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = selected_solutions.project_id AND projects.user_id = auth.uid()));
