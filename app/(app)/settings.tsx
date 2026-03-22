import { View, ScrollView, Pressable, Alert } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Header } from '@/shared/components/layout/Header';
import { useSettingsStore } from '@/shared/stores/settingsStore';
import { useAuthStore } from '@/shared/stores/authStore';
import { setLocale } from '@/i18n';
import { useTranslation } from '@/shared/hooks/useTranslation';
import {
  Globe,
  Palette,
  Clock,
  DollarSign,
  Bell,
  Shield,
  Trash2,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { cn } from '@/shared/utils/cn';
import { useColorScheme } from 'nativewind';
import type { LucideIcon } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SettingsScreen() {
  const { t } = useTranslation('features.settings');
  const { t: tCommon } = useTranslation('common');
  const { t: tSub } = useTranslation('features.subscription');
  const settings = useSettingsStore();
  const logout = useAuthStore((s) => s.logout);
  const { toggleColorScheme, colorScheme } = useColorScheme();

  const handleLanguageChange = () => {
    const newLocale = settings.locale === 'en' ? 'es' : 'en';
    settings.setLocale(newLocale);
    setLocale(newLocale);
  };

  const handleDeleteAccount = () => {
    Alert.alert(t('deleteAccount.title'), t('deleteAccount.warning'), [
      { text: tCommon('actions.cancel'), style: 'cancel' },
      {
        text: tCommon('actions.delete'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Header title={t('title')} showBack />

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
        {/* Preferences */}
        <Animated.View entering={FadeInDown.duration(300)}>
          <SectionTitle title={t('theme.title')} />
          <Card>
            <CardContent className="gap-0 p-0">
              <SettingRow
                icon={Palette}
                label={t('theme.title')}
                value={colorScheme === 'dark' ? t('theme.dark') : t('theme.light')}
                onPress={toggleColorScheme}
              />
              <Divider />
              <SettingRow
                icon={Globe}
                label={t('language.title')}
                value={settings.locale === 'en' ? 'English' : 'Español'}
                onPress={handleLanguageChange}
              />
              <Divider />
              <SettingRow
                icon={Clock}
                label={t('timezone.title')}
                value={settings.timezone}
              />
              <Divider />
              <SettingRow
                icon={DollarSign}
                label={t('currency.title')}
                value={settings.baseCurrency}
                onPress={() => {
                  const next = settings.baseCurrency === 'USD' ? 'PEN' : 'USD';
                  settings.setBaseCurrency(next);
                }}
              />
            </CardContent>
          </Card>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(50).duration(300)}>
          <SectionTitle title={t('notifications.title')} />
          <Card>
            <CardContent className="gap-0 p-0">
              <SettingRow
                icon={Bell}
                label={t('notifications.title')}
                showChevron
                onPress={() => {}}
              />
            </CardContent>
          </Card>
        </Animated.View>

        {/* Subscription */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <SectionTitle title={tSub('title')} />
          <Card>
            <CardContent className="gap-0 p-0">
              <SettingRow
                icon={Shield}
                label={tSub('title')}
                showChevron
                onPress={() => router.push('/(app)/subscription')}
              />
            </CardContent>
          </Card>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View entering={FadeInDown.delay(150).duration(300)}>
          <SectionTitle title={t('dangerZone.title')} />
          <Pressable
            className="flex-row items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 active:bg-destructive/10"
            onPress={handleDeleteAccount}
          >
            <Icon as={Trash2} size={18} className="text-destructive" />
            <Text className="flex-1 text-sm font-medium text-destructive">{t('deleteAccount.title')}</Text>
            <Icon as={ChevronRight} size={16} className="text-destructive/50" />
          </Pressable>
        </Animated.View>

        {/* Version */}
        <View className="mt-8 items-center">
          <Text className="text-2xs text-muted-foreground">The Prime Way v2.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {title}
    </Text>
  );
}

function Divider() {
  return <View className="mx-4 h-px bg-border" />;
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  showChevron,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
}) {
  return (
    <Pressable
      className="flex-row items-center justify-between px-4 py-3.5 active:bg-muted"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3">
        <Icon as={icon} size={18} className="text-muted-foreground" />
        <Text className="text-sm font-medium text-foreground">{label}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {value && <Text className="text-sm text-muted-foreground">{value}</Text>}
        {(showChevron || onPress) && <Icon as={ChevronRight} size={16} className="text-muted-foreground/50" />}
      </View>
    </Pressable>
  );
}
