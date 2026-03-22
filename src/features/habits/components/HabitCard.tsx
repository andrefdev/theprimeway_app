import { Pressable, View } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { cn } from '@/shared/utils/cn';
import { Flame, Check, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { HabitWithLogs } from '../types';

interface HabitCardProps {
  habit: HabitWithLogs;
  currentStreak?: number;
  onComplete: () => void;
  onUncomplete?: () => void;
  onPress?: () => void;
  className?: string;
}

function WeekDots({ habit }: { habit: HabitWithLogs }) {
  const today = new Date();
  const dots = [];
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const log = habit.logs?.find((l) => l.date?.split('T')[0] === dateStr);
    const completed = (log?.completedCount ?? 0) >= (habit.targetFrequency || 1);
    const isToday = i === 0;

    dots.push(
      <View key={dateStr} className="items-center gap-0.5">
        <Text className="text-[8px] text-muted-foreground">{dayLabels[6 - i]}</Text>
        <View
          className={cn(
            'h-3 w-3 items-center justify-center rounded-full',
            completed ? 'opacity-100' : 'opacity-20',
            isToday && !completed && 'border border-muted-foreground/40'
          )}
          style={{ backgroundColor: completed ? (habit.color || '#6454FD') : (habit.color || '#6454FD') }}
        >
          {completed && <Icon as={Check} size={7} className="text-white" />}
        </View>
      </View>
    );
  }
  return <View className="flex-row items-center gap-1.5">{dots}</View>;
}

export function HabitCard({
  habit,
  currentStreak = 0,
  onComplete,
  onUncomplete,
  onPress,
  className,
}: HabitCardProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayLog = habit.logs?.find((log) => log.date?.split('T')[0] === today);
  const completedToday = todayLog?.completedCount ?? 0;
  const target = habit.targetFrequency || 1;
  const isCompleted = completedToday >= target;

  const handleToggle = async () => {
    if (isCompleted) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUncomplete?.();
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onComplete();
    }
  };

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center overflow-hidden rounded-xl border border-border bg-card',
        className
      )}
    >
      {/* Color bar */}
      <View
        className="w-1 self-stretch rounded-l-xl"
        style={{ backgroundColor: habit.color || '#6454FD' }}
      />

      {/* Content */}
      <View className="flex-1 gap-2 px-3 py-3">
        {/* Name + Streak */}
        <View className="flex-row items-center justify-between">
          <Text
            className={cn(
              'flex-1 text-sm font-semibold text-foreground',
              isCompleted && 'text-muted-foreground'
            )}
            numberOfLines={1}
          >
            {habit.name}
          </Text>

          {currentStreak > 0 && (
            <View className="ml-2 flex-row items-center gap-0.5 rounded-full bg-warning/15 px-2 py-0.5">
              <Icon as={Flame} size={10} className="text-warning" />
              <Text className="text-2xs font-bold text-warning">{currentStreak}d</Text>
            </View>
          )}
        </View>

        {/* Category + Week dots */}
        <View className="flex-row items-center justify-between">
          {habit.category && (
            <Text className="text-2xs text-muted-foreground">{habit.category}</Text>
          )}
          <WeekDots habit={habit} />
        </View>

        {/* Progress text */}
        {target > 1 && (
          <Text className="text-2xs text-muted-foreground">
            {completedToday}/{target} times today
          </Text>
        )}
      </View>

      {/* Toggle button */}
      <Pressable
        onPress={handleToggle}
        className={cn(
          'mx-3 h-10 w-10 items-center justify-center rounded-full border-2',
          isCompleted
            ? 'border-transparent'
            : 'border-muted-foreground/30'
        )}
        style={isCompleted ? { backgroundColor: habit.color || '#6454FD' } : undefined}
        hitSlop={8}
      >
        {isCompleted ? (
          <Icon as={Check} size={18} className="text-white" />
        ) : (
          <View className="h-4 w-4 rounded-full" style={{ backgroundColor: (habit.color || '#6454FD') + '30' }} />
        )}
      </Pressable>
    </Pressable>
  );
}
