import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Slot, usePathname, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/shared/components/ui/icon';
import { PillTabs } from '@/shared/components/ui/pill-tabs';
import { Plus } from 'lucide-react-native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { TransactionFormSheet } from '@features/finances/components/TransactionFormSheet';
import { PageHeader } from '@features/personalization/components/PageHeader';

export default function FinancesLayout() {
  const { t } = useTranslation('features.finances');
  const pathname = usePathname();
  const [showTransactionSheet, setShowTransactionSheet] = useState(false);

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'transactions', label: 'History' },
    { key: 'accounts', label: 'Accounts' },
    { key: 'investments', label: 'Invest' },
    { key: 'analytics', label: 'Analytics' },
  ];

  const getActiveTab = useCallback(() => {
    if (pathname.includes('/transactions')) return 'transactions';
    if (pathname.includes('/accounts')) return 'accounts';
    if (pathname.includes('/investments')) return 'investments';
    if (pathname.includes('/analytics')) return 'analytics';
    if (pathname.includes('/budgets')) return 'overview';
    if (pathname.includes('/debts')) return 'overview';
    if (pathname.includes('/savings')) return 'overview';
    if (pathname.includes('/income')) return 'overview';
    if (pathname.includes('/pending')) return 'overview';
    if (pathname.includes('/recurring')) return 'overview';
    return 'overview';
  }, [pathname]);

  const activeTab = getActiveTab();

  const handleTabPress = useCallback((key: string) => {
    const routes: Record<string, string> = {
      overview: '/(app)/(tabs)/finances/',
      transactions: '/(app)/(tabs)/finances/transactions',
      accounts: '/(app)/(tabs)/finances/accounts',
      investments: '/(app)/(tabs)/finances/investments',
      analytics: '/(app)/(tabs)/finances/analytics',
    };
    router.replace(routes[key] as never);
  }, []);

  // The + always opens new transaction — it's the primary finance action.
  // Account/budget creation will be added as features are built out.
  const handleAdd = useCallback(() => {
    setShowTransactionSheet(true);
  }, []);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <PageHeader
        sectionId="finances"
        title={t('title')}
        actions={
          <Pressable
            onPress={handleAdd}
            className="h-10 w-10 items-center justify-center rounded-full bg-primary active:bg-primary-hover"
            hitSlop={8}
          >
            <Icon as={Plus} size={20} className="text-primary-foreground" />
          </Pressable>
        }
      />

      {/* Pill Tabs */}
      <View className="px-4 pb-3 pt-1">
        <PillTabs tabs={TABS} activeKey={activeTab} onTabPress={handleTabPress} />
      </View>

      {/* Content */}
      <Slot />

      {/* Transaction Form Sheet */}
      <TransactionFormSheet
        isOpen={showTransactionSheet}
        onClose={() => setShowTransactionSheet(false)}
      />
    </SafeAreaView>
  );
}
