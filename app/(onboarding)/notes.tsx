import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/shared/components/ui/text';
import { Button } from '@/shared/components/ui/button';
import { Icon } from '@/shared/components/ui/icon';
import {
  CheckSquare,
  Repeat2,
  Target,
  Wallet,
  StickyNote,
  Calendar,
  Sparkles,
} from 'lucide-react-native';

const FEATURES = [
  { icon: CheckSquare, label: 'Tasks', color: 'text-blue-400' },
  { icon: Repeat2, label: 'Habits', color: 'text-violet-400' },
  { icon: Target, label: 'Goals', color: 'text-amber-400' },
  { icon: Wallet, label: 'Finances', color: 'text-emerald-400' },
  { icon: StickyNote, label: 'Notes', color: 'text-cyan-400' },
  { icon: Calendar, label: 'Calendar', color: 'text-rose-400' },
];

export default function NotesScreen() {
  const handleFinish = () => {
    router.replace('/(app)/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">
        {/* Success Icon */}
        <View className="mb-8 h-20 w-20 items-center justify-center rounded-3xl bg-emerald-400/15">
          <Icon as={Sparkles} size={40} className="text-emerald-400" />
        </View>

        {/* Title */}
        <Text className="mb-3 text-center text-3xl font-bold text-foreground">
          You're all set!
        </Text>
        <Text className="mb-10 text-center text-base leading-6 text-muted-foreground">
          Your workspace is ready. Here's everything{'\n'}you can do with The Prime Way:
        </Text>

        {/* Feature Grid */}
        <View className="w-full flex-row flex-wrap justify-center gap-4">
          {FEATURES.map((feature) => (
            <View
              key={feature.label}
              className="w-[28%] items-center gap-2 rounded-2xl bg-muted/50 py-4"
            >
              <Icon as={feature.icon} size={24} className={feature.color} />
              <Text className="text-xs font-medium text-muted-foreground">
                {feature.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="px-8 pb-6">
        <Button
          size="lg"
          className="w-full"
          onPress={handleFinish}
        >
          <Text className="text-base font-semibold text-primary-foreground">
            Start Using The Prime Way
          </Text>
        </Button>

        <Text className="mt-4 text-center text-xs text-muted-foreground">
          You can customize everything in Settings
        </Text>
      </View>
    </SafeAreaView>
  );
}
