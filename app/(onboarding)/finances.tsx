import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/shared/components/ui/text';
import { Button } from '@/shared/components/ui/button';
import { Icon } from '@/shared/components/ui/icon';
import { cn } from '@/shared/utils/cn';
import { ChevronRight, Wallet, Check } from 'lucide-react-native';

type Currency = {
  code: string;
  symbol: string;
  name: string;
};

const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '\u20AC', name: 'Euro' },
  { code: 'GBP', symbol: '\u00A3', name: 'British Pound' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  { code: 'JPY', symbol: '\u00A5', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
];

const ACCOUNT_TYPES = [
  'Checking Account',
  'Savings Account',
  'Credit Card',
  'Cash',
  'Investment',
];

export default function FinancesScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [accountName, setAccountName] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pb-2 pt-6">
        <Text className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Step 4 of 5
        </Text>
        <Text className="mt-2 text-3xl font-bold text-foreground">
          Set up your finances
        </Text>
        <Text className="mt-2 text-base text-muted-foreground">
          Choose your currency and create your first financial account.
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerClassName="gap-6 pb-6 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Finance Icon */}
        <View className="items-center">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/15">
            <Icon as={Wallet} size={32} className="text-emerald-400" />
          </View>
        </View>

        {/* Currency Selection */}
        <View>
          <Text className="mb-3 text-sm font-medium text-foreground">
            Base currency
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {CURRENCIES.map((currency) => (
              <Pressable
                key={currency.code}
                onPress={() => setSelectedCurrency(currency.code)}
                className={cn(
                  'flex-row items-center gap-2 rounded-xl border border-border px-3 py-2.5',
                  selectedCurrency === currency.code &&
                    'border-emerald-400/40 bg-emerald-400/10'
                )}
              >
                <Text className="text-base font-semibold text-foreground">
                  {currency.symbol}
                </Text>
                <Text
                  className={cn(
                    'text-sm text-muted-foreground',
                    selectedCurrency === currency.code && 'text-foreground'
                  )}
                >
                  {currency.code}
                </Text>
                {selectedCurrency === currency.code && (
                  <Icon as={Check} size={14} className="text-emerald-400" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Account Name Input */}
        <View>
          <Text className="mb-2 text-sm font-medium text-foreground">
            Account name
          </Text>
          <TextInput
            value={accountName}
            onChangeText={setAccountName}
            placeholder="e.g., My Main Account"
            placeholderTextColor="hsl(0 0% 45%)"
            className="rounded-xl border border-border bg-muted/50 px-4 py-3.5 text-base text-foreground"
          />
        </View>

        {/* Account Type */}
        <View>
          <Text className="mb-3 text-sm font-medium text-foreground">
            Account type
          </Text>
          <View className="gap-2">
            {ACCOUNT_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => setSelectedAccountType(type)}
                className={cn(
                  'flex-row items-center justify-between rounded-xl border border-border px-4 py-3.5',
                  selectedAccountType === type &&
                    'border-emerald-400/40 bg-emerald-400/10'
                )}
              >
                <Text
                  className={cn(
                    'text-base text-muted-foreground',
                    selectedAccountType === type && 'text-foreground'
                  )}
                >
                  {type}
                </Text>
                {selectedAccountType === type && (
                  <Icon as={Check} size={18} className="text-emerald-400" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="flex-row items-center justify-between border-t border-border px-6 pb-6 pt-4">
        <Button
          variant="ghost"
          onPress={() => router.push('/(onboarding)/notes')}
        >
          <Text className="text-sm text-muted-foreground">Skip</Text>
        </Button>

        <Button
          size="lg"
          onPress={() => router.push('/(onboarding)/notes')}
          disabled={!selectedCurrency || accountName.trim().length === 0 || !selectedAccountType}
          className="min-w-[140px]"
        >
          <Text className="text-base font-semibold text-primary-foreground">
            Next
          </Text>
          <Icon as={ChevronRight} size={20} className="text-primary-foreground" />
        </Button>
      </View>
    </SafeAreaView>
  );
}
