import { useState } from 'react';
import { Screen, ScreenContent } from '@/shared/components/layout/Screen';
import { Header } from '@/shared/components/layout/Header';
import { Text } from '@/shared/components/ui/text';
import { Button } from '@/shared/components/ui/button';
import { Icon } from '@/shared/components/ui/icon';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useOutcomes, useFocuses, useCreateFocus } from '@/features/goals/hooks/useGoals';
import { Plus, Calendar, Target, ChevronRight, FileText } from 'lucide-react-native';
import { Pressable, View, Modal, TextInput, ActivityIndicator } from 'react-native';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { cn } from '@/shared/utils/cn';
import type { PrimeQuarterFocus } from '@shared/types/models';

const QUARTERS = [1, 2, 3, 4] as const;

export default function OutcomeDetailScreen() {
  const { t } = useTranslation('features.goals');
  const { t: tCommon } = useTranslation('common');
  const { locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: outcomes, isLoading: outcomesLoading, isError: outcomesError, refetch: refetchOutcomes } = useOutcomes();
  const { data: allFocuses, isLoading: focusesLoading, isError: focusesError, refetch: refetchFocuses } = useFocuses();
  const createFocus = useCreateFocus();

  const [showForm, setShowForm] = useState(false);
  const [focusTitle, setFocusTitle] = useState('');
  const [focusYear, setFocusYear] = useState(new Date().getFullYear());
  const [focusQuarter, setFocusQuarter] = useState<number>(Math.ceil((new Date().getMonth() + 1) / 3));

  const isLoading = outcomesLoading || focusesLoading;
  const isError = outcomesError || focusesError;

  const handleCreateFocus = async () => {
    if (!focusTitle.trim() || !id) return;
    await createFocus.mutateAsync({
      outcomeId: id,
      title: focusTitle.trim(),
      year: focusYear,
      quarter: focusQuarter,
    });
    setFocusTitle('');
    setShowForm(false);
  };

  const outcome = outcomes?.find((o) => o.id === id);
  const focuses = (allFocuses ?? []).filter((f) => f.outcomeId === id);

  const formattedTargetDate = outcome?.targetDate
    ? new Date(outcome.targetDate).toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
      })
    : null;

  if (isLoading) {
    return (
      <Screen>
        <Header title={t('outcome.title')} showBack />
        <LoadingOverlay message={tCommon('actions.loading')} />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <Header title={t('outcome.title')} showBack />
        <ErrorState
          onRetry={() => {
            refetchOutcomes();
            refetchFocuses();
          }}
        />
      </Screen>
    );
  }

  if (!outcome) {
    return (
      <Screen>
        <Header title={t('outcome.title')} showBack />
        <EmptyState
          icon={FileText}
          title={t('outcome.title')}
        />
      </Screen>
    );
  }

  const renderFocus = ({ item }: { item: PrimeQuarterFocus }) => (
    <Pressable
      onPress={() => router.push(`/(app)/(tabs)/goals/focus/${item.id}`)}
      className="mb-3 rounded-xl border border-border bg-card p-4 active:opacity-80"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="mb-1 flex-row items-center gap-2">
            <View className="rounded bg-primary/10 px-2 py-0.5">
              <Text className="text-xs font-semibold text-primary">
                Q{item.quarter} {item.year}
              </Text>
            </View>
          </View>
          <Text className="text-sm font-semibold text-card-foreground" numberOfLines={1}>
            {item.title}
          </Text>

          {/* Focus Progress */}
          <View className="mt-2 flex-row items-center gap-3">
            <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: `${item.progress ?? 0}%` }}
              />
            </View>
            <Text className="text-xs font-medium text-muted-foreground">
              {item.progress ?? 0}%
            </Text>
          </View>
        </View>

        <Icon as={ChevronRight} size={16} className="ml-2 text-muted-foreground" />
      </View>
    </Pressable>
  );

  return (
    <Screen>
      <Header
        title={t('outcome.title')}
        showBack
        rightAction={
          <Pressable onPress={() => setShowForm(true)} hitSlop={8}>
            <Icon as={Plus} size={20} className="text-foreground" />
          </Pressable>
        }
      />

      <ScreenContent className="flex-1">
        {/* Outcome Header */}
        <View className="mb-5 rounded-xl border border-border bg-card p-5">
          <View className="mb-3 flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon as={Target} size={20} className="text-primary" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-card-foreground">{outcome.title}</Text>
            </View>
          </View>

          {outcome.description && (
            <Text className="mb-3 text-sm leading-5 text-muted-foreground">
              {outcome.description}
            </Text>
          )}

          {/* Progress */}
          <View className="mb-3 flex-row items-center gap-3">
            <View className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: `${outcome.progress ?? 0}%` }}
              />
            </View>
            <Text className="text-sm font-semibold text-primary">
              {outcome.progress ?? 0}%
            </Text>
          </View>

          {/* Target Date */}
          {formattedTargetDate && (
            <View className="flex-row items-center gap-2">
              <Icon as={Calendar} size={14} className="text-muted-foreground" />
              <Text className="text-sm text-muted-foreground">
                {t('deadline')}: {formattedTargetDate}
              </Text>
            </View>
          )}
        </View>

        {/* Quarter Focuses */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-foreground">{t('primeFocuses')}</Text>
          <Text className="text-xs text-muted-foreground">
            {focuses.length} {t('focus.title')}
          </Text>
        </View>

        {focuses.length > 0 ? (
          <FlatList
            data={focuses}
            renderItem={renderFocus}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-8"
          />
        ) : (
          <EmptyState
            icon={Calendar}
            title={t('noQuarterlyGoals')}
            actionLabel={t('createFocus')}
            onAction={() => setShowForm(true)}
          />
        )}
      </ScreenContent>

      {/* Create Focus Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowForm(false)}
      >
        <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
          <Header
            title={t('createFocus')}
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
                value={focusTitle}
                onChangeText={setFocusTitle}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">{t('form.year')}</Text>
              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={() => setFocusYear((y) => y - 1)}
                  className="h-10 w-10 items-center justify-center rounded-md border border-border bg-background"
                >
                  <Text className="text-lg font-semibold text-foreground">-</Text>
                </Pressable>
                <Text className="min-w-[60px] text-center text-lg font-bold text-foreground">
                  {focusYear}
                </Text>
                <Pressable
                  onPress={() => setFocusYear((y) => y + 1)}
                  className="h-10 w-10 items-center justify-center rounded-md border border-border bg-background"
                >
                  <Text className="text-lg font-semibold text-foreground">+</Text>
                </Pressable>
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">{t('form.quarter')}</Text>
              <View className="flex-row gap-2">
                {QUARTERS.map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => setFocusQuarter(q)}
                    className={cn(
                      'flex-1 items-center rounded-md border border-border px-3 py-2',
                      focusQuarter === q && 'border-primary bg-primary/10',
                    )}
                  >
                    <Text
                      className={cn(
                        'text-sm text-muted-foreground',
                        focusQuarter === q && 'font-medium text-primary',
                      )}
                    >
                      Q{q}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleCreateFocus}
              disabled={createFocus.isPending || !focusTitle.trim()}
              className="mt-4 h-11 items-center justify-center rounded-md bg-primary disabled:opacity-50"
            >
              {createFocus.isPending ? (
                <ActivityIndicator size="small" color="hsl(0 0% 9%)" />
              ) : (
                <Text className="text-sm font-medium text-primary-foreground">{t('createFocus')}</Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}
