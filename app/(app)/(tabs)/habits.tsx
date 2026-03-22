import { useState, useCallback, useMemo } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { IconCircle } from '@/shared/components/ui/icon-circle';
import { Progress } from '@/shared/components/ui/progress';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Header } from '@/shared/components/layout/Header';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { Flame, Plus, TrendingUp, Trophy } from 'lucide-react-native';
import { HabitCard } from '@/features/habits/components/HabitCard';
import { HabitForm } from '@/features/habits/components/HabitForm';
import { HabitFormSheet } from '@/features/habits/components/HabitFormSheet';
import { HabitEditSheet } from '@/features/habits/components/HabitEditSheet';
import {
  useHabits,
  useHabitStats,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
  useLogHabit,
} from '@/features/habits/hooks/useHabits';
import type { HabitFormData, HabitWithLogs } from '@/features/habits/types';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { format } from 'date-fns';

export default function HabitsScreen() {
  const { t } = useTranslation('features.habits');
  const { t: tCommon } = useTranslation('common');
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithLogs | null>(null);

  const { data: habits, isLoading, refetch, isRefetching } = useHabits();
  const { data: stats } = useHabitStats();
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();
  const logHabit = useLogHabit();

  const todayFormatted = format(new Date(), 'EEEE, MMMM d');
  const s = stats as any;
  const completedToday = s?.totalCompletedToday ?? s?.total_completed_today ?? 0;
  const totalToday = s?.totalHabits ?? s?.total_habits ?? 0;
  const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const longestArr = s?.streaks?.longest ?? [];
  const bestStreak = longestArr[0]?.streakDays ?? longestArr[0]?.streak_days ?? 0;

  const handleCreateHabit = async (formData: HabitFormData) => {
    await createHabit.mutateAsync({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      color: formData.color,
      target_frequency: formData.targetFrequency,
      frequency_type: formData.frequencyType,
      week_days: formData.weekDays,
    });
    setShowForm(false);
  };

  const handleEditHabit = async (formData: HabitFormData) => {
    if (!editingHabit) return;
    await updateHabit.mutateAsync({
      id: editingHabit.id,
      data: {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        color: formData.color,
        target_frequency: formData.targetFrequency,
        frequency_type: formData.frequencyType,
        week_days: formData.weekDays,
      },
    });
    setEditingHabit(null);
  };

  const handleDeleteHabit = (habit: HabitWithLogs) => {
    Alert.alert(t('deleteTitle'), t('deleteConfirmation'), [
      { text: tCommon('actions.cancel'), style: 'cancel' },
      {
        text: tCommon('actions.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteHabit.mutateAsync(habit.id);
          setEditingHabit(null);
        },
      },
    ]);
  };

  const handleCompleteHabit = useCallback(
    (habit: HabitWithLogs) => {
      const today = new Date().toISOString().split('T')[0];
      const todayLog = habit.logs?.find((log) => log.date?.split('T')[0] === today);
      const currentCount = todayLog?.completedCount ?? 0;
      logHabit.mutate({
        id: habit.id,
        data: { date: today, completed_count: currentCount + 1 },
      });
    },
    [logHabit]
  );

  const handleUncompleteHabit = useCallback(
    (habit: HabitWithLogs) => {
      const today = new Date().toISOString().split('T')[0];
      const todayLog = habit.logs?.find((log) => log.date?.split('T')[0] === today);
      const currentCount = todayLog?.completedCount ?? 0;
      if (currentCount > 0) {
        logHabit.mutate({
          id: habit.id,
          data: { date: today, completed_count: currentCount - 1 },
        });
      }
    },
    [logHabit]
  );

  const getStreakForHabit = useCallback(
    (habitId: string) => {
      const details = (stats as any)?.habitDetails ?? (stats as any)?.habit_details;
      if (!details || !Array.isArray(details)) return 0;
      const detail = details.find(
        (d: any) => (d.habitId ?? d.habit_id) === habitId
      );
      return detail?.currentStreak ?? detail?.current_streak ?? 0;
    },
    [stats]
  );

  const renderHabitCard = useCallback(
    ({ item }: { item: HabitWithLogs }) => (
      <HabitCard
        habit={item}
        currentStreak={getStreakForHabit(item.id)}
        onComplete={() => handleCompleteHabit(item)}
        onUncomplete={() => handleUncompleteHabit(item)}
        onPress={() => setEditingHabit(item)}
        className="mb-3"
      />
    ),
    [getStreakForHabit, handleCompleteHabit, handleUncompleteHabit]
  );

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <LoadingOverlay message={t('loadingHabits')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-1 pt-3">
        <View>
          <Text className="text-2xl font-bold text-foreground">{t('title')}</Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">{todayFormatted}</Text>
        </View>
        <Pressable
          onPress={() => setShowForm(true)}
          className="h-9 w-9 items-center justify-center rounded-full bg-primary active:bg-primary-hover"
          hitSlop={8}
        >
          <Icon as={Plus} size={18} className="text-primary-foreground" />
        </Pressable>
      </View>

      {/* Streak Banner */}
      {bestStreak >= 3 && (
        <Animated.View entering={FadeInDown.duration(300)} className="mx-4 mt-3">
          <Card className="border-warning/20 bg-card">
            <CardContent className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-warning/15">
                <Icon as={Flame} size={20} className="text-warning" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">
                  {bestStreak} Day Streak!
                </Text>
                <Text className="text-2xs text-muted-foreground">
                  Your best this month. Keep going!
                </Text>
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      )}

      {/* Today's Progress */}
      {totalToday > 0 && (
        <Animated.View entering={FadeInDown.delay(100).duration(300)} className="mx-4 mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-foreground">
              Today&apos;s Habits
            </Text>
            <Text className="text-sm font-bold text-primary">
              {completedToday}/{totalToday}
            </Text>
          </View>
          <Progress value={progressPercent} className="mt-2 h-2" indicatorClassName="bg-primary" />
        </Animated.View>
      )}

      {/* Stats Row */}
      {stats && totalToday > 0 && (
        <Animated.View entering={FadeInDown.delay(150).duration(300)} className="mx-4 mt-4 flex-row gap-3">
          <View className="flex-1 rounded-xl border border-border bg-card p-3">
            <IconCircle icon={TrendingUp} color="success" size="sm" />
            <Text className="mt-2 text-lg font-bold text-foreground">{s?.completionRate ?? s?.completion_rate ?? 0}%</Text>
            <Text className="text-2xs text-muted-foreground">Completion Rate</Text>
          </View>
          <View className="flex-1 rounded-xl border border-border bg-card p-3">
            <IconCircle icon={Trophy} color="warning" size="sm" />
            <Text className="mt-2 text-lg font-bold text-foreground">{bestStreak}d</Text>
            <Text className="text-2xs text-muted-foreground">Best Streak</Text>
          </View>
        </Animated.View>
      )}

      {/* Habits List */}
      <View className="mt-4 flex-1 px-4" collapsable={false}>
        {!habits || habits.length === 0 ? (
          <EmptyState
            icon={Flame}
            title={t('noHabitsYet')}
            description={t('noHabitsDescription')}
            actionLabel={t('actions.create')}
            onAction={() => setShowForm(true)}
          />
        ) : (
          <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={renderHabitCard}
            refreshing={isRefetching}
            onRefresh={refetch}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-20"
          />
        )}
      </View>

      {/* Create habit sheet */}
      <HabitFormSheet isOpen={showForm} onClose={() => setShowForm(false)} />

      {/* Edit habit sheet */}
      <HabitEditSheet habit={editingHabit} isOpen={!!editingHabit} onClose={() => setEditingHabit(null)} />
    </SafeAreaView>
  );
}
