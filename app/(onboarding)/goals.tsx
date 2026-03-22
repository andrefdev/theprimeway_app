import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/shared/components/ui/text';
import { Button } from '@/shared/components/ui/button';
import { Icon } from '@/shared/components/ui/icon';
import { cn } from '@/shared/utils/cn';
import {
  Wallet,
  Briefcase,
  Heart,
  Users,
  Brain,
  Sparkles,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

type PillarGoal = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  selectedBg: string;
};

const PILLAR_GOALS: PillarGoal[] = [
  {
    id: 'finances',
    label: 'Finances',
    description: 'Budget, save, and invest wisely',
    icon: Wallet,
    color: 'text-emerald-400',
    selectedBg: 'bg-emerald-400/15 border-emerald-400/40',
  },
  {
    id: 'career',
    label: 'Career',
    description: 'Grow professionally and excel',
    icon: Briefcase,
    color: 'text-blue-400',
    selectedBg: 'bg-blue-400/15 border-blue-400/40',
  },
  {
    id: 'health',
    label: 'Health',
    description: 'Exercise, nutrition, and wellness',
    icon: Heart,
    color: 'text-rose-400',
    selectedBg: 'bg-rose-400/15 border-rose-400/40',
  },
  {
    id: 'relationships',
    label: 'Relationships',
    description: 'Strengthen personal connections',
    icon: Users,
    color: 'text-amber-400',
    selectedBg: 'bg-amber-400/15 border-amber-400/40',
  },
  {
    id: 'mindset',
    label: 'Mindset',
    description: 'Mental clarity and personal growth',
    icon: Brain,
    color: 'text-violet-400',
    selectedBg: 'bg-violet-400/15 border-violet-400/40',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    description: 'Design the life you want to live',
    icon: Sparkles,
    color: 'text-cyan-400',
    selectedBg: 'bg-cyan-400/15 border-cyan-400/40',
  },
];

export default function GoalsScreen() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleGoal = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pb-2 pt-6">
        <Text className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Step 1 of 5
        </Text>
        <Text className="mt-2 text-3xl font-bold text-foreground">
          What are your goals?
        </Text>
        <Text className="mt-2 text-base text-muted-foreground">
          Select the areas you want to focus on. You can always change this later.
        </Text>
      </View>

      {/* Goals Grid */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerClassName="gap-3 pb-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {PILLAR_GOALS.map((goal) => {
          const isSelected = selected.includes(goal.id);
          return (
            <Pressable
              key={goal.id}
              onPress={() => toggleGoal(goal.id)}
              className={cn(
                'flex-row items-center gap-4 rounded-2xl border border-border p-4',
                isSelected && goal.selectedBg
              )}
            >
              {/* Icon */}
              <View
                className={cn(
                  'h-12 w-12 items-center justify-center rounded-xl',
                  isSelected ? 'bg-transparent' : 'bg-muted'
                )}
              >
                <Icon as={goal.icon} size={24} className={goal.color} />
              </View>

              {/* Text */}
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {goal.label}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {goal.description}
                </Text>
              </View>

              {/* Checkmark */}
              {isSelected && (
                <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
                  <Icon as={Check} size={16} className="text-primary-foreground" />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Bottom Actions */}
      <View className="flex-row items-center justify-between border-t border-border px-6 pb-6 pt-4">
        <Button
          variant="ghost"
          onPress={() => router.push('/(onboarding)/habits')}
        >
          <Text className="text-sm text-muted-foreground">Skip</Text>
        </Button>

        <Button
          size="lg"
          onPress={() => router.push('/(onboarding)/habits')}
          disabled={selected.length === 0}
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
