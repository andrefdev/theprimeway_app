import { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import { TaskEditSheet } from '@/features/tasks/components/TaskEditSheet';
import { useTasksGrouped, useUpdateTask, useDeleteTask } from '@/features/tasks/hooks/useTasks';
import { cn } from '@/shared/utils/cn';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { addDays, format, startOfWeek, endOfWeek, isToday } from 'date-fns';
import type { Task } from '@shared/types/models';
import { useTranslation } from '@/shared/hooks/useTranslation';

// ============================================================
// TYPES
// ============================================================

interface DaySection {
  date: Date;
  dateStr: string;
  label: string;
  tasks: Task[];
}

// ============================================================
// SCREEN
// ============================================================

export default function WeeklyScreen() {
  const { t } = useTranslation('features.tasks');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { data: grouped, isLoading, refetch } = useTasksGrouped();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Build week days
  const weekDays = useMemo(() => {
    const now = new Date();
    const offsetDate = addDays(now, weekOffset * 7);
    const weekStart = startOfWeek(offsetDate, { weekStartsOn: 1 }); // Monday
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      return {
        date,
        dateStr: format(date, 'yyyy-MM-dd'),
        dayName: format(date, 'EEE'),
        dayNum: format(date, 'd'),
        isToday: isToday(date),
      };
    });
  }, [weekOffset]);

  const weekLabel = useMemo(() => {
    const ws = weekDays[0].date;
    const we = weekDays[6].date;
    return `${format(ws, 'MMM d')} - ${format(we, 'MMM d, yyyy')}`;
  }, [weekDays]);

  // All tasks flattened from grouped response
  const allTasks = useMemo(() => {
    if (!grouped) return [];
    return [
      ...(grouped.overdue ?? []),
      ...(grouped.today ?? []),
      ...(grouped.tomorrow ?? []),
      ...(grouped.upcoming ?? []),
      ...(grouped.unscheduled ?? []),
    ];
  }, [grouped]);

  // Build sections by day
  const daySections: DaySection[] = useMemo(() => {
    return weekDays.map((day) => {
      const dayTasks = allTasks.filter((t) => {
        const sched = t.scheduledDate?.split('T')[0] ?? '';
        const due = t.dueDate?.split('T')[0] ?? '';
        return sched === day.dateStr || due === day.dateStr;
      });
      return {
        date: day.date,
        dateStr: day.dateStr,
        label: day.isToday ? t('dateLabels.today') : format(day.date, 'EEEE, MMM d'),
        tasks: dayTasks,
      };
    });
  }, [weekDays, allTasks]);

  // Active section tasks
  const activeTasks = useMemo(() => {
    if (selectedDay) {
      const section = daySections.find((s) => s.dateStr === selectedDay);
      return section?.tasks ?? [];
    }
    // Show all week tasks
    return daySections.flatMap((s) => s.tasks);
  }, [daySections, selectedDay]);

  const activeLabel = useMemo(() => {
    if (selectedDay) {
      const section = daySections.find((s) => s.dateStr === selectedDay);
      return section?.label ?? '';
    }
    return t('allWeek');
  }, [daySections, selectedDay]);

  const handleToggleComplete = useCallback(
    (task: Task) => {
      updateTask.mutate({
        id: task.id,
        data: { status: task.status === 'completed' ? 'open' : 'completed' },
      });
    },
    [updateTask]
  );

  const handlePress = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const handleDelete = useCallback(
    (task: Task) => {
      deleteTask.mutate(task.id);
    },
    [deleteTask]
  );

  if (isLoading) {
    return <LoadingOverlay message={t('loadingWeekly')} />;
  }

  return (
    <View className="flex-1 bg-background">
      {/* Week Navigation */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable onPress={() => setWeekOffset((o) => o - 1)} hitSlop={8}>
          <Icon as={ChevronLeft} size={20} className="text-foreground" />
        </Pressable>
        <Pressable onPress={() => setWeekOffset(0)}>
          <Text className="text-sm font-semibold text-foreground">{weekLabel}</Text>
        </Pressable>
        <Pressable onPress={() => setWeekOffset((o) => o + 1)} hitSlop={8}>
          <Icon as={ChevronRight} size={20} className="text-foreground" />
        </Pressable>
      </View>

      {/* Day Selector */}
      <View className="flex-row border-b border-border px-2 pb-2">
        {/* "All" pill */}
        <Pressable
          onPress={() => setSelectedDay(null)}
          className={cn(
            'mx-1 items-center rounded-lg px-2 py-2',
            selectedDay === null && 'bg-primary'
          )}
        >
          <Text
            className={cn(
              'text-xs font-medium',
              selectedDay === null ? 'text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            {t('filterAll')}
          </Text>
        </Pressable>

        {weekDays.map((day) => {
          const isSelected = selectedDay === day.dateStr;
          const dayTaskCount = daySections.find((s) => s.dateStr === day.dateStr)?.tasks.length ?? 0;
          return (
            <Pressable
              key={day.dateStr}
              onPress={() => setSelectedDay(isSelected ? null : day.dateStr)}
              className={cn(
                'flex-1 items-center rounded-lg py-2',
                isSelected && 'bg-primary',
                day.isToday && !isSelected && 'bg-primary/10'
              )}
            >
              <Text
                className={cn(
                  'text-xs font-medium',
                  isSelected
                    ? 'text-primary-foreground'
                    : day.isToday
                      ? 'text-primary'
                      : 'text-muted-foreground'
                )}
              >
                {day.dayName}
              </Text>
              <Text
                className={cn(
                  'text-base font-bold',
                  isSelected
                    ? 'text-primary-foreground'
                    : day.isToday
                      ? 'text-primary'
                      : 'text-foreground'
                )}
              >
                {day.dayNum}
              </Text>
              {dayTaskCount > 0 && (
                <View
                  className={cn(
                    'mt-0.5 h-1.5 w-1.5 rounded-full',
                    isSelected ? 'bg-primary-foreground' : 'bg-primary'
                  )}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Section Label */}
      <View className="px-4 py-2">
        <Text className="text-sm font-medium text-muted-foreground">
          {activeLabel} ({activeTasks.length})
        </Text>
      </View>

      {/* Task List */}
      <FlatList
        data={activeTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggleComplete={handleToggleComplete}
            onPress={handlePress}
            
          />
        )}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListEmptyComponent={
          <EmptyState
            icon={CalendarDays}
            title={t('noTasksThisWeek')}
            description={t('noTasksThisWeekDescription')}
            actionLabel={t('newTask')}
            onAction={() => router.push('/(app)/(tabs)/tasks/new' as never)}
          />
        }
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerClassName="px-4 pb-20"
      />
      <TaskEditSheet task={editingTask} isOpen={!!editingTask} onClose={() => setEditingTask(null)} />
    </View>
  );
}
