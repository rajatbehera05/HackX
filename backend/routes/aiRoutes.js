import { Router } from 'express';
import {
  analyzeProblem,
  generateIdeas,
  compareIdeas,
  selectIdea,
  generateDifferentiators,
  generateTechStack,
  generateArchitecture,
  generateRoadmap,
  generatePitch,
  recommendTeamRoles,
} from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Protected AI workflow endpoints requiring valid project ownership
router.post('/projects/:id/analyze', requireAuth, analyzeProblem);
router.post('/projects/:id/generate-ideas', requireAuth, generateIdeas);
router.get('/projects/:id/compare', requireAuth, compareIdeas);
router.post('/projects/:id/select-idea', requireAuth, selectIdea);
router.post('/projects/:id/differentiators', requireAuth, generateDifferentiators);
router.post('/projects/:id/tech-stack', requireAuth, generateTechStack);
router.post('/projects/:id/architecture', requireAuth, generateArchitecture);
router.post('/projects/:id/roadmap', requireAuth, generateRoadmap);
router.post('/projects/:id/pitch', requireAuth, generatePitch);
router.post('/projects/:id/team-roles', requireAuth, recommendTeamRoles);

export default router;
