import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
} from '../controllers/projectController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Allow optional auth so user can use the platform immediately or attach session
router.post('/', optionalAuth, createProject);
router.get('/', optionalAuth, getProjects);
router.get('/:id', optionalAuth, getProjectById);
router.delete('/:id', optionalAuth, deleteProject);

export default router;
