import { useState } from 'react';
import { Screen, ScreenContent } from '@/shared/components/layout/Screen';
import { Header } from '@/shared/components/layout/Header';
import { Text } from '@/shared/components/ui/text';
import { Button } from '@/shared/components/ui/button';
import { Icon } from '@/shared/components/ui/icon';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { OutcomeItem } from '@/features/goals/components/OutcomeItem';
import { usePillars, useCreateOutcome } from '@/features/goals/hooks/useGoals';
import { PILLAR_MAP } from '@/shared/constants/pillars';
import {
  Plus,
  Wallet,
  Briefcase,
  Heart,
  Users,
  Brain,
  Sparkles,
  FileText,
} from 'lucide-react-native';
import { View, Modal, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { LucideIcon } from 'lucide-react-native';
import type { PillarArea, PrimeOutcome } from '@shared/types/models';

const PILLAR_ICONS: Record<PillarArea, LucideIcon> = {
  finances: Wallet,
  career: Briefcase,
  health: Heart,
  relationships: Users,
  mindset: Brain,
  lifestyle: Sparkles,
};

export default function PillarDetailScreen() {
  const { t } = useTranslation('features.goals');
  const { t: tCommon } = useTranslation('common');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: pillars, isLoading, isError, refetch } = usePillars();
  const createOutcome = useCreateOutcome();

  const [showForm, setShowForm] = useState(false);
  const [outcomeTitle, setOutcomeTitle] = useState('');
  const [outcomeDescription, setOutcomeDescription] = useState('');

  const pillar = pillars?.find((p) => p.id === id);
  const config = pillar ? PILLAR_MAP[pillar.area] : null;
  const PillarIcon = pillar ? PILLAR_ICONS[pillar.area] : null;

  const handleCreateOutcome = async () => {
    if (!outcomeTitle.trim() || !id) return;
    await createOutcome.mutateAsync({
      pillarId: id,
      title: outcomeTitle.trim(),
      description: outcomeDescription.trim() || undefined,
    });
    setOutcomeTitle('');
    setOutcomeDescription('');
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <Screen>
        <Header title={t('pillar.title')} showBack />
        <LoadingOverlay message={tCommon('actions.loading')} />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <Header title={t('pillar.title')} showBack />
        <ErrorState
          onRetry={() => refetch()}
        />
      </Screen>
    );
  }

  if (!pillar || !config || !PillarIcon) {
    return (
      <Screen>
        <Header title={t('pillar.title')} showBack />
        <EmptyState
          icon={FileText}
          title={t('pillar.title')}
        />
      </Screen>
    );
  }

  const outcomes = pillar.outcomes ?? [];
  const averageProgress =
    outcomes.length > 0
      ? Math.round(outcomes.reduce((sum, o) => sum + (o.progress ?? 0), 0) / outcomes.length)
      : 0;

  const renderOutcome = ({ item }: { item: PrimeOutcome }) => (
    <OutcomeItem outcome={item} color={config.color} className="mb-3" />
  );

  return (
    <Screen>
      <Header
        title={pillar.title || t(`areas.${pillar.area}`)}
        showBack
        rightAction={
          <Pressable onPress={() => setShowForm(true)} hitSlop={8}>
            <Icon as={Plus} size={20} className="text-foreground" />
          </Pressable>
        }
      />

      <ScreenContent className="flex-1">
        {/* Pillar Header Card */}
        <View className="mb-5 rounded-xl border border-border bg-card p-5">
          <View className="mb-3 flex-row items-center gap-3">
            <View
              className="h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon as={PillarIcon} size={24} color={config.color} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-card-foreground">
                {pillar.title || t(`areas.${pillar.area}`)}
              </Text>
              {pillar.description && (
                <Text className="text-sm text-muted-foreground" numberOfLines={2}>
                  {pillar.description}
                </Text>
              )}
            </View>
          </View>

          {/* Overall Progress */}
          <View className="flex-row items-center gap-3">
            <View className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <View
                className="h-full rounded-full"
                style={{
                  backgroundColor: config.color,
                  width: `${averageProgress}%`,
                }}
              />
            </View>
            <Text className="text-sm font-semibold" style={{ color: config.color }}>
              {averageProgress}%
            </Text>
          </View>
        </View>

        {/* Outcomes Section */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-foreground">{t('primeOutcomes')}</Text>
          <Text className="text-xs text-muted-foreground">
            {outcomes.length} {t('outcome.title')}
          </Text>
        </View>

        {outcomes.length > 0 ? (
          <FlatList
            data={outcomes}
            renderItem={renderOutcome}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-8"
          />
        ) : (
          <EmptyState
            icon={FileText}
            title={t('noQuarterlyGoals')}
            actionLabel={t('createOutcome')}
            onAction={() => setShowForm(true)}
          />
        )}
      </ScreenContent>

      {/* Create Outcome Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowForm(false)}
      >
        <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
          <Header
            title={t('createOutcome')}
            leftAction={
              <Pressable onPress={() => setShowForm(false)} hitSlop={8}>
                <Text className="text-sm font-medium text-primary">{tCommon('actions.cancel')}</Text>
              </Pressable>
            }
          />
          <View className="flex-1 px-4 gap-5 pt-4">
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">{t('form.title')}</Text>
              <TextInput
                className="h-11 rounded-md border border-input bg-background px-3 text-base text-foreground"
                placeholder={t('form.title')}
                placeholderTextColor="hsl(0 0% 63.9%)"
                value={outcomeTitle}
                onChangeText={setOutcomeTitle}
              />
            </View>
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">{t('form.description')}</Text>
              <TextInput
                className="h-20 rounded-md border border-input bg-background px-3 pt-2 text-base text-foreground"
                placeholder={t('form.description')}
                placeholderTextColor="hsl(0 0% 63.9%)"
                multiline
                textAlignVertical="top"
                value={outcomeDescription}
                onChangeText={setOutcomeDescription}
              />
            </View>
            <Pressable
              onPress={handleCreateOutcome}
              disabled={createOutcome.isPending || !outcomeTitle.trim()}
              className="mt-4 h-11 items-center justify-center rounded-md bg-primary disabled:opacity-50"
            >
              {createOutcome.isPending ? (
                <ActivityIndicator size="small" color="hsl(0 0% 9%)" />
              ) : (
                <Text className="text-sm font-medium text-primary-foreground">{t('createOutcome')}</Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}
