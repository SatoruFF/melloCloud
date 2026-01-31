import { Hono } from 'hono';
import { TaskController } from '../../controllers/taskController';

const router = new Hono();

// Basic CRUD
router.post('/', TaskController.create);
router.get('/', TaskController.getAll);
router.get('/kanban', TaskController.getKanban);
router.get('/stats', TaskController.getStats);
router.get('/overdue', TaskController.getOverdue);
router.get('/upcoming', TaskController.getUpcoming);
router.get('/search', TaskController.search);
router.get('/priority/:priority', TaskController.getByPriority);
router.get('/status/:status', TaskController.getByStatus);
router.get('/column/:columnId', TaskController.getByColumn);
router.get('/:id', TaskController.getById);
router.put('/:id', TaskController.update);
router.delete('/:id', TaskController.delete);

// Additional operations
router.patch('/:id/toggle', TaskController.toggleComplete);
router.patch('/:id/move', TaskController.moveToColumn);
router.patch('/batch-update', TaskController.batchUpdate);

export default router;
