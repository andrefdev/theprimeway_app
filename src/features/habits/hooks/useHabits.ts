import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@shared/api/queryKeys';
import { habitsService } from '../services/habitsService';
import type {
  CreateHabitPayload,
  UpdateHabitPayload,
  HabitLogPayload,
} from '../types';

export function useHabits() {
  return useQuery({
    queryKey: queryKeys.habits.all,
    queryFn: () => habitsService.getHabits(),
  });
}

export function useHabitStats(
  period?: 'week' | 'month' | 'quarter' | 'year',
) {
  return useQuery({
    queryKey: queryKeys.habits.stats,
    queryFn: () => habitsService.getStats(period),
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHabitPayload) => habitsService.createHabit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.stats });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHabitPayload }) =>
      habitsService.updateHabit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.stats });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => habitsService.deleteHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.stats });
    },
  });
}

export function useLogHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HabitLogPayload }) =>
      habitsService.logHabit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.stats });
    },
  });
}
