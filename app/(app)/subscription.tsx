import { View, ScrollView, Pressable, Alert } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { Button } from '@/shared/components/ui/button';
import { Header } from '@/shared/components/layout/Header';
import { Check, X, Crown, Sparkles, Lock, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Animated, { FadeInDown } from 'react-native-reanimated';

const FREE_FEATURES = [
  { key: 'unlimitedTasks', included: true },
  { key: 'unlimitedHabits', included: true },
  { key: 'calendarSync', included: true },
  { key: 'aiAssistant', included: false },
  { key: 'advancedFinances', included: false },
  { key: 'prioritySupport', included: false },
];

const PRO_FEATURES = [
  { key: 'unlimitedTasks', included: true },
  { key: 'unlimitedHabits', included: true },
  { key: 'aiAssistant', included: true },
  { key: 'advancedFinances', included: true },
  { key: 'prioritySupport', included: true },
  { key: 'calendarSync', included: true },
];

export default function SubscriptionScreen() {
  const { t } = useTranslation('features.subscription');

  const handleUpgrade = async () => {
    // TODO: Call subscriptionService.createCheckout() and open URL
    Alert.alert(t('title'), t('messages.error'));
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Header title="" showBack />

      <ScrollView className="flex-1 px-4" contentContainerClassName="pb-8">
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(300)} className="items-center pt-2">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/15">
            <Icon as={Crown} size={28} className="text-primary" />
          </View>
          <Text className="mt-3 text-2xl font-bold text-foreground">{t('title')}</Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            {t('description')}
          </Text>
        </Animated.View>

        {/* Plans */}
        <View className="mt-8 gap-4">
          {/* Free Plan */}
          <Animated.View entering={FadeInDown.delay(50).duration(300)}>
            <View className="rounded-2xl border border-border bg-card p-5">
              <Text className="text-lg font-bold text-foreground">{t('plans.free.title')}</Text>
              <View className="mt-1 flex-row items-baseline">
                <Text className="text-3xl font-bold text-foreground">$0</Text>
                <Text className="ml-1 text-sm text-muted-foreground">{t('billing.perMonth')}</Text>
              </View>

              <View className="mt-4 gap-2.5">
                {FREE_FEATURES.map((f) => (
                  <View key={f.key} className="flex-row items-center gap-2.5">
                    <Icon
                      as={f.included ? Check : X}
                      size={14}
                      className={f.included ? 'text-success' : 'text-muted-foreground/40'}
                    />
                    <Text className={cn('text-sm', f.included ? 'text-foreground' : 'text-muted-foreground/60')}>
                      {t(`features.${f.key}`)}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="mt-4 rounded-lg border border-border bg-muted py-2.5">
                <Text className="text-center text-sm font-medium text-muted-foreground">
                  Current Plan
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Premium Plan */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)}>
            <View className="relative overflow-hidden rounded-2xl border-2 border-primary bg-card p-5">
              {/* Most Popular Badge */}
              <View className="absolute -right-8 top-4 rotate-45 bg-primary px-10 py-1">
                <Text className="text-2xs font-bold text-primary-foreground">POPULAR</Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Icon as={Sparkles} size={16} className="text-primary" />
                <Text className="text-lg font-bold text-foreground">{t('plans.pro.title')}</Text>
              </View>
              <View className="mt-1 flex-row items-baseline">
                <Text className="text-3xl font-bold text-foreground">$9.99</Text>
                <Text className="ml-1 text-sm text-muted-foreground">{t('billing.perMonth')}</Text>
              </View>

              <View className="mt-4 gap-2.5">
                {PRO_FEATURES.map((f) => (
                  <View key={f.key} className="flex-row items-center gap-2.5">
                    <Icon as={Check} size={14} className="text-primary" />
                    <Text className="text-sm text-foreground">{t(`features.${f.key}`)}</Text>
                  </View>
                ))}
              </View>

              <Button className="mt-5 shadow-lg shadow-primary/20" onPress={handleUpgrade}>
                <Icon as={Sparkles} size={14} className="text-primary-foreground" />
                <Text className="text-sm font-bold text-primary-foreground">{t('upgrade')}</Text>
              </Button>

              <Pressable className="mt-3 items-center py-1">
                <Text className="text-xs text-muted-foreground">Start 14-Day Free Trial</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>

        {/* Trust Indicators */}
        <Animated.View entering={FadeInDown.delay(150).duration(300)} className="mt-6 flex-row justify-center gap-6">
          <View className="items-center gap-1">
            <Icon as={Lock} size={14} className="text-muted-foreground" />
            <Text className="text-2xs text-muted-foreground">Secure</Text>
          </View>
          <View className="items-center gap-1">
            <Icon as={ArrowRight} size={14} className="text-muted-foreground" />
            <Text className="text-2xs text-muted-foreground">Cancel Anytime</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
