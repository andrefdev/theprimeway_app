import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Icon } from '@/shared/components/ui/icon';
import { IconCircle } from '@/shared/components/ui/icon-circle';
import { SectionHeader } from '@/shared/components/ui/section-header';
import { TaskCard } from '@features/tasks/components/TaskCard';
import { TaskEditSheet } from '@features/tasks/components/TaskEditSheet';
import { TaskTimerSheet } from '@features/tasks/components/TaskTimerSheet';
import { TaskFormSheet } from '@features/tasks/components/TaskFormSheet';
import { HabitCard } from '@features/habits/components/HabitCard';
import { TransactionFormSheet } from '@features/finances/components/TransactionFormSheet';
import { useTasks, useUpdateTask } from '@features/tasks/hooks/useTasks';
import { useHabits, useHabitStats, useLogHabit } from '@features/habits/hooks/useHabits';
import { useAuthStore } from '@/shared/stores/authStore';
import { router } from 'expo-router';
import {
  CheckSquare, Flame, Timer, Plus, Wallet, FileText, Sparkles, DollarSign,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import type { Task } from '@shared/types/models';
import type { HabitWithLogs } from '@features/habits/types';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Sheets state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [timerTask, setTimerTask] = useState<Task | null>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { data: tasks } = useTasks({ date: todayStr });
  const { data: habits } = useHabits();
  const { data: habitStats } = useHabitStats();
  const updateTask = useUpdateTask();
  const logHabit = useLogHabit();

  const todayTasks = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.slice(0, 5);
  }, [tasks]);

  const todayHabits = useMemo(() => {
    if (!habits || !Array.isArray(habits)) return [];
    return habits.slice(0, 5);
  }, [habits]);

  const completedTasks = todayTasks.filter((t) => t.status === 'completed').length;
  const s = habitStats as any;
  const completedHabits = s?.totalCompletedToday ?? s?.total_completed_today ?? 0;
  const totalHabits = s?.totalHabits ?? s?.total_habits ?? 0;

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  const handleToggleTask = useCallback((task: Task) => {
    updateTask.mutate({ id: task.id, data: { status: task.status === 'completed' ? 'open' : 'completed' } });
  }, [updateTask]);

  const handleCompleteHabit = useCallback((habit: HabitWithLogs) => {
    const d = new Date().toISOString().split('T')[0];
    const log = habit.logs?.find((l) => l.date?.split('T')[0] === d);
    logHabit.mutate({ id: habit.id, data: { date: d, completed_count: (log?.completedCount ?? 0) + 1 } });
  }, [logHabit]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-3">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-foreground">{getGreeting()}, {user?.name?.split(' ')[0] || 'there'}</Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">{today}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* AI Briefing */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <Pressable onPress={() => router.push('/(app)/ai')}>
            <Card className="mt-3 border-primary/20">
              <CardContent className="flex-row items-start gap-3">
                <IconCircle icon={Sparkles} color="primary" size="sm" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Your Daily Brief</Text>
                  <Text className="mt-1 text-xs leading-5 text-muted-foreground">
                    {todayTasks.length} tasks today, {completedHabits}/{totalHabits} habits done.
                  </Text>
                </View>
              </CardContent>
            </Card>
          </Pressable>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mt-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3">
            <MiniStat icon={CheckSquare} color="success" value={`${completedTasks}/${todayTasks.length}`} label="Tasks Done" />
            <MiniStat icon={Flame} color="warning" value={`${completedHabits}/${totalHabits}`} label="Habits" />
            <MiniStat icon={Timer} color="primary" value="0m" label="Focus Time" />
            <MiniStat icon={DollarSign} color="success" value="$0" label="Remaining" />
          </ScrollView>
        </Animated.View>

        {/* Quick Actions — open sheets directly */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} className="mt-6">
          <View className="flex-row justify-around px-4">
            <QuickAction icon={Plus} label="Task" color="primary" onPress={() => setShowTaskForm(true)} />
            <QuickAction icon={Timer} label="Focus" color="destructive" onPress={() => router.push('/(app)/pomodoro')} />
            <QuickAction icon={Wallet} label="Expense" color="success" onPress={() => setShowTransactionForm(true)} />
            <QuickAction icon={FileText} label="Note" color="accent" onPress={() => router.push('/(app)/notes/new' as never)} />
          </View>
        </Animated.View>

        {/* Today's Tasks */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} className="mt-6">
          <SectionHeader title="Today" actionLabel="See all" onAction={() => router.push('/(app)/(tabs)/tasks/today')} />
          {todayTasks.length > 0 ? (
            <View className="mt-3 gap-2">
              {todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleTask}
                  onPress={() => setEditingTask(task)}
                  onTimer={() => setTimerTask(task)}
                  showTimeSlot
                />
              ))}
            </View>
          ) : (
            <Card className="mt-3">
              <CardContent className="items-center py-6">
                <Icon as={CheckSquare} size={32} className="text-muted-foreground/50" />
                <Text className="mt-2 text-sm text-muted-foreground">No tasks for today</Text>
              </CardContent>
            </Card>
          )}
        </Animated.View>

        {/* Habits */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} className="mt-6">
          <SectionHeader title="Habits" actionLabel="See all" onAction={() => router.push('/(app)/(tabs)/habits')} />
          {todayHabits.length > 0 ? (
            <View className="mt-3 gap-2">
              {todayHabits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} onComplete={() => handleCompleteHabit(habit)} onPress={() => router.push('/(app)/(tabs)/habits')} />
              ))}
            </View>
          ) : (
            <Card className="mt-3">
              <CardContent className="items-center py-6">
                <Icon as={Flame} size={32} className="text-muted-foreground/50" />
                <Text className="mt-2 text-sm text-muted-foreground">No habits for today</Text>
              </CardContent>
            </Card>
          )}
        </Animated.View>
      </ScrollView>

      {/* Sheets */}
      <TaskFormSheet isOpen={showTaskForm} onClose={() => setShowTaskForm(false)} />
      <TransactionFormSheet isOpen={showTransactionForm} onClose={() => setShowTransactionForm(false)} />
      <TaskEditSheet task={editingTask} isOpen={!!editingTask} onClose={() => setEditingTask(null)} />
      <TaskTimerSheet task={timerTask} isOpen={!!timerTask} onClose={() => setTimerTask(null)} />
    </SafeAreaView>
  );
}

function MiniStat({ icon, color, value, label }: { icon: typeof CheckSquare; color: 'primary' | 'success' | 'warning' | 'destructive'; value: string; label: string }) {
  return (
    <View className="min-w-[100px] rounded-xl border border-border bg-card px-3 py-3">
      <IconCircle icon={icon} color={color} size="sm" />
      <Text className="mt-2 text-lg font-bold text-foreground">{value}</Text>
      <Text className="text-2xs text-muted-foreground">{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress }: { icon: typeof Plus; label: string; color: 'primary' | 'destructive' | 'success' | 'accent'; onPress: () => void }) {
  return (
    <Pressable className="items-center gap-2" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}>
      <IconCircle icon={icon} color={color} size="lg" />
      <Text className="text-2xs font-medium text-muted-foreground">{label}</Text>
    </Pressable>
  );
}
