import { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { cn } from '@/shared/utils/cn';
import { Check, Clock, Tag, Play } from 'lucide-react-native';
import type { Task, TaskPriority } from '@shared/types/models';

const PRIORITY_BAR: Record<TaskPriority, string> = {
  high: 'bg-priority-high',
  medium: 'bg-priority-medium',
  low: 'bg-priority-low',
};

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (task: Task) => void;
  onPress?: (task: Task) => void;
  onTimer?: (task: Task) => void;
  showTimeSlot?: boolean;
}

export function TaskCard({ task, onToggleComplete, onPress, onTimer, showTimeSlot }: TaskCardProps) {
  const isCompleted = task.status === 'completed';

  const handleToggle = useCallback(() => onToggleComplete?.(task), [task, onToggleComplete]);
  const handlePress = useCallback(() => onPress?.(task), [task, onPress]);
  const handleTimer = useCallback(() => onTimer?.(task), [task, onTimer]);

  const formattedDuration =
    task.estimatedDurationMinutes != null
      ? task.estimatedDurationMinutes >= 60
        ? `${Math.floor(task.estimatedDurationMinutes / 60)}h${task.estimatedDurationMinutes % 60 ? ` ${task.estimatedDurationMinutes % 60}m` : ''}`
        : `${task.estimatedDurationMinutes}m`
      : null;

  const timeSlot = showTimeSlot && task.scheduledStart
    ? new Date(task.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const tags = Array.isArray(task.tags) ? task.tags : [];

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
      <Pressable
        onPress={handlePress}
        className={cn('flex-row overflow-hidden rounded-xl border border-border bg-card', isCompleted && 'opacity-60')}
      >
        {/* Priority Bar */}
        <View className={cn('w-1 self-stretch rounded-l-xl', PRIORITY_BAR[task.priority])} />

        {/* Content */}
        <View className="flex-1 flex-row items-center gap-3 px-3 py-3">
          {/* Checkbox */}
          <Pressable
            onPress={handleToggle}
            className={cn('h-6 w-6 items-center justify-center rounded-full border-2', isCompleted ? 'border-primary bg-primary' : 'border-muted-foreground/30')}
            hitSlop={8}
          >
            {isCompleted && <Icon as={Check} size={14} className="text-primary-foreground" />}
          </Pressable>

          {/* Text */}
          <View className="flex-1 gap-1.5">
            <Text className={cn('text-sm font-semibold text-foreground', isCompleted && 'text-muted-foreground line-through')} numberOfLines={2}>
              {task.title}
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              {timeSlot && (
                <View className="flex-row items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5">
                  <Icon as={Clock} size={10} className="text-primary" />
                  <Text className="text-2xs font-medium text-primary">{timeSlot}</Text>
                </View>
              )}
              {formattedDuration && (
                <View className="flex-row items-center gap-1 rounded-md bg-muted px-1.5 py-0.5">
                  <Icon as={Clock} size={10} className="text-muted-foreground" />
                  <Text className="text-2xs text-muted-foreground">{formattedDuration}</Text>
                </View>
              )}
              {tags.length > 0 && (
                <View className="flex-row items-center gap-1 rounded-md bg-accent/10 px-1.5 py-0.5">
                  <Icon as={Tag} size={10} className="text-accent" />
                  <Text className="text-2xs text-accent" numberOfLines={1}>
                    {tags[0]}{tags.length > 1 ? ` +${tags.length - 1}` : ''}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Timer button */}
          {!isCompleted && onTimer && (
            <Pressable
              onPress={handleTimer}
              className="h-8 w-8 items-center justify-center rounded-full bg-primary/10 active:bg-primary/20"
              hitSlop={4}
            >
              <Icon as={Play} size={14} className="text-primary" />
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
