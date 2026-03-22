import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/shared/components/ui/text';
import { Button } from '@/shared/components/ui/button';
import { Icon } from '@/shared/components/ui/icon';
import { cn } from '@/shared/utils/cn';
import { ChevronRight, CheckSquare } from 'lucide-react-native';

const SUGGESTED_TASKS = [
  'Plan my week ahead',
  'Set up my budget',
  'Define 3 monthly goals',
  'Organize my workspace',
  'Review my priorities',
  'Schedule a workout',
];

export default function TasksScreen() {
  const [taskName, setTaskName] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pb-2 pt-6">
        <Text className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Step 3 of 5
        </Text>
        <Text className="mt-2 text-3xl font-bold text-foreground">
          Create your first task
        </Text>
        <Text className="mt-2 text-base text-muted-foreground">
          What is the most important thing you need to do today?
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerClassName="pb-6 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Task Icon */}
        <View className="mb-6 items-center">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-blue-400/15">
            <Icon as={CheckSquare} size={32} className="text-blue-400" />
          </View>
        </View>

        {/* Task Name Input */}
        <View className="mb-2">
          <Text className="mb-2 text-sm font-medium text-foreground">
            Task name
          </Text>
          <TextInput
            value={taskName}
            onChangeText={setTaskName}
            placeholder="e.g., Plan my week ahead"
            placeholderTextColor="hsl(0 0% 45%)"
            className="rounded-xl border border-border bg-muted/50 px-4 py-3.5 text-base text-foreground"
          />
        </View>

        {/* Suggested Tasks */}
        <View className="mt-6">
          <Text className="mb-3 text-sm font-medium text-muted-foreground">
            Or pick a suggestion
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SUGGESTED_TASKS.map((task) => (
              <Pressable
                key={task}
                onPress={() => setTaskName(task)}
                className={cn(
                  'rounded-full border border-border px-4 py-2',
                  taskName === task && 'border-primary bg-primary/10'
                )}
              >
                <Text
                  className={cn(
                    'text-sm text-muted-foreground',
                    taskName === task && 'text-foreground'
                  )}
                >
                  {task}
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
          onPress={() => router.push('/(onboarding)/finances')}
        >
          <Text className="text-sm text-muted-foreground">Skip</Text>
        </Button>

        <Button
          size="lg"
          onPress={() => router.push('/(onboarding)/finances')}
          disabled={taskName.trim().length === 0}
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
