import { useState, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { Header } from '@/shared/components/layout/Header';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { TransactionItem } from '@features/finances/components/TransactionItem';
import { TransactionForm } from '@features/finances/components/TransactionForm';
import { useTransactions } from '@features/finances/hooks/useFinances';
import { cn } from '@/shared/utils/cn';
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Plus, X, Wallet } from 'lucide-react-native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { Transaction, TransactionType } from '@shared/types/models';

type FilterType = 'all' | TransactionType;

export default function TransactionsScreen() {
  const { t } = useTranslation('features.finances');
  const { t: tCommon } = useTranslation('common');

  const FILTERS: { value: FilterType; labelKey: string }[] = [
    { value: 'all', labelKey: 'transactions.filters.allTypes' },
    { value: 'income', labelKey: 'transactions.income' },
    { value: 'expense', labelKey: 'transactions.expense' },
    { value: 'transfer', labelKey: 'transactions.transfer' },
  ];

  const [filter, setFilter] = useState<FilterType>('all');
  const [showForm, setShowForm] = useState(false);

  const queryParams = filter === 'all' ? {} : { type: filter as TransactionType };
  const { data: transactionsData, isLoading } = useTransactions(queryParams);

  const transactions = transactionsData?.data ?? [];

  const handleFormSuccess = useCallback(() => {
    setShowForm(false);
  }, []);

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionItem transaction={item} />
  );

  const renderSeparator = () => <View className="mx-4 h-px bg-border" />;

  if (showForm) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <Header
          title={t('transactions.add')}
          showBack
          onBack={() => setShowForm(false)}
          rightAction={
            <Pressable onPress={() => setShowForm(false)} hitSlop={8}>
              <Icon as={X} size={24} className="text-muted-foreground" />
            </Pressable>
          }
        />
        <TransactionForm onSuccess={handleFormSuccess} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <Header
        title={t('transactions.title')}
        showBack
        rightAction={
          <Pressable onPress={() => setShowForm(true)} hitSlop={8}>
            <Icon as={Plus} size={24} className="text-primary" />
          </Pressable>
        }
      />

      {/* Filters */}
      <View className="border-b border-border px-4 pb-3">
        <View className="flex-row gap-2">
          {FILTERS.map((f) => (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value)}
              className={cn(
                'rounded-full px-4 py-1.5',
                filter === f.value ? 'bg-primary' : 'bg-muted',
              )}
            >
              <Text
                className={cn(
                  'text-xs font-medium',
                  filter === f.value ? 'text-primary-foreground' : 'text-muted-foreground',
                )}
              >
                {t(f.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <LoadingOverlay message={tCommon('actions.loading')} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={t('transactions.noTransactions')}
          description={t('transactions.latestActivity')}
          actionLabel={t('transactions.add')}
          onAction={() => setShowForm(true)}
        />
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={renderSeparator}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
