import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@shared/api/queryKeys';
import { tasksService } from '../services/tasksService';
import type { GetTasksParams, TaskFormData } from '../types';

// ============================================================
// QUERIES
// ============================================================

export function useTasks(params?: GetTasksParams) {
  return useQuery({
    queryKey: [...queryKeys.tasks.all, params],
    queryFn: () => tasksService.getTasks(params),
  });
}

export function useTasksGrouped() {
  return useQuery({
    queryKey: queryKeys.tasks.grouped,
    queryFn: () => tasksService.getTasksGrouped(),
  });
}

export function useTaskById(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.byId(id),
    queryFn: () => tasksService.getTaskById(id),
    enabled: !!id,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskFormData) => tasksService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.grouped });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskFormData> & { status?: string } }) =>
      tasksService.updateTask(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.grouped });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byId(variables.id) });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.grouped });
    },
  });
}
