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
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/projects/:id/analyze', optionalAuth, analyzeProblem);
router.post('/projects/:id/generate-ideas', optionalAuth, generateIdeas);
router.get('/projects/:id/compare', optionalAuth, compareIdeas);
router.post('/projects/:id/select-idea', optionalAuth, selectIdea);
router.post('/projects/:id/differentiators', optionalAuth, generateDifferentiators);
router.post('/projects/:id/tech-stack', optionalAuth, generateTechStack);
router.post('/projects/:id/architecture', optionalAuth, generateArchitecture);
router.post('/projects/:id/roadmap', optionalAuth, generateRoadmap);
router.post('/projects/:id/pitch', optionalAuth, generatePitch);
router.post('/projects/:id/team-roles', optionalAuth, recommendTeamRoles);

export default router;
