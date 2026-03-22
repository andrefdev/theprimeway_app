import { View, Pressable } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Target,
  BookOpen,
  FileText,
  Sparkles,
  Calendar,
  Timer,
  User,
  Settings,
  Crown,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const MENU_ITEMS: {
  icon: LucideIcon;
  label: string;
  route: string;
  color: string;
  bgColor: string;
}[] = [
  {
    icon: Target,
    label: 'Goals',
    route: '/(app)/(tabs)/goals/roadmap',
    color: 'text-warning',
    bgColor: 'bg-warning/15',
  },
  {
    icon: BookOpen,
    label: 'Reading',
    route: '/(app)/(tabs)/goals/reading',
    color: 'text-info',
    bgColor: 'bg-info/15',
  },
  {
    icon: FileText,
    label: 'Notes',
    route: '/(app)/notes',
    color: 'text-accent',
    bgColor: 'bg-accent/15',
  },
  {
    icon: Sparkles,
    label: 'AI Chat',
    route: '/(app)/ai',
    color: 'text-primary',
    bgColor: 'bg-primary/15',
  },
  {
    icon: Calendar,
    label: 'Calendar',
    route: '/(app)/calendar',
    color: 'text-success',
    bgColor: 'bg-success/15',
  },
  {
    icon: Timer,
    label: 'Pomodoro',
    route: '/(app)/pomodoro',
    color: 'text-destructive',
    bgColor: 'bg-destructive/15',
  },
  {
    icon: User,
    label: 'Profile',
    route: '/(app)/profile',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
  {
    icon: Settings,
    label: 'Settings',
    route: '/(app)/settings',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
  {
    icon: Crown,
    label: 'Premium',
    route: '/(app)/subscription',
    color: 'text-primary',
    bgColor: 'bg-primary/15',
  },
];

export default function MoreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-4 pb-2 pt-3">
        <Text className="text-2xl font-bold text-foreground">More</Text>
      </View>

      <View className="flex-1 px-4 pt-4">
        <View className="flex-row flex-wrap gap-3">
          {MENU_ITEMS.map((item, index) => (
            <Animated.View
              key={item.label}
              entering={FadeInDown.delay(index * 40).duration(300)}
              className="w-[30%] flex-grow"
            >
              <Pressable
                className="items-center rounded-2xl border border-border bg-card px-2 py-5 active:bg-muted"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(item.route as any);
                }}
              >
                <View className={`h-12 w-12 items-center justify-center rounded-full ${item.bgColor}`}>
                  <Icon as={item.icon} size={24} className={item.color} />
                </View>
                <Text className="mt-2.5 text-xs font-medium text-foreground">{item.label}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Footer */}
        <View className="mt-auto items-center pb-8 pt-6">
          <Text className="text-2xs text-muted-foreground">The Prime Way v2.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
