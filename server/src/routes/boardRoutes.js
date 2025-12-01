import express from 'express';
const router = express.Router();
import { getPublicBoards, getBoardById, createBoard, updateBoard, saveBoardState, deleteBoard, getUserBoards, addCollaborator, removeCollaborator } from '../controllers/boardController';
import { protect, optionalAuth } from '../middleware/authMiddleware';
import { boardCreationLimiter, boardSaveLimiter } from '../middleware/rateLimiter';


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