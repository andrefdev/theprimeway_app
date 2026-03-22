import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { Header } from '@/shared/components/layout/Header';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { AccountCard } from '@features/finances/components/AccountCard';
import { useAccounts } from '@features/finances/hooks/useFinances';
import { formatCurrency } from '@/shared/utils/currency';
import { CreditCard, Plus } from 'lucide-react-native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { FinanceAccount } from '@shared/types/models';

export default function AccountsScreen() {
  const { t } = useTranslation('features.finances');
  const { t: tCommon } = useTranslation('common');
  const { data: accounts, isLoading } = useAccounts();

  const totalBalance =
    accounts?.reduce((sum, acc) => sum + acc.currentBalance, 0) ?? 0;

  const renderAccount = ({ item }: { item: FinanceAccount }) => (
    <View className="px-4 pb-3">
      <AccountCard account={item} />
    </View>
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <Header
        title={t('accounts.title')}
        showBack
        rightAction={
          <Pressable hitSlop={8}>
            <Icon as={Plus} size={24} className="text-primary" />
          </Pressable>
        }
      />

      {isLoading ? (
        <LoadingOverlay message={tCommon('actions.loading')} />
      ) : !accounts || accounts.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={t('accounts.noAccountsFound')}
          description={t('accounts.noAccountsDescription')}
          actionLabel={t('accounts.add')}
          onAction={() => {}}
        />
      ) : (
        <>
          {/* Total Balance Header */}
          <View className="items-center border-b border-border px-4 pb-4">
            <Text className="text-xs text-muted-foreground">{t('totalBalance')}</Text>
            <Text className="text-2xl font-bold text-foreground">
              {formatCurrency(totalBalance)}
            </Text>
            <Text className="mt-0.5 text-xs text-muted-foreground">
              {accounts.length} {t('accounts.title')}
            </Text>
          </View>

          <FlatList
            data={accounts}
            renderItem={renderAccount}
            keyExtractor={(item) => item.id}
            contentContainerClassName="pt-4"
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}
