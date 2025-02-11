import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { FileController } from '../controllers/fileController.js';

const router: Router = Router();

router.post('', authMiddleware, FileController.createDir);
router.get('', authMiddleware, FileController.getFiles);
router.post('/upload', authMiddleware, FileController.uploadFile);
router.post('/download', authMiddleware, FileController.downloadFile);
router.delete('/delete', authMiddleware, FileController.deleteFile);
router.post('/avatar', authMiddleware, FileController.uploadAvatar);
router.delete('/avatar', authMiddleware, FileController.deleteAvatar);

export default router;
