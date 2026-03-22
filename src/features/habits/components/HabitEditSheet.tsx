import { useState, useEffect } from 'react';
import { Alert, View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { FormSheet } from '@/shared/components/ui/form-sheet';
import { Text } from '@/shared/components/ui/text';
import { Button } from '@/shared/components/ui/button';
import { Icon } from '@/shared/components/ui/icon';
import { Trash2 } from 'lucide-react-native';
import { useUpdateHabit, useDeleteHabit } from '../hooks/useHabits';
import { cn } from '@/shared/utils/cn';
import type { HabitWithLogs } from '../types';

const CATEGORIES = [
  { key: 'health', label: 'Health', emoji: '💪' },
  { key: 'learning', label: 'Learning', emoji: '📚' },
  { key: 'work', label: 'Work', emoji: '💼' },
  { key: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
  { key: 'social', label: 'Social', emoji: '👥' },
  { key: 'creative', label: 'Creative', emoji: '🎨' },
  { key: 'finance', label: 'Finance', emoji: '💰' },
  { key: 'home', label: 'Home', emoji: '🏠' },
];

const COLORS = ['#280FFB', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1'];

interface HabitEditSheetProps {
  habit: HabitWithLogs | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HabitEditSheet({ habit, isOpen, onClose }: HabitEditSheetProps) {
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('health');
  const [color, setColor] = useState('#280FFB');

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setCategory(habit.category ?? 'health');
      setColor(habit.color ?? '#280FFB');
    }
  }, [habit]);

  const handleUpdate = async () => {
    if (!habit || !name.trim()) return;
    try {
      await updateHabit.mutateAsync({
        id: habit.id,
        data: { name: name.trim(), category, color },
      });
      onClose();
    } catch {
      Alert.alert('Error', 'Could not update habit');
    }
  };

  const handleDelete = () => {
    if (!habit) return;
    Alert.alert('Delete Habit', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteHabit.mutateAsync(habit.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <FormSheet isOpen={isOpen} onClose={onClose} title="Edit Habit">
      <TextInput
        className="rounded-xl border border-border bg-card px-4 py-3.5 text-base font-medium text-foreground"
        value={name}
        onChangeText={setName}
      />

      <View>
        <Text className="mb-2 text-xs font-medium text-muted-foreground">Category</Text>
        <View className="flex-row flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.key}
              onPress={() => setCategory(c.key)}
              className={cn(
                'flex-row items-center gap-1.5 rounded-lg border px-3 py-2',
                category === c.key ? 'border-primary bg-primary/10' : 'border-border bg-card'
              )}
            >
              <Text className="text-sm">{c.emoji}</Text>
              <Text className={cn('text-xs font-medium', category === c.key ? 'text-primary' : 'text-muted-foreground')}>
                {c.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View>
        <Text className="mb-2 text-xs font-medium text-muted-foreground">Color</Text>
        <View className="flex-row gap-3">
          {COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              className={cn('h-8 w-8 rounded-full', color === c && 'border-2 border-foreground')}
              style={{ backgroundColor: c }}
            />
          ))}
        </View>
      </View>

      <Button className="h-12 rounded-xl" onPress={handleUpdate} disabled={updateHabit.isPending || !name.trim()}>
        {updateHabit.isPending ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text className="text-sm font-bold text-primary-foreground">Update Habit</Text>
        )}
      </Button>

      <Pressable onPress={handleDelete} className="flex-row items-center justify-center gap-2 py-2">
        <Icon as={Trash2} size={16} className="text-destructive" />
        <Text className="text-sm font-medium text-destructive">Delete Habit</Text>
      </Pressable>
    </FormSheet>
  );
}
