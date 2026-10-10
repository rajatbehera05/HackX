import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Protected project endpoints requiring authenticated user session
router.post('/', requireAuth, createProject);
router.get('/', requireAuth, getProjects);
router.get('/:id', requireAuth, getProjectById);
router.put('/:id', requireAuth, updateProject);
router.patch('/:id', requireAuth, updateProject);
router.delete('/:id', requireAuth, deleteProject);

export default router;
