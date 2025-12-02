import express from 'express';
import {
  createBoard,
  getBoardById,
  updateBoard,
  saveBoardState,
  deleteBoard,
  getUserBoards,
  addCollaborator,
  removeCollaborator,
  getPublicBoards
} from '../controllers/boardController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { boardCreationLimiter, boardSaveLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/public', getPublicBoards);
router.get('/:boardId', optionalAuth, getBoardById);

router.post('/', boardCreationLimiter, optionalAuth, createBoard);
router.put('/:boardId', optionalAuth, updateBoard);
router.put('/:boardId/state', boardSaveLimiter, saveBoardState);
router.delete('/:boardId', protect, deleteBoard);

router.get('/user/me', protect, getUserBoards);

router.post('/:boardId/collaborators', protect, addCollaborator);
router.delete('/:boardId/collaborators/:userId', protect, removeCollaborator);

export default router;