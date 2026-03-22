import { Screen, ScreenContent } from '@/shared/components/layout/Screen';
import { Header } from '@/shared/components/layout/Header';
import { Text } from '@/shared/components/ui/text';
import { Button } from '@/shared/components/ui/button';
import { Icon } from '@/shared/components/ui/icon';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { VisionCard } from '@/features/goals/components/VisionCard';
import { PillarCard } from '@/features/goals/components/PillarCard';
import { useVisions, usePillars } from '@/features/goals/hooks/useGoals';
import { PILLARS } from '@/shared/constants/pillars';
import { Plus, Target } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { PrimePillar } from '@shared/types/models';

export default function GoalsScreen() {
  const { t } = useTranslation('features.goals');
  const { t: tCommon } = useTranslation('common');

  const {
    data: visions,
    isLoading: visionsLoading,
    isError: visionsError,
    refetch: refetchVisions,
  } = useVisions();

  const {
    data: pillars,
    isLoading: pillarsLoading,
    isError: pillarsError,
    refetch: refetchPillars,
  } = usePillars();

  const isLoading = visionsLoading || pillarsLoading;
  const isError = visionsError || pillarsError;

  const vision = visions?.[0];

  // Map pillars by area for the grid, falling back to empty pillar stubs
  const pillarsByArea = new Map(
    (pillars ?? []).map((p) => [p.area, p])
  );

  const pillarGrid: PrimePillar[] = PILLARS.map(
    (config) =>
      pillarsByArea.get(config.area) ?? {
        id: `stub-${config.area}`,
        area: config.area,
        title: t(`areas.${config.area}`),
        outcomes: [],
      }
  );

  if (isLoading) {
    return (
      <Screen>
        <Header title={t('roadmap')} />
        <LoadingOverlay message={tCommon('actions.loading')} />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <Header title={t('roadmap')} />
        <ErrorState
          onRetry={() => {
            refetchVisions();
            refetchPillars();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        title={t('roadmap')}
        rightAction={
          <Button variant="ghost" size="icon">
            <Icon as={Plus} size={20} className="text-foreground" />
          </Button>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        <ScreenContent>
          {/* Vision Section */}
          {vision ? (
            <VisionCard vision={vision} className="mb-6" />
          ) : (
            <EmptyState
              icon={Target}
              title={t('primeVision')}
              description={t('description')}
              actionLabel={t('vision.form.create')}
              onAction={() => {}}
              className="mb-6 rounded-xl border border-dashed border-border bg-card py-8"
            />
          )}

          {/* Pillars Grid */}
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">{t('primePillars')}</Text>
            <Text className="text-xs text-muted-foreground">6 {t('area')}</Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {pillarGrid.map((pillar) => (
              <PillarCard
                key={pillar.id}
                pillar={pillar}
                className="w-[48%] flex-grow"
              />
            ))}
          </View>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}
