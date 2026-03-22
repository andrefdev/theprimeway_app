import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/shared/components/ui/text';
import { Button } from '@/shared/components/ui/button';
import { Icon } from '@/shared/components/ui/icon';
import { cn } from '@/shared/utils/cn';
import { ChevronRight, Repeat2 } from 'lucide-react-native';

const SUGGESTED_HABITS = [
  'Read for 30 minutes',
  'Exercise',
  'Meditate',
  'Drink 8 glasses of water',
  'Journal',
  'No social media before noon',
];

export default function HabitsScreen() {
  const [habitName, setHabitName] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pb-2 pt-6">
        <Text className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Step 2 of 5
        </Text>
        <Text className="mt-2 text-3xl font-bold text-foreground">
          Create your first habit
        </Text>
        <Text className="mt-2 text-base text-muted-foreground">
          Start building consistency with a simple daily habit.
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerClassName="pb-6 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Habit Icon */}
        <View className="mb-6 items-center">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-violet-400/15">
            <Icon as={Repeat2} size={32} className="text-violet-400" />
          </View>
        </View>

        {/* Habit Name Input */}
        <View className="mb-2">
          <Text className="mb-2 text-sm font-medium text-foreground">
            Habit name
          </Text>
          <TextInput
            value={habitName}
            onChangeText={setHabitName}
            placeholder="e.g., Read for 30 minutes"
            placeholderTextColor="hsl(0 0% 45%)"
            className="rounded-xl border border-border bg-muted/50 px-4 py-3.5 text-base text-foreground"
          />
        </View>

        {/* Suggested Habits */}
        <View className="mt-6">
          <Text className="mb-3 text-sm font-medium text-muted-foreground">
            Or pick a suggestion
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SUGGESTED_HABITS.map((habit) => (
              <Pressable
                key={habit}
                onPress={() => setHabitName(habit)}
                className={cn(
                  'rounded-full border border-border px-4 py-2',
                  habitName === habit && 'border-primary bg-primary/10'
                )}
              >
                <Text
                  className={cn(
                    'text-sm text-muted-foreground',
                    habitName === habit && 'text-foreground'
                  )}
                >
                  {habit}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="flex-row items-center justify-between border-t border-border px-6 pb-6 pt-4">
        <Button
          variant="ghost"
          onPress={() => router.push('/(onboarding)/tasks')}
        >
          <Text className="text-sm text-muted-foreground">Skip</Text>
        </Button>

        <Button
          size="lg"
          onPress={() => router.push('/(onboarding)/tasks')}
          disabled={habitName.trim().length === 0}
          className="min-w-[140px]"
        >
          <Text className="text-base font-semibold text-primary-foreground">
            Next
          </Text>
          <Icon as={ChevronRight} size={20} className="text-primary-foreground" />
        </Button>
      </View>
    </SafeAreaView>
  );
}
