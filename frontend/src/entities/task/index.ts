import { taskReducer, addTask, updateTask, deleteTask, moveTask, setDraggedTask, setDragOverColumn, clearDragState, setLoading, setError, setTasks } from './model/slice/taskSlice';
import { useGetKanbanDataQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation, useMoveTaskMutation } from './model/api/taskApi';

export {
  taskReducer,
  addTask,
  updateTask,
  deleteTask,
  moveTask,
  setDraggedTask,
  setDragOverColumn,
  clearDragState,
  setLoading,
  setError,
  setTasks,
  useGetKanbanDataQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
};
