import { taskColumnReducer, addColumn, updateColumn, deleteColumn, setShowAddColumn, setEditingColumn, setLoading, setError, setColumns } from './model/slice/taskColumn';
import { useCreateColumnMutation, useUpdateColumnMutation, useDeleteColumnMutation } from './model/api/taskColumnApi';

export {
  taskColumnReducer,
  addColumn,
  updateColumn,
  deleteColumn,
  setShowAddColumn,
  setEditingColumn,
  setLoading,
  setError,
  setColumns,
  useCreateColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
};
