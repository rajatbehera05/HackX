import { z } from 'zod';
import { geminiProvider } from './geminiProvider.js';
import { prompts } from './prompts.js';
import { rankAndRecommendIdeas } from './scoringService.js';

// --- Zod Validation Schemas ---

const AnalysisSchema = z.object({
  summary: z.string().default(''),
  domain: z.string().default('General'),
  simpleExplanation: z.string().default(''),
  targetUsers: z.array(z.string()).default([]),
  functionalRequirements: z.array(z.string()).default([]),
  technicalRequirements: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  challenges: z.array(z.string()).default([]),
  difficulty: z.string().default('Medium'),
  difficultyReason: z.string().default(''),
  keywords: z.array(z.string()).default([]),
});

const IdeaItemSchema = z.object({
  title: z.string(),
  concept: z.string(),
  description: z.string(),
  howItSolves: z.string().optional().default(''),
  features: z.array(z.string()).default([]),
  technicalApproach: z.string().optional().default(''),
  requiredTech: z.array(z.string()).default([]),
  innovationScore: z.coerce.number().min(1).max(10).default(7),
  feasibilityScore: z.coerce.number().min(1).max(10).default(7),
  complexityScore: z.coerce.number().min(1).max(10).default(5),
  costScore: z.coerce.number().min(1).max(10).default(8),
  impactScore: z.coerce.number().min(1).max(10).default(8),
  demoScore: z.coerce.number().min(1).max(10).default(8),
  scalabilityScore: z.coerce.number().min(1).max(10).default(7),
});

const IdeasSchema = z.object({
  ideas: z.array(IdeaItemSchema).min(1),
});

const DifferentiatorsSchema = z.object({
  differentiators: z.array(
    z.object({
      category: z.string().default('Unique Feature'),
      title: z.string(),
      description: z.string(),
      implementationHint: z.string().optional().default(''),
    })
  ).default([]),
  judgePitchReasons: z.array(
    z.object({
      pillar: z.string().default('Problem Relevance'),
      headline: z.string(),
      argument: z.string(),
    })
  ).default([]),
});

const TechStackSchema = z.object({
  categories: z.array(
    z.object({
      category: z.string(),
      technology: z.string(),
      purpose: z.string(),
      whyRecommended: z.string(),
    })
  ).default([]),
  stackSummary: z.string().default(''),
});

const ArchitectureSchema = z.object({
  overview: z.string().default(''),
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      type: z.string().default('service'),
      description: z.string().optional().default(''),
      tech: z.string().optional().default(''),
      position: z.object({
        x: z.number().default(100),
        y: z.number().default(100),
      }).default({ x: 100, y: 100 }),
    })
  ).default([]),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      label: z.string().optional().default(''),
    })
  ).default([]),
});

const RoadmapSchema = z.object({
  timeframe: z.string().default('24 hours'),
  mvpRule: z.string().default(''),
  phases: z.array(
    z.object({
      phaseNumber: z.number(),
      name: z.string(),
      duration: z.string(),
      objectives: z.array(z.string()).default([]),
      deliverables: z.array(z.string()).default([]),
      pitfallsToAvoid: z.string().optional().default(''),
    })
  ).default([]),
});

const PitchSchema = z.object({
  pitch30s: z.object({
    duration: z.string().default('30 Seconds'),
    hook: z.string().default(''),
    problem: z.string().default(''),
    solution: z.string().default(''),
    callToAction: z.string().default(''),
  }).default({}),
  pitch1m: z.object({
    duration: z.string().default('60 Seconds'),
    script: z.string().default(''),
    keyTakeaways: z.array(z.string()).default([]),
  }).default({}),
  pitch3m: z.object({
    duration: z.string().default('3 Minutes'),
    sections: z.array(
      z.object({
        part: z.string(),
        content: z.string(),
      })
    ).default([]),
  }).default({}),
  slideDeck: z.array(
    z.object({
      slideNumber: z.number(),
      title: z.string(),
      talkingPoints: z.array(z.string()).default([]),
      visualSuggestion: z.string().optional().default(''),
    })
  ).default([]),
});

const TeamRolesSchema = z.object({
  roles: z.array(
    z.object({
      member: z.string(),
      primaryRole: z.string(),
      responsibilities: z.array(z.string()).default([]),
      skillsUsed: z.string().default(''),
    })
  ).default([]),
  identifiedSkillGaps: z.array(z.string()).default([]),
  mitigationAdvice: z.string().default(''),
});

class AIService {
  constructor(provider = geminiProvider) {
    this.provider = provider;
  }

  async analyzeProblem(project) {
    const promptConfig = prompts.problemAnalysis(project);
    const raw = await this.provider.generateJson(promptConfig);
    return AnalysisSchema.parse(raw);
  }

  async generateIdeas(project, analysis) {
    const promptConfig = prompts.ideaGeneration(project, analysis);
    const raw = await this.provider.generateJson(promptConfig);
    const validated = IdeasSchema.parse(raw);
    // Apply deterministic scoring engine & ranking
    const rankedIdeas = rankAndRecommendIdeas(validated.ideas, project);
    return rankedIdeas;
  }

  async generateDifferentiators(project, idea) {
    const promptConfig = prompts.differentiators(project, idea);
    const raw = await this.provider.generateJson(promptConfig);
    return DifferentiatorsSchema.parse(raw);
  }

  async recommendTechStack(project, idea) {
    const promptConfig = prompts.techStack(project, idea);
    const raw = await this.provider.generateJson(promptConfig);
    return TechStackSchema.parse(raw);
  }

  async generateArchitecture(project, idea, techStack) {
    const promptConfig = prompts.architecture(project, idea, techStack);
    const raw = await this.provider.generateJson(promptConfig);
    return ArchitectureSchema.parse(raw);
  }

  async generateRoadmap(project, idea) {
    const promptConfig = prompts.roadmap(project, idea);
    const raw = await this.provider.generateJson(promptConfig);
    return RoadmapSchema.parse(raw);
  }

  async generatePitch(project, idea, differentiators) {
    const promptConfig = prompts.pitch(project, idea, differentiators);
    const raw = await this.provider.generateJson(promptConfig);
    return PitchSchema.parse(raw);
  }

  async recommendTeamRoles(project, idea) {
    const promptConfig = prompts.teamRoles(project, idea);
    const raw = await this.provider.generateJson(promptConfig);
    return TeamRolesSchema.parse(raw);
  }
}

export const aiService = new AIService();
