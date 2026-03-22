import { View, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { Card, CardContent } from '@/shared/components/ui/card';
import { IconCircle } from '@/shared/components/ui/icon-circle';
import { SectionHeader } from '@/shared/components/ui/section-header';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { TransactionItem } from '@features/finances/components/TransactionItem';
import { BudgetCard } from '@features/finances/components/BudgetCard';
import {
  useFinanceStats,
  useTransactions,
  useBudgets,
} from '@features/finances/hooks/useFinances';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  DollarSign,
  CreditCard,
  PiggyBank,
  Wallet as WalletIcon,
} from 'lucide-react-native';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function FinancesDashboard() {
  const { t } = useTranslation('features.finances');
  const { t: tCommon } = useTranslation('common');
  const { data: stats, isLoading: statsLoading } = useFinanceStats();
  const { data: transactionsData, isLoading: txLoading } = useTransactions({ pageSize: 5 });
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();

  const isLoading = statsLoading || txLoading || budgetsLoading;
  const recentTransactions = transactionsData?.data ?? [];
  const activeBudgets = budgets?.filter((b) => b.isActive).slice(0, 3) ?? [];

  if (isLoading) {
    return <LoadingOverlay message={tCommon('actions.loading')} />;
  }

  const balance = stats?.totalBalance ?? 0;
  const income = stats?.totalIncome ?? 0;
  const expenses = stats?.totalExpenses ?? 0;
  const net = income - expenses;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 pb-20"
      showsVerticalScrollIndicator={false}
    >
      {/* Balance Hero */}
      <Animated.View entering={FadeInDown.duration(300)}>
        <Card className="mt-1 border-primary/10">
          <CardContent>
            <Text className="text-xs text-muted-foreground">Total Balance</Text>
            <Text className="mt-1 text-3xl font-bold text-foreground">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Text className={`mt-1 text-xs font-medium ${net >= 0 ? 'text-success' : 'text-destructive'}`}>
              {net >= 0 ? '+' : ''}${net.toLocaleString('en-US', { minimumFractionDigits: 2 })} this month
            </Text>
          </CardContent>
        </Card>
      </Animated.View>

      {/* Cash Flow Cards */}
      <Animated.View entering={FadeInDown.delay(50).duration(300)} className="mt-3 flex-row gap-3">
        <View className="flex-1 rounded-xl border border-border bg-card p-3">
          <View className="flex-row items-center gap-2">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-success/15">
              <Icon as={TrendingUp} size={12} className="text-success" />
            </View>
            <Text className="text-2xs text-muted-foreground">Income</Text>
          </View>
          <Text className="mt-2 text-lg font-bold text-success">
            +${income.toLocaleString()}
          </Text>
        </View>

        <View className="flex-1 rounded-xl border border-border bg-card p-3">
          <View className="flex-row items-center gap-2">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-destructive/15">
              <Icon as={TrendingDown} size={12} className="text-destructive" />
            </View>
            <Text className="text-2xs text-muted-foreground">Expenses</Text>
          </View>
          <Text className="mt-2 text-lg font-bold text-destructive">
            -${expenses.toLocaleString()}
          </Text>
        </View>

        <View className="flex-1 rounded-xl border border-border bg-card p-3">
          <View className="flex-row items-center gap-2">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-primary/15">
              <Icon as={DollarSign} size={12} className="text-primary" />
            </View>
            <Text className="text-2xs text-muted-foreground">Net</Text>
          </View>
          <Text className={`mt-2 text-lg font-bold ${net >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {net >= 0 ? '+' : ''}${net.toLocaleString()}
          </Text>
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.delay(100).duration(300)} className="mt-6">
        <View className="flex-row justify-between">
          <Pressable
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 py-3 active:bg-destructive/10"
            onPress={() => router.push('/(app)/(tabs)/finances/transactions' as never)}
          >
            <Minus size={16} color="hsl(0, 72%, 51%)" />
            <Text className="text-sm font-medium text-destructive">Expense</Text>
          </Pressable>
          <View className="w-3" />
          <Pressable
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-success/20 bg-success/5 py-3 active:bg-success/10"
            onPress={() => router.push('/(app)/(tabs)/finances/transactions' as never)}
          >
            <Plus size={16} color="hsl(142, 71%, 45%)" />
            <Text className="text-sm font-medium text-success">Income</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Navigation Grid */}
      <Animated.View entering={FadeInDown.delay(150).duration(300)} className="mt-6 flex-row gap-3">
        <QuickNav icon={CreditCard} label="Accounts" route="/(app)/(tabs)/finances/accounts" />
        <QuickNav icon={WalletIcon} label="Debts" route="/(app)/(tabs)/finances/debts" />
        <QuickNav icon={PiggyBank} label="Savings" route="/(app)/(tabs)/finances/savings" />
      </Animated.View>

      {/* Recent Transactions */}
      <Animated.View entering={FadeInDown.delay(200).duration(300)} className="mt-6">
        <SectionHeader
          title="Recent Transactions"
          actionLabel="See all"
          onAction={() => router.push('/(app)/(tabs)/finances/transactions')}
        />
        {recentTransactions.length > 0 ? (
          <View className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
            {recentTransactions.map((tx, index) => (
              <View key={tx.id}>
                <TransactionItem transaction={tx} />
                {index < recentTransactions.length - 1 && <View className="mx-4 h-px bg-border" />}
              </View>
            ))}
          </View>
        ) : (
          <Card className="mt-3">
            <CardContent className="items-center py-6">
              <Icon as={DollarSign} size={32} className="text-muted-foreground/50" />
              <Text className="mt-2 text-sm text-muted-foreground">No transactions yet</Text>
            </CardContent>
          </Card>
        )}
      </Animated.View>

      {/* Active Budgets */}
      {activeBudgets.length > 0 && (
        <Animated.View entering={FadeInDown.delay(250).duration(300)} className="mt-6">
          <SectionHeader
            title="Active Budgets"
            actionLabel="See all"
            onAction={() => router.push('/(app)/(tabs)/finances/budgets')}
          />
          <View className="mt-3 gap-3">
            {activeBudgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} />
            ))}
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
}

function QuickNav({
  icon,
  label,
  route,
}: {
  icon: typeof CreditCard;
  label: string;
  route: string;
}) {
  return (
    <Pressable
      onPress={() => router.push(route as never)}
      className="flex-1 items-center rounded-xl border border-border bg-card py-4 active:bg-muted"
    >
      <IconCircle icon={icon} color="primary" size="sm" />
      <Text className="mt-2 text-xs font-medium text-foreground">{label}</Text>
    </Pressable>
  );
}
