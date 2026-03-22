import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Slot, usePathname, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { PillTabs } from '@/shared/components/ui/pill-tabs';
import { Plus } from 'lucide-react-native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { TransactionFormSheet } from '@features/finances/components/TransactionFormSheet';

export default function FinancesLayout() {
  const { t } = useTranslation('features.finances');
  const pathname = usePathname();
  const [showTransactionSheet, setShowTransactionSheet] = useState(false);

  const TABS = [
    { key: 'overview', label: 'Today' },
    { key: 'transactions', label: 'History' },
    { key: 'accounts', label: 'Accounts' },
    { key: 'budgets', label: 'Budgets' },
  ];

  const getActiveTab = useCallback(() => {
    if (pathname.includes('/transactions')) return 'transactions';
    if (pathname.includes('/accounts')) return 'accounts';
    if (pathname.includes('/budgets')) return 'budgets';
    if (pathname.includes('/debts')) return 'budgets';
    if (pathname.includes('/savings')) return 'budgets';
    return 'overview';
  }, [pathname]);

  const activeTab = getActiveTab();

  const handleTabPress = useCallback((key: string) => {
    const routes: Record<string, string> = {
      overview: '/(app)/(tabs)/finances/',
      transactions: '/(app)/(tabs)/finances/transactions',
      accounts: '/(app)/(tabs)/finances/accounts',
      budgets: '/(app)/(tabs)/finances/budgets',
    };
    router.replace(routes[key] as never);
  }, []);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-1 pt-3">
        <Text className="text-2xl font-bold text-foreground">{t('title')}</Text>
        <Pressable
          onPress={() => setShowTransactionSheet(true)}
          className="h-9 w-9 items-center justify-center rounded-full bg-primary active:bg-primary-hover"
          hitSlop={8}
        >
          <Icon as={Plus} size={18} className="text-primary-foreground" />
        </Pressable>
      </View>

      {/* Pill Tabs */}
      <View className="px-4 py-2">
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
